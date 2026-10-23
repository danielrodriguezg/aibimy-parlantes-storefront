import type { MetadataRoute } from "next";
import { LEGAL } from "@/components/legal/content";
import { getProducts } from "@/lib/shopify";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...products.map((product) => ({
      url: `${SITE_URL}/parlantes/${product.handle}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
      images: product.featuredImage ? [product.featuredImage.url] : undefined
    })),
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE_URL}/legal/${slug}`, changeFrequency: "yearly" as const, priority: 0.2 }))
  ];
}
