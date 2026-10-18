import "server-only";

/**
 * Who sells on this site, for the legal pages and the footer. Set in the environment so the
 * seller changes with the Shopify store (the test store today, Parla's own store later) without
 * touching code. Missing fields render as a visible placeholder and mark the pages as a draft.
 */
export type Seller = {
  /** Store name shown to customers */
  store: string;
  /** Legal name of the person or company that charges and invoices */
  legalName: string | null;
  /** NIT or cédula */
  taxId: string | null;
  email: string | null;
  whatsapp: string | null;
  city: string | null;
  address: string | null;
  /** Delivery estimate as customers should read it, e.g. "entre 2 y 6 días hábiles" */
  shippingTime: string | null;
};

const value = (name: string) => process.env[name]?.trim() || null;

export function getSeller(): Seller {
  return {
    store: value("SELLER_STORE_NAME") ?? "Parla",
    legalName: value("SELLER_LEGAL_NAME"),
    taxId: value("SELLER_TAX_ID"),
    email: value("SELLER_EMAIL"),
    whatsapp: value("SELLER_WHATSAPP"),
    city: value("SELLER_CITY"),
    address: value("SELLER_ADDRESS"),
    shippingTime: value("SELLER_SHIPPING_TIME")
  };
}

/** True when every field a customer needs to identify and reach the seller is set. */
export function isSellerComplete(seller: Seller) {
  return Boolean(seller.legalName && seller.taxId && seller.email && seller.whatsapp && seller.city && seller.address);
}
