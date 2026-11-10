import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Layers, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is Image Metadata? EXIF vs IPTC vs XMP vs C2PA | ZeroMeta",
  description: "A complete technical guide comparing image metadata formats: EXIF, IPTC, Adobe XMP, and the modern C2PA Content Credentials standard.",
  alternates: {
    canonical: "/guides/what-is-image-metadata",
  },
};

export default function WhatIsImageMetadataGuide() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <Link href="/guides" className="hover:text-foreground">Guides</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">Image Metadata Standards</span>
          </nav>

          <div className="space-y-4">
            <Badge className="badge-brand">Architecture & Standards</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              What is Image Metadata? EXIF vs IPTC vs XMP vs C2PA
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Digital images are not just arrays of colored pixels. Underneath lies an intricate ecosystem of metadata specifications authored by camera makers, news agencies, and software vendors.
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                1. The Four Major Metadata Standards
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground text-sm">A. EXIF (Exchangeable Image File Format)</h3>
                  <p className="text-xs text-muted-foreground">
                    Written by hardware sensors and lenses at capture time. Records technical camera settings, focal length, ISO, shutter speed, and GPS coordinates.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground text-sm">B. IPTC-IIM (International Press Telecommunications Council)</h3>
                  <p className="text-xs text-muted-foreground">
                    Designed in the 1990s for newsrooms and photojournalists. Stores caption descriptions, creator credits, copyright notices, and editorial tags.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground text-sm">C. Adobe XMP (Extensible Metadata Platform)</h3>
                  <p className="text-xs text-muted-foreground">
                    An XML-based standard created by Adobe in 2001. Embeds non-destructive editing history, crop parameters, rating stars, and Dublin Core descriptors directly into files.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground text-sm">D. C2PA / Content Credentials (Coalition for Content Provenance and Authenticity)</h3>
                  <p className="text-xs text-muted-foreground">
                    The modern cryptographic authenticity standard backed by Adobe, Microsoft, Google, and camera manufacturers. Embeds signed provenance manifests documenting capture devices, edits, and generative AI creation tools.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                2. C2PA and Removing Content Credentials
              </h2>
              <p>
                C2PA metadata is designed to establish trust by verifying who created an image and whether generative AI was utilized. However, privacy advocates and whistleblowers often need to strip C2PA credentials because manifests can reveal identity chains and device credentials.
              </p>
              <p>
                Stripping C2PA credentials permanently breaks the cryptographic verification chain. Viewers inspecting the file will see that provenance data has been removed.
              </p>
            </section>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Inspect and manage your image metadata</h3>
              <p className="text-xs text-muted-foreground">Explore all EXIF, IPTC, and XMP properties with ZeroMeta.</p>
            </div>
            <Link href="/metadata-viewer" className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span>Open Metadata Viewer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

