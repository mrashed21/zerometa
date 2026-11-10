import { JsonLd } from "@/components/json-ld";
import { ToastContextProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ─── Fonts

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// ─── Metadata

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zerometa.tech"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "ZeroMeta — Your Files. Your Privacy. Zero Metadata.",
    template: "%s | ZeroMeta",
  },
  description:
    "Remove hidden metadata, GPS coordinates, device information, and unwanted digital footprints from your media files. Client-side privacy toolkit.",
  keywords: [
    "ZeroMeta",
    "metadata remover",
    "EXIF remover",
    "GPS remover",
    "remove photo location",
    "metadata viewer",
    "PDF metadata cleaner",
    "privacy toolkit",
    "media privacy",
    "strip EXIF",
    "Muhammad Rashed",
    "Founder of ZeroMeta",
  ],
  authors: [
    { name: "Muhammad Rashed", url: "https://www.mrashed21.me/" },
    { name: "ZeroMeta Privacy Team", url: "https://www.zerometa.tech" },
  ],
  creator: "Muhammad Rashed",
  publisher: "ZeroMeta",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    title: "ZeroMeta — Your Files. Your Privacy. Zero Metadata.",
    description:
      "Inspect, remove, compare, and edit metadata from images, videos, audio, and documents with maximum privacy and zero tracking.",
    siteName: "ZeroMeta",
    url: "https://www.zerometa.tech",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "ZeroMeta Privacy Shield Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroMeta — Digital Media Privacy Toolkit",
    description:
      "Strip EXIF, GPS location, and sensitive device data from images, videos, audio, and PDFs.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("light", inter.variable)}>
      <body
        className={cn(
          "app-background text-foreground antialiased selection:bg-blue-100 selection:text-blue-900",
          inter.className,
        )}
      >
        <JsonLd />
        <ToastContextProvider>{children}</ToastContextProvider>
      </body>
    </html>
  );
}
