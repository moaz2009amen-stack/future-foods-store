import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

// غيّر القيمة دي لدومين موقعك الحقيقي بعد ما تشتريه (أو رابط Vercel المؤقت لحد كده)
// ده بيتحط في NEXT_PUBLIC_SITE_URL جوه .env.local
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://future-foods-store.vercel.app";

const storeName = "سر السعادة ستور";
const storeNameEn = "Future Foods Store";
const description =
  "سر السعادة ستور (Future Foods Store) — اطلب أونلاين أطعمة مجمدة، وجبات سريعة، وحلويات بأفضل الأسعار وتوصيل سريع لباب البيت.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeName} | ${storeNameEn}`,
    template: `%s | ${storeName}`,
  },
  description,
  keywords: [
    "سر السعادة ستور",
    "Future Foods Store",
    "ماركت أونلاين",
    "توصيل طلبات",
    "أطعمة مجمدة",
    "وجبات سريعة",
    "حلويات",
    "دليفري",
  ],
  authors: [{ name: "Moaz" }],
  applicationName: storeName,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: storeName,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: storeName,
    title: `${storeName} | ${storeNameEn}`,
    description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: storeName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${storeName} | ${storeNameEn}`,
    description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#ef4444",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: storeName,
    alternateName: storeNameEn,
    url: siteUrl,
    image: `${siteUrl}/og-image.jpg`,
    logo: `${siteUrl}/icons/icon-512.png`,
    priceRange: "$$",
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cairo.variable} font-cairo antialiased`}>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}