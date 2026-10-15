export type Money = { amount: string; currencyCode: string };

export type ProductImage = { url: string; altText: string | null; width: number; height: number };

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  image: ProductImage | null;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  variants: ProductVariant[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
};

export type CartLine = { variantId: string; quantity: number };
