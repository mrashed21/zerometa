import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthorBox } from "@/components/author-box";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MapPin, AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Remove Photo Location & GPS Coordinates | ZeroMeta",
  description: "Learn how to detect and strip GPS coordinates, altitude records, and location geotags from photos before sharing them online.",
  alternates: {
    canonical: "/guides/how-to-remove-photo-location",
  },
};

export default function HowToRemovePhotoLocationGuide() {
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
            <span className="text-foreground font-medium">Remove Photo Location</span>
          </nav>

          <div className="space-y-4">
            <Badge className="badge-brand">Location Privacy</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              How to Remove GPS & Location Data From Photos
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Step-by-step instructions for inspecting and permanently stripping geographic coordinates from your photos on iPhone, Android, Mac, Windows, and web browsers.
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                1. Why Photos Contain Exact GPS Coordinates
              </h2>
              <p>
                When you permit your camera app to access Location Services, the phone connects with GPS satellites, cell towers, and nearby Wi-Fi beacons to calculate your latitude and longitude.
                These coordinates are written into the EXIF GPS IFD tag of the resulting photo.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                2. Method 1: Instant Browser Removal With ZeroMeta (Recommended)
              </h2>
              <p>
                The fastest cross-platform method is using ZeroMeta’s dedicated GPS Remover:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open our free <Link href="/gps-remover" className="text-primary underline">GPS Remover Tool</Link>.</li>
                <li>Drag and drop your photos into the upload zone.</li>
                <li>ZeroMeta parses the binary header, isolates the GPS IFD directory, and deletes the coordinates.</li>
                <li>Click <strong>Download Cleaned Files</strong>. Your photos are downloaded with zero location markers.</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                3. Method 2: Disabling Geotagging at the Source
              </h2>
              <p>
                You can prevent future photos from embedding GPS data in your phone settings:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>On iPhone (iOS):</strong> Go to <em>Settings &gt; Privacy &amp; Security &gt; Location Services &gt; Camera</em> and choose <strong>Never</strong>.</li>
                <li><strong>On Android:</strong> Open the <em>Camera App &gt; Settings gear &gt; Location Tags</em> and toggle it off.</li>
              </ul>
            </section>

            {/* Crucial Disclosure Callout */}
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                Critical Privacy Fact: Visible Landmark Clues
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Stripping GPS metadata completely clears digital latitude and longitude numbers from file headers. However, if your photo shows identifiable landmarks, street names, license plates, or store signs in the pixels, viewers can still determine the location visually. Use our <Link href="/image-privacy-tools" className="text-primary underline font-medium">Image Privacy Tools</Link> to redact visual landmarks.
              </p>
            </div>
          </div>

          {/* Author Attribution */}
          <AuthorBox />

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Have photos with GPS you need to clean?</h3>
              <p className="text-xs text-muted-foreground">Strip location coordinates instantly in your browser.</p>
            </div>
            <Link href="/gps-remover" className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span>Open GPS Remover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

