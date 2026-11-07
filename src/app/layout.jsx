import "./globals.css";
import { Providers } from "@/providers";
import { OfflineIndicator } from "@/components/offline-indicator";
import { SiteHeader } from "@/components/site-header";
// import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export const metadata = {
  title: "Kita Daie",
  description: "Kita Daie Application",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kita Daie",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1E40AF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="flex min-h-svh flex-col font-sans antialiased">
        <Providers>
          <SiteHeader />
          <div className="min-h-0 flex-1">
            {children}
          </div>
          <OfflineIndicator />
          {/* Uncomment this to enable PWA Install Prompt */}
          {/* <PWAInstallPrompt /> */}
        </Providers>
      </body>
    </html>
  );
}
