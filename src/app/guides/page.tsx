import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Camera, MapPin, Layers, Shield, Sparkles, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Privacy Guides & Knowledge Base | ZeroMeta",
  description: "Learn how digital metadata, GPS tracking, EXIF headers, and C2PA credentials impact your personal privacy online.",
  alternates: {
    canonical: "/guides",
  },
};

const GUIDES = [
  {
    slug: "what-is-exif",
    title: "What is EXIF Data? Everything You Need to Know",
    description: "Discover what EXIF metadata is, what sensitive camera information it stores, and why privacy advocates recommend removing it.",
    badge: "Foundation",
    icon: Camera,
    readTime: "5 min read",
  },
  {
    slug: "how-to-remove-photo-location",
    title: "How to Remove GPS & Location Data From Photos",
    description: "Step-by-step instructions for stripping GPS latitude, longitude, and altitude stamps on iPhone, Android, and PC.",
    badge: "Security",
    icon: MapPin,
    readTime: "4 min read",
  },
  {
    slug: "what-is-image-metadata",
    title: "What is Image Metadata? EXIF vs IPTC vs XMP vs C2PA",
    description: "A complete technical breakdown of digital media metadata standards and how Content Credentials impact authenticity.",
    badge: "Technical",
    icon: Layers,
    readTime: "7 min read",
  },
  {
    slug: "metadata-vs-watermark",
    title: "Metadata vs Watermarks: What Metadata Tools Can and Cannot Do",
    description: "A fact-based engineering guide explaining the difference between digital header tags, visible watermarks, and invisible AI watermarks like SynthID.",
    badge: "Deep Dive",
    icon: Shield,
    readTime: "6 min read",
  },
];

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <Badge className="badge-brand gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Privacy Knowledge Base
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              Digital Media Privacy Guides
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore our technical, privacy-first guides explaining how digital footprints, GPS coordinates, and camera metadata are captured, extracted, and permanently eliminated.
            </p>
          </div>

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDES.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block focus:outline-none">
                <Card className="surface-hover border-border h-full transition-all duration-300 group-hover:border-primary/50">
                  <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <guide.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{guide.readTime}</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {guide.badge}
                          </Badge>
                        </div>
                      </div>

                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {guide.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Tools CTA */}
          <div className="p-8 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground">Ready to clean your media files?</h3>
              <p className="text-xs text-muted-foreground">
                Process your photos, videos, and PDFs 100% offline in your browser.
              </p>
            </div>
            <Link
              href="/#uploader"
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
            >
              Open Universal Cleaner
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

