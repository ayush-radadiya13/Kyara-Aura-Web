import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import SmoothScrollProvider from "@/providers/smooth-scroll-provider";
import ConditionalFooter from "@/components/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kyara Aura Jewellery",
  description:
    "Luxury jewellery storefront built with Next.js and Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <QueryProvider>
          <SmoothScrollProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <ConditionalFooter />
            </div>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
