import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileQuestion,
  Home,
  ArrowRight,
  Eraser,
  Camera,
  MapPin,
  FileText,
  Shield,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | ZeroMeta",
  description: "The page or tool you are looking for does not exist on ZeroMeta.",
};

const POPULAR_TOOLS = [
  {
    title: "Metadata Remover",
    href: "/metadata-remover",
    description: "Strip EXIF, GPS, IPTC, and XMP metadata from your files.",
    icon: Eraser,
  },
  {
    title: "EXIF Remover",
    href: "/exif-remover",
    description: "Purge digital camera models, lens data, and shooting timestamps.",
    icon: Camera,
  },
  {
    title: "GPS Location Remover",
    href: "/gps-remover",
    description: "Clear satellite latitude, longitude, and altitude geotags.",
    icon: MapPin,
  },
  {
    title: "PDF Metadata Cleaner",
    href: "/pdf-metadata-remover",
    description: "Sanitize PDF document properties, author tags, and XMP streams.",
    icon: FileText,
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
          {/* 404 Hero Card */}
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Error 404</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 font-sans">
                Page Not Found
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-lg mx-auto">
                The privacy tool, guide, or page you were looking for doesn&apos;t exist or may have been relocated.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="btn-primary h-11 px-6 text-sm font-semibold rounded-lg shadow-sm w-full sm:w-auto">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Homepage
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-6 text-sm font-medium rounded-lg border-neutral-300 hover:bg-neutral-50 w-full sm:w-auto">
                <Link href="/metadata-remover">
                  Explore Privacy Tools
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Popular Tools Section */}
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-neutral-900">
                Popular Privacy Tools
              </h2>
              <p className="text-xs text-neutral-600">
                Looking for a specific metadata tool? Try one of our core utilities:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {POPULAR_TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group block focus:outline-none">
                  <Card className="bg-white border border-neutral-200 rounded-xl h-full transition-all duration-150 hover:border-neutral-300 hover:shadow-sm">
                    <CardContent className="p-5 space-y-3 flex flex-col justify-between h-full">
                      <div className="space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <tool.icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Guides Link */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-neutral-700">
              <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Looking for privacy documentation or technical guides?</p>
                <p className="text-neutral-500">Read our guides on EXIF metadata, GPS removal, and watermarking.</p>
              </div>
            </div>
            <Link
              href="/guides"
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 shrink-0"
            >
              <span>Browse Knowledge Base</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

