import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import Analytics from "@/components/analytics/Analytics";
import { getStoreSettings } from "@/lib/settings";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://future-foods-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "سر السعادة ستور | Future Foods Store — كل احتياجاتك اليومية أونلاين",
    template: "%s | سر السعادة ستور",
  },
  description:
    "اطلب مجمدات وحلويات ووجبات جاهزة أونلاين من سر السعادة ستور، وتوصلك لباب البيت في نفس اليوم. تصفح كل الأقسام واطلب دلوقتي.",
  keywords: ["سر السعادة ستور", "Future Foods Store", "ماركت أونلاين", "توصيل طلبات", "مجمدات", "حلويات"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سر السعادة ستور",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "سر السعادة ستور",
    title: "سر السعادة ستور | Future Foods Store",
    description: "اطلب مجمدات وحلويات ووجبات جاهزة أونلاين، وتوصلك لباب البيت في نفس اليوم.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "سر السعادة ستور" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "سر السعادة ستور | Future Foods Store",
    description: "اطلب مجمدات وحلويات ووجبات جاهزة أونلاين، وتوصلك لباب البيت في نفس اليوم.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ef4444",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: settings.store_name_en || "Future Foods Store",
    alternateName: settings.store_name,
    url: siteUrl,
    ...(settings.logo_url ? { image: settings.logo_url, logo: settings.logo_url } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address ? { address: { "@type": "PostalAddress", streetAddress: settings.address } } : {}),
    ...(settings.working_hours ? { openingHours: settings.working_hours } : {}),
    priceRange: "$$",
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${cairo.variable} font-cairo antialiased`}>
        {children}
        <PWARegister />
        <Suspense fallback={null}>
          <Analytics metaPixelId={settings.meta_pixel_id} ga4Id={settings.ga4_measurement_id} />
        </Suspense>
      </body>
    </html>
  );
}
