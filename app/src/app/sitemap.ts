import type { MetadataRoute } from "next";
import { INDICATORS, PROVINCES, SITE_URL } from "@/lib/data";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL || "http://localhost:3000";
  const paths = ["/", "/indicators/", "/regions/", "/explorer/", "/methodology/", "/about/", ...INDICATORS.map((i) => `/indicators/${i.id}/`), ...PROVINCES.map((p) => `/regions/${p.geo_code}/`)];
  return paths.map((p) => ({ url: base + p, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.7 }));
}
