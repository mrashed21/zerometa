import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FounderSection } from "@/components/founder-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, EyeOff, Server, CheckCircle2, Globe, Code2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ZeroMeta & Founder Muhammad Rashed | Digital Privacy",
  description: "Learn about ZeroMeta and founder Muhammad Rashed, Full Stack Developer building privacy-first digital media tools with zero cloud retention.",
  keywords: [
    "About ZeroMeta",
    "Muhammad Rashed",
    "Muhammad Rashed Developer",
    "Founder of ZeroMeta",
    "ZeroMeta Founder",
    "Full Stack Developer",
    "Software Developer",
    "Rashed Jaman",
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge className="badge-brand">Our Mission &amp; Story</Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              About ZeroMeta &amp; Our Privacy Mission
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              We believe privacy should be accessible, transparent, and built directly into digital tools by default.
            </p>
          </div>

          {/* Mission & Background */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <Card className="surface-hover border-border">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Why ZeroMeta Was Created</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Most online metadata removers require users to upload their private family photos, confidential work documents, or audio recordings to remote, unknown cloud servers. Often, these servers harvest EXIF tags, log IP addresses, or retain media indefinitely.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ZeroMeta was engineered to eliminate this risk entirely. By leveraging modern browser APIs, WebAssembly, and HTML5 Canvas, ZeroMeta inspects and cleans your files locally on your own computer or phone.
                </p>
              </CardContent>
            </Card>

            <Card className="surface-hover border-border">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Our Core Principles</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Local First:</strong> No files leave your device during standard processing.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Honesty in Security:</strong> We do not make exaggerated claims like removing invisible statistical AI watermarks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Surveillance:</strong> Zero tracking cookies, zero account barriers, zero file logging.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Full Founder Section */}
          <FounderSection />

          {/* Back to Tools CTA */}
          <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">Explore the ZeroMeta Privacy Studio</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Start cleaning your photos, videos, audio, and PDF documents today with verified client-side privacy.
            </p>
            <Link
              href="/#uploader"
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

