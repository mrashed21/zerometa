import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Camera, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is EXIF Data? Camera Metadata Explained | ZeroMeta",
  description: "Learn what EXIF data is, how digital cameras write it into photos, what privacy risks it creates, and how to safely inspect and remove it.",
  alternates: {
    canonical: "/guides/what-is-exif",
  },
};

export default function WhatIsExifGuide() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <Link href="/guides" className="hover:text-foreground">Guides</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">What is EXIF?</span>
          </nav>

          {/* Title Header */}
          <div className="space-y-4">
            <Badge className="badge-brand">Photography & Privacy</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              What is EXIF Data? Camera Metadata Explained
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every time you snap a picture on an iPhone, Android, or DSLR, hidden technical specifications and geographic coordinates are automatically embedded into the image file.
            </p>
          </div>

          {/* Article Body */}
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                1. Understanding EXIF (Exchangeable Image File Format)
              </h2>
              <p>
                EXIF stands for <strong>Exchangeable Image File Format</strong>. Established by the Japan Electronics and Information Technology Industries Association (JEITA) in 1998, EXIF specifies the format for images, sound, and ancillary tags used by digital cameras and smartphones.
              </p>
              <p>
                Unlike visible text or logos overlaid on image pixels, EXIF exists as structured metadata blocks tucked inside file headers (specifically in the APP1 segment of JPEG files or the eXIf chunk of PNG files).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                2. What Data Does EXIF Record?
              </h2>
              <p>
                A standard JPEG photograph taken by a modern smartphone can record over 100 distinct metadata fields, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Hardware Details:</strong> Camera manufacturer, exact phone model, lens model, serial number.</li>
                <li><strong>Exposure Settings:</strong> Aperture (f-stop), shutter speed, ISO sensitivity, focal length, flash status.</li>
                <li><strong>Exact Timestamps:</strong> Date, hour, minute, second, and timezone of capture.</li>
                <li><strong>Location & Geotags:</strong> GPS latitude, longitude, altitude, heading direction, and satellite precision.</li>
                <li><strong>Software Footprint:</strong> Operating system build number (e.g. iOS 18.1), editing software (Photoshop, Lightroom).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                3. The Privacy Risks of EXIF Metadata
              </h2>
              <p>
                While exposure settings are invaluable for professional photographers studying their craft, sharing uncleaned photos online can expose your personal life:
              </p>
              <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2 text-destructive-foreground">
                <div className="flex items-center gap-2 font-bold text-sm text-destructive">
                  <ShieldAlert className="w-4 h-4" />
                  Real-World Risk Scenarios
                </div>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li><strong>Home Stalking:</strong> Posting photos taken inside your residence on classifieds, forums, or blogs reveals your exact residential address.</li>
                  <li><strong>Hardware Profiling:</strong> Unique camera body and lens serial numbers allow cross-referencing anonymous accounts to a single physical device.</li>
                  <li><strong>Routine Mapping:</strong> A series of photos posted over time reveals children's school locations, gym routines, and vacation absences.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                4. How to Inspect and Strip EXIF Safely
              </h2>
              <p>
                Some social media platforms (like Twitter/X or Instagram) automatically strip EXIF when photos are uploaded. However, email attachments, Discord, AirDrop, personal blogs, marketplaces (eBay, Craigslist), and cloud storage links often preserve every byte of EXIF.
              </p>
              <p>
                Using ZeroMeta, you can inspect and purge EXIF directly in your browser without uploading your photos to any remote server.
              </p>
            </section>
          </div>

          {/* Quick CTA */}
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Want to remove EXIF from your photos now?</h3>
              <p className="text-xs text-muted-foreground">Use our specialized, offline EXIF Remover tool.</p>
            </div>
            <Link href="/exif-remover" className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span>Open EXIF Remover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

