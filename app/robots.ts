import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { checkoutEnabled } from "@/lib/store";

/** A test deploy (checkout off) asks crawlers to stay out; the live store points them to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (!checkoutEnabled) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
