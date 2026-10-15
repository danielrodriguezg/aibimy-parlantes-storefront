import "server-only";
import type { CartLine, Product, ProductImage, ProductVariant } from "@/lib/types";

const DEFAULT_API_VERSION = "2025-07";
const DEFAULT_PRODUCT_QUERY = "vendor:Aibimy AND product_type:Parlantes";
const DEFAULT_REVALIDATE_SECONDS = 300;
export const MAX_LINE_QUANTITY = 20;

export function isShopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

function getEndpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || DEFAULT_API_VERSION;
  return `https://${domain}/api/${version}/graphql.json`;
}

type GraphqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, { mutation = false } = {}) {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  const response = await fetch(getEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    // Mutations (cartCreate) run in route handlers and are never cached.
    ...(mutation
      ? { cache: "no-store" as const }
      : { next: { revalidate: Number(process.env.SHOPIFY_REVALIDATE_SECONDS || DEFAULT_REVALIDATE_SECONDS), tags: ["shopify"] } })
  });

  if (!response.ok) throw new Error(`Shopify returned ${response.status}`);

  const payload = (await response.json()) as GraphqlResponse<T>;
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("; "));
  if (!payload.data) throw new Error("Shopify returned no data");
  return payload.data;
}

const IMAGE_FIELDS = `url altText width height`;
const MONEY_FIELDS = `amount currencyCode`;

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  vendor
  availableForSale
  featuredImage { ${IMAGE_FIELDS} }
  images(first: 12) { nodes { ${IMAGE_FIELDS} } }
  priceRange {
    minVariantPrice { ${MONEY_FIELDS} }
    maxVariantPrice { ${MONEY_FIELDS} }
  }
  variants(first: 25) {
    nodes {
      id
      title
      availableForSale
      price { ${MONEY_FIELDS} }
      compareAtPrice { ${MONEY_FIELDS} }
      image { ${IMAGE_FIELDS} }
      selectedOptions { name value }
    }
  }
`;

const PRODUCTS_QUERY = `#graphql
  query Products($query: String!) {
    products(first: 50, query: $query, sortKey: TITLE) {
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

type RawProduct = Omit<Product, "images" | "variants"> & {
  images: { nodes: ProductImage[] };
  variants: { nodes: ProductVariant[] };
};

function normalizeProduct(raw: RawProduct): Product {
  return { ...raw, images: raw.images.nodes, variants: raw.variants.nodes };
}

/** Products sold on this site: everything matching SHOPIFY_PRODUCT_QUERY (the AIBIMY speakers). */
export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>(PRODUCTS_QUERY, {
    query: process.env.SHOPIFY_PRODUCT_QUERY || DEFAULT_PRODUCT_QUERY
  });
  return data.products.nodes.map(normalizeProduct);
}

// Product pages resolve through the same list so a handle outside the query can't be sold here.
export async function getProductByHandle(handle: string) {
  const products = await getProducts();
  return products.find((product) => product.handle === handle) ?? null;
}

/** Creates a Shopify cart and returns its hosted checkout URL; the order lands in Shopify, where Dropi picks it up. */
export async function createCheckout(lines: CartLine[]) {
  const products = await getProducts();
  const sellable = new Set(products.flatMap((product) => product.variants.filter((v) => v.availableForSale).map((v) => v.id)));

  const validLines = lines
    .filter((line) => sellable.has(line.variantId))
    .map((line) => ({
      merchandiseId: line.variantId,
      quantity: Math.min(Math.max(1, Math.floor(line.quantity)), MAX_LINE_QUANTITY)
    }));

  if (!validLines.length) throw new Error("No hay productos disponibles en el carrito.");

  const data = await shopifyFetch<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(
    CART_CREATE_MUTATION,
    {
      input: {
        lines: validLines,
        attributes: [{ key: "checkout_source", value: "aibimy_parlantes" }]
      }
    },
    { mutation: true }
  );

  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((error) => error.message).join("; "));
  }
  if (!data.cartCreate.cart?.checkoutUrl) throw new Error("Shopify no devolvio la URL de pago.");
  return data.cartCreate.cart.checkoutUrl;
}
