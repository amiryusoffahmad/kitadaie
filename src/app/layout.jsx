import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { OfflineIndicator } from "@/components/offline-indicator";
// import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kita Daie",
  description: "Kita Daie Application",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kita Daie",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
      >
        <Providers>
          {children}
          <OfflineIndicator />
          {/* Uncomment this to enable PWA Install Prompt */}
          {/* <PWAInstallPrompt /> */}
        </Providers>
      </body>
    </html>
  );
}
