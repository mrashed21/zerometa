import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FounderSection } from "@/components/founder-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ZeroMeta & Founder Muhammad Rashed | Digital Privacy",
  description: "Learn about ZeroMeta and founder Muhammad Rashed, Full Stack Developer building practical software products and privacy-focused digital tools.",
  keywords: [
    "About ZeroMeta",
    "Muhammad Rashed",
    "Muhammad Rashed Developer",
    "Founder of ZeroMeta",
    "ZeroMeta Founder",
    "Full Stack Developer",
    "Software Developer",
  ],
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="badge-brand">About</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-sans">
              About ZeroMeta
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              A privacy-focused digital media toolkit engineered for client-side security, metadata inspection, and clean media sharing.
            </p>
          </div>

          {/* Section 1: What ZeroMeta Does & Why It Was Built */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Card className="bg-white border border-neutral-200 rounded-xl shadow-xs">
              <CardContent className="p-6 sm:p-7 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">What ZeroMeta Does</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  ZeroMeta allows individuals, creators, journalists, and privacy-conscious users to inspect, sanitize, compare, and redact hidden metadata from digital files—including photos, video footage, audio recordings, and PDF documents.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  By purging digital headers such as EXIF GPS coordinates, camera serial numbers, and creator signatures, ZeroMeta ensures files can be published online without exposing personal digital footprints.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-neutral-200 rounded-xl shadow-xs">
              <CardContent className="p-6 sm:p-7 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Why It Was Built</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  The majority of free online file converters and metadata strippers require users to upload sensitive personal or business files to remote cloud servers. Those third-party servers can harvest EXIF tags, log IP addresses, and retain files indefinitely.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  ZeroMeta was created to provide a dependable, transparent alternative where files are processed locally inside the user&apos;s browser using HTML5 Canvas, WebAssembly, and native binary parsers.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Privacy-First Philosophy & Long-Term Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Card className="bg-white border border-neutral-200 rounded-xl shadow-xs">
              <CardContent className="p-6 sm:p-7 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Privacy-First Philosophy</h2>
                <ul className="space-y-2.5 text-xs text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Client-Side Execution:</strong> Default processing never transfers media bytes over the network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Surveillance:</strong> Zero tracking cookies, zero persistent databases, zero telemetry harvesting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Technical Honesty:</strong> Clear disclosures regarding what metadata tools can and cannot remove (such as landmark clues or invisible pixel watermarks).</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-neutral-200 rounded-xl shadow-xs">
              <CardContent className="p-6 sm:p-7 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Long-Term Vision</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Our objective is to continue developing ZeroMeta into an open, high-performance toolkit that empowers everyday internet users to safeguard their digital rights.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Future plans include expanded client-side format parsers, advanced visual redaction techniques, and open-source verification benchmarks to maintain the highest security and transparency standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Founder Profile */}
          <FounderSection />

          {/* Bottom Action */}
          <div className="p-6 sm:p-8 rounded-xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
            <h3 className="text-lg font-bold text-neutral-900">Experience ZeroMeta in Action</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Clean hidden camera tags, GPS coordinates, and personal device footprints from your media files completely offline.
            </p>
            <div className="pt-2">
              <Button asChild size="sm" className="btn-primary h-9 px-5 text-xs font-semibold">
                <Link href="/#uploader">
                  <span>Start Cleaning Files</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
