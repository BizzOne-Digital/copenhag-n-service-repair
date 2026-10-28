import type { MetadataRoute } from "next";
import { services } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    "",
    "/services",
    "/about",
    "/contact",
    "/booking",
    ...(await services()).map((s) => "/services/" + s.slug),
  ].map((path) => ({
    url: base + path,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
