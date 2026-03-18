import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/system/MotionProvider";
import { HOME_PAGE_SHARED_TEXT } from "@/content/homePageText";
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
  title: HOME_PAGE_SHARED_TEXT.siteMeta.title,
  description: HOME_PAGE_SHARED_TEXT.siteMeta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
