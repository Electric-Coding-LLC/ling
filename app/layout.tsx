import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegistration } from "./pwa-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ling",
  description: "Ling",
  applicationName: "Ling",
  manifest: "/manifest-13187544.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ling",
  },
  icons: {
    icon: "/favicon-e107a3b1.svg",
    shortcut: "/favicon-e107a3b1.svg",
    apple: "/icons/apple-touch-icon-b2b1acaf.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#11110f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
