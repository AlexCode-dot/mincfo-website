import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ContactReturnRestore from "@/components/system/ContactReturnRestore";
import { MotionProvider } from "@/components/system/MotionProvider";
import { getSharedText } from "@/content/homePageText";
import { HTML_LANG, OG_LOCALE } from "@/i18n/locale";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import LanguageSwitch from "@/i18n/LanguageSwitch";
import { getLocale } from "@/i18n/server";
import { SanityLive } from "@/sanity/lib/live";
import "@/styles/globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const shared = getSharedText(locale);
  return {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mincfo.com"),
  title: shared.siteMeta.title,
  description: shared.siteMeta.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    title: shared.siteMeta.title,
    description: shared.siteMeta.description,
    type: "website",
    url: "/",
    siteName: "MinCFO",
    locale: OG_LOCALE[locale],
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MinCFO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: shared.siteMeta.title,
    description: shared.siteMeta.description,
    images: ["/opengraph-image"],
  },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={HTML_LANG[locale]}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocaleProvider initialLocale={locale}>
          <MotionProvider>
            <ContactReturnRestore />
            <LanguageSwitch />
            {children}
            <SanityLive />
            <Analytics />
          </MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
