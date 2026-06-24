import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "lenis/dist/lenis.css";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import SmoothScrollProvider from "@/providers/smooth-scroll-provider";
import ConditionalFooter from "@/components/ConditionalFooter";
import GlobalPendingLoader from "@/components/GlobalPendingLoader";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  getSiteUrl,
  metadataForPage,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: getSiteUrl(),
  applicationName: SITE_NAME,
  icons: {
    icon: "/assets/ka1.png",
    shortcut: "/assets/ka1.png",
    apple: "/assets/ka1.png",
  },
  ...metadataForPage({
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    path: "/",
  }),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <GoogleAnalytics />
        <QueryProvider>
          <SmoothScrollProvider>
            <Suspense fallback={null}>
              <GlobalPendingLoader />
            </Suspense>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <ConditionalFooter />
              <WhatsAppFloatButton />
              <Toaster />
            </div>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
