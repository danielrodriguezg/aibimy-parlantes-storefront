/**
 * Checkout only takes orders when it is switched on: always in development, and in production
 * only with NEXT_PUBLIC_CHECKOUT_ENABLED=true. While the site runs on a borrowed Shopify for
 * testing, a deploy shows the catalogue but can't send real orders to that store.
 */
export const checkoutEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
