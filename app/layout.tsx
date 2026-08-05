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

const safariStartupImageBase =
  "https://raw.githubusercontent.com/Electric-Coding-LLC/ling/main/public/launch";

const safariStartupImages = [
  {
    url: `${safariStartupImageBase}/ling-launch-320x568-2x-39c30353.png`,
    media:
      "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-375x667-2x-5711582e.png`,
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-375x812-3x-23960e55.png`,
    media:
      "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-414x896-2x-7e10b22b.png`,
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-414x896-3x-1f32d635.png`,
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-360x780-3x-bcfaf4de.png`,
    media:
      "(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-390x844-3x-c5a67826.png`,
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-428x926-3x-575fbf63.png`,
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-393x852-3x-c38e45ee.png`,
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-430x932-3x-cbbe2807.png`,
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-402x874-3x-9f5237cb.png`,
    media:
      "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-440x956-3x-d6db97d4.png`,
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)",
  },
  {
    url: `${safariStartupImageBase}/ling-launch-420x912-3x-e94e54e2.png`,
    media:
      "(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3)",
  },
];

export const metadata: Metadata = {
  title: "Ling",
  description: "Ling",
  applicationName: "Ling",
  manifest: "/manifest-69f375db.webmanifest",
  appleWebApp: {
    capable: true,
    startupImage: safariStartupImages,
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
