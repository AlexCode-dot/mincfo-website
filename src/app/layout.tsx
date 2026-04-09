import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ContactReturnRestore from "@/components/system/ContactReturnRestore";
import { MotionProvider } from "@/components/system/MotionProvider";
import { HOME_PAGE_SHARED_TEXT } from "@/content/homePageText";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mincfo.com"),
  title: HOME_PAGE_SHARED_TEXT.siteMeta.title,
  description: HOME_PAGE_SHARED_TEXT.siteMeta.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    title: HOME_PAGE_SHARED_TEXT.siteMeta.title,
    description: HOME_PAGE_SHARED_TEXT.siteMeta.description,
    type: "website",
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
    title: HOME_PAGE_SHARED_TEXT.siteMeta.title,
    description: HOME_PAGE_SHARED_TEXT.siteMeta.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MotionProvider>
          <ContactReturnRestore />
          {children}
          <SanityLive />
          <Analytics />
        </MotionProvider>
      </body>
    </html>
  );
}
