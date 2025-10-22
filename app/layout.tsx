import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "100 Jenis Durian - Premium Malaysian Durian Supplier",
  description: "Discover over 100 varieties of premium Malaysian durian. Fresh, authentic, and delivered with care. Experience the king of fruits like never before.",
  keywords: ["durian", "musang king", "d24", "black thorn", "malaysian durian", "premium durian", "durian delivery"],
  authors: [{ name: "100 Jenis Durian" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Durian Farm",
  },
  openGraph: {
    title: "100 Jenis Durian - Premium Malaysian Durian",
    description: "Discover over 100 varieties of premium Malaysian durian",
    type: "website",
    locale: "en_MY",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {/* ARIA live region for screen reader announcements */}
          <div id="aria-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
          {/* Toast notifications */}
          <ToastProvider />
          {/* PWA Components */}
          <PWAInstallPrompt />
          <OfflineIndicator />
          {children}
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful:', registration.scope);
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed:', err);
                  }
                );
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
