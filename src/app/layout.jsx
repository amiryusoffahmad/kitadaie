import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { OfflineIndicator } from "@/components/offline-indicator";
// import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const arabic = Noto_Sans_Arabic({
  variable: "--font-arabic-loaded",
  subsets: ["arabic"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata = {
  title: "Kita Daie",
  description: "Kita Daie Application",
  manifest: "/manifest.json",
  icons: { icon: "/brand/app-icon-192.png", apple: "/brand/app-icon-192.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kita Daie",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms" className={arabic.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/brand/app-icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className='antialiased'
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
