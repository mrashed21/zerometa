import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthorBox } from "@/components/author-box";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metadata vs Watermarks: What Metadata Tools Can and Cannot Do | ZeroMeta",
  description: "A fact-based engineering breakdown explaining the technical differences between metadata header tags, visible watermarks, and invisible AI pixel watermarks like SynthID.",
  alternates: {
    canonical: "/guides/metadata-vs-watermark",
  },
};

export default function MetadataVsWatermarkGuide() {
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
            <span className="text-foreground font-medium">Metadata vs Watermarks</span>
          </nav>

          <div className="space-y-4">
            <Badge className="badge-brand">Technical Honesty & Truth in Privacy</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              Metadata vs Watermarks: What Metadata Tools Can and Cannot Do
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              There is widespread confusion online regarding file metadata, visible logos, and invisible AI watermarks. This guide provides an honest, technical explanation of their differences.
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                1. Digital Metadata (Headers &amp; Containers)
              </h2>
              <p>
                <strong>What it is:</strong> Data stored in structured binary sections <em>outside</em> the pixel matrix (EXIF, IPTC, XMP, C2PA, QuickTime atoms).
              </p>
              <p>
                <strong>Can metadata tools remove it?</strong> <strong>YES, 100%.</strong> By reading the file and stripping or re-encoding without the header blocks, tools like ZeroMeta completely eliminate all EXIF, GPS coordinates, serial numbers, and C2PA manifests.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                2. Visible Watermarks (Logos &amp; Overlays)
              </h2>
              <p>
                <strong>What it is:</strong> Text, logos, or copyright notices drawn directly into the visible image pixels (e.g. &quot;Getty Images&quot; or a creator stamp in the corner).
              </p>
              <p>
                <strong>Can metadata tools remove it?</strong> <strong>NO.</strong> Because visible watermarks are part of the image pixel content, removing file headers leaves visible watermarks completely untouched. Obscuring visible watermarks requires pixel redaction or inpainting tools.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                3. Invisible AI Watermarks (e.g. Google DeepMind SynthID)
              </h2>
              <p>
                <strong>What it is:</strong> Statistical frequency perturbations mathematically embedded directly into the model’s latent diffusion space or pixel distribution during generation.
              </p>
              <p>
                <strong>Can metadata tools remove it?</strong> <strong>NO.</strong> Invisible statistical watermarks like SynthID do not rely on EXIF or metadata tags. Re-encoding or stripping headers does <strong>not</strong> remove SynthID, because the watermark resides within the statistical relationship between adjacent pixels.
              </p>
            </section>

            {/* ZeroMeta Truth Policy */}
            <div className="p-5 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Shield className="w-4 h-4 text-primary" />
                ZeroMeta’s Engineering Policy
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Many scam websites falsely claim to &quot;remove SynthID&quot; or &quot;erase AI watermarks&quot; by simply running files through a canvas re-encoder. At ZeroMeta, we do not make false claims. We provide mathematically verified metadata sanitization, and we disclose precisely where metadata cleaning ends and pixel manipulation begins.
              </p>
            </div>
          </div>

          {/* Author Attribution */}
          <AuthorBox />

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Clean digital footprints from your files</h3>
              <p className="text-xs text-muted-foreground">Strip real metadata headers with full transparency.</p>
            </div>
            <Link href="/metadata-remover" className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span>Clean My Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

