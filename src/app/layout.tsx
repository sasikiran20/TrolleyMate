import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegister } from "@/components/sw-register";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrolleyMate AU — Compare grocery prices",
  description:
    "Compare prices across Woolworths, Coles, ALDI, IGA, Big W, Kmart, Target & Costco. Find the cheapest groceries near you, online or in-store.",
  applicationName: "TrolleyMate",
  appleWebApp: {
    capable: true,
    title: "TrolleyMate",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[color:var(--surface)] text-foreground">
        <AppHeader />
        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 pb-24 sm:pb-16">
          {children}
        </main>
        <SiteFooter />
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
