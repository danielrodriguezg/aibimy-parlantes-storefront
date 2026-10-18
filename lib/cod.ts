import "server-only";
import { DEPARTMENTS, normalizeMobile } from "@/lib/colombia";
import { MAX_LINE_QUANTITY, getProducts } from "@/lib/shopify";
import type { CartLine } from "@/lib/types";

/**
 * Cash on delivery ("contra entrega"): the customer leaves name, phone and address, we create the
 * order in Shopify with payment pending and the "contraentrega" tag, and Dropi ships it and the
 * carrier collects the money on delivery. Needs SHOPIFY_ADMIN_ACCESS_TOKEN (write_orders) on the
 * store that sells, plus COD_ORDERS_ENABLED=true: a token alone (say, one left over for a store we
 * only borrow for testing) never creates real orders. Without both, the form answers "not available yet".
 */

export type CodRequest = {
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  neighborhood: string;
  notes: string;
  lines: CartLine[];
};

export type CodResult = { ok: true; orderName: string } | { ok: false; status: number; error: string };

const MAX_LINES = 5;
const FAILED = "No pudimos registrar el pedido. Intenta de nuevo o escríbenos por WhatsApp.";
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "");

export const codConfigured = () =>
  process.env.COD_ORDERS_ENABLED === "true" && Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);

/** Checks the form and returns clean values, or the first problem in words the customer understands. */
export function parseCodRequest(body: unknown): { value: CodRequest } | { error: string } {
  const input = (body ?? {}) as Record<string, unknown>;
  // Honeypot: people never see this field, bots fill it.
  if (text(input.website, 100)) return { error: "No pudimos recibir el pedido." };

  const name = text(input.name, 80);
  const phone = normalizeMobile(text(input.phone, 20));
  const province = text(input.province, 3).toUpperCase();
  const city = text(input.city, 60);
  const address = text(input.address, 120);
  const neighborhood = text(input.neighborhood, 60);
  const notes = text(input.notes, 300);
  const lines = (Array.isArray(input.lines) ? input.lines : [])
    .slice(0, MAX_LINES)
    .filter((line): line is CartLine => typeof line?.variantId === "string" && Number.isFinite(line?.quantity))
    .map(({ variantId, quantity }) => ({ variantId, quantity: Math.min(Math.max(1, Math.floor(quantity)), MAX_LINE_QUANTITY) }));

  if (name.split(" ").filter(Boolean).length < 2) return { error: "Escribe tu nombre y apellido." };
  if (!phone) return { error: "Escribe un celular colombiano de 10 dígitos." };
  if (!DEPARTMENTS.some((department) => department.code === province)) return { error: "Elige tu departamento." };
  if (city.length < 2) return { error: "Escribe tu ciudad o municipio." };
  if (address.length < 6) return { error: "Escribe la dirección completa." };
  if (!lines.length) return { error: "No hay productos en el pedido." };
  return { value: { name, phone, province, city, address, neighborhood, notes, lines } };
}

const ORDER_CREATE = `#graphql
  mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order { id name }
      userErrors { field message }
    }
  }
`;

export async function createCodOrder(request: CodRequest): Promise<CodResult> {
  if (!codConfigured()) return { ok: false, status: 503, error: "El pago contra entrega todavía no está habilitado." };

  // Only variants sold here and in stock; Shopify prices them, never the browser.
  const products = await getProducts();
  const sellable = new Set(products.flatMap((product) => product.variants.filter((v) => v.availableForSale).map((v) => v.id)));
  const lineItems = request.lines.filter((line) => sellable.has(line.variantId)).map(({ variantId, quantity }) => ({ variantId, quantity }));
  if (!lineItems.length) return { ok: false, status: 409, error: "Ese producto ya no está disponible." };

  const [firstName, ...rest] = request.name.split(" ");
  const phone = `+57${request.phone}`;
  const address = {
    firstName,
    lastName: rest.join(" "),
    address1: request.address,
    address2: request.neighborhood || undefined,
    city: request.city,
    provinceCode: request.province,
    countryCode: "CO",
    phone
  };
  const fee = Number(process.env.NEXT_PUBLIC_COD_SHIPPING_FEE || 0);

  const domain = process.env.SHOPIFY_STORE_DOMAIN!.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const version = process.env.SHOPIFY_ADMIN_API_VERSION || "2025-07";
  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN! },
    body: JSON.stringify({
      query: ORDER_CREATE,
      variables: {
        order: {
          lineItems,
          phone,
          shippingAddress: address,
          billingAddress: address,
          financialStatus: "PENDING",
          tags: ["contraentrega", "luzunido"],
          note: ["Pago contra entrega.", request.notes].filter(Boolean).join(" "),
          ...(fee > 0 ? { shippingLines: [{ title: "Envío contra entrega", priceSet: { shopMoney: { amount: fee, currencyCode: "COP" } } }] } : {})
        },
        options: { sendReceipt: false }
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("cod order failed", response.status);
    return { ok: false, status: 502, error: FAILED };
  }
  const payload = (await response.json()) as {
    data?: { orderCreate: { order: { name: string } | null; userErrors: Array<{ message: string }> } };
    errors?: Array<{ message: string }>;
  };
  const result = payload.data?.orderCreate;
  if (payload.errors?.length || !result?.order) {
    console.error("cod order rejected", payload.errors ?? result?.userErrors);
    return { ok: false, status: 502, error: FAILED };
  }
  return { ok: true, orderName: result.order.name };
}
