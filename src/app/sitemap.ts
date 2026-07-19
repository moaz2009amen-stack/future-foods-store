import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://future-foods-store.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: sections }] = await Promise.all([
    supabase.from("products").select("id, updated_at").eq("status", "available"),
    supabase.from("categories").select("id"),
    supabase.from("home_sections").select("id").eq("is_active", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${siteUrl}/category/${c.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const sectionPages: MetadataRoute.Sitemap = (sections ?? []).map((s) => ({
    url: `${siteUrl}/section/${s.id}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/product/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...sectionPages, ...productPages];
}