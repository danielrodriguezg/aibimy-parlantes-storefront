import "server-only";

/**
 * Who sells on this site, for the legal pages. Set in the environment (SELLER_*) so the seller
 * follows the connected Shopify store (the borrowed test store today, Luzunido's own later)
 * without touching code. A missing field shows as a bracketed placeholder and keeps the legal
 * pages marked as a draft.
 */
const value = (name: string) => process.env[name]?.trim() || null;
const or = (name: string, placeholder: string) => value(name) ?? `[${placeholder}]`;

const required = ["SELLER_LEGAL_NAME", "SELLER_TAX_ID", "SELLER_EMAIL", "SELLER_WHATSAPP", "SELLER_CITY", "SELLER_ADDRESS"];

export const SELLER = {
  brand: value("SELLER_STORE_NAME") ?? "Luzunido",
  legalName: or("SELLER_LEGAL_NAME", "Nombre o razón social"),
  taxId: or("SELLER_TAX_ID", "NIT o cédula"),
  email: or("SELLER_EMAIL", "correo de contacto"),
  whatsapp: or("SELLER_WHATSAPP", "WhatsApp"),
  city: or("SELLER_CITY", "Ciudad"),
  address: or("SELLER_ADDRESS", "Dirección de notificación"),
  /** Delivery estimate as customers read it, e.g. "2 a 6 días hábiles". */
  shippingTime: or("SELLER_SHIPPING_TIME", "X a Y días hábiles"),
  updated: or("SELLER_POLICY_DATE", "fecha de publicación"),
  /** Draft until every seller field is set; a lawyer reviews the texts before real sales. */
  draft: required.some((name) => !value(name))
};
