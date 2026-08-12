import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getAppVersion } from "../src/modules/app-version";
import { BootReady } from "./boot-ready";
import { NavigationFeedbackProvider } from "./navigation-feedback";
import { PwaCleanup } from "./pwa-cleanup";
import { PwaExperience } from "./pwa-experience";
import { StationNextFooter } from "./stations/station-next-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const safariInstallIcon =
  "https://raw.githubusercontent.com/Electric-Coding-LLC/ling/f61a7185f12ab1d7970aca4b8d9199b74a0a749d/public/icons/icon-512-31fddff6.png";

const safariStartupImage =
  "https://raw.githubusercontent.com/Electric-Coding-LLC/ling/main/public/launch/ling-launch-335166a4.png";

export const metadata: Metadata = {
  title: "Ling",
  description: "Ling",
  applicationName: "Ling",
  manifest: "/manifest-69f375db.webmanifest",
  appleWebApp: {
    capable: true,
    startupImage: safariStartupImage,
    statusBarStyle: "default",
    title: "Ling",
  },
  icons: {
    icon: "/favicon-e107a3b1.svg",
    shortcut: "/favicon-e107a3b1.svg",
    apple: [{ url: safariInstallIcon, sizes: "512x512", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#171714",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appVersion = getAppVersion();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationFeedbackProvider>
          {children}
          <StationNextFooter />
        </NavigationFeedbackProvider>
        <BootReady />
        <PwaCleanup />
        <PwaExperience {...appVersion} />
      </body>
    </html>
  );
}
