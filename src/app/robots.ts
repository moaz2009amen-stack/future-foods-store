import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://future-foods-store.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // صفحات لوحة التحكم والسلة الشخصية ملهاش لازمة تتفهرس في جوجل
        disallow: ["/admin", "/cart", "/checkout", "/track", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}