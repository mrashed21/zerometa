import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Code2, ExternalLink, ShieldCheck, Terminal, Award } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function FounderSection() {
  return (
    <section id="founder" className="space-y-8 scroll-mt-24 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-3">
        <Badge className="badge-brand">Creator & Vision</Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
          Meet the Founder
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          The engineering and privacy philosophy driving the development of ZeroMeta.
        </p>
      </div>

      <Card className="surface-hover border-border overflow-hidden rounded-3xl shadow-xl">
        <CardContent className="p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Founder Profile Image */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl relative bg-card">
                <Image
                  src="/muhammad_rashed.webp"
                  alt="Muhammad Rashed - Founder of ZeroMeta"
                  width={176}
                  height={176}
                  priority
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-card border border-border shadow-md">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* Founder Details & Bio */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-sans">
                    Muhammad Rashed
                  </h3>
                  <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                    Founder
                  </Badge>
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  Founder of ZeroMeta &amp; Full Stack Developer
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                ZeroMeta is built by <strong>Muhammad Rashed</strong>, a Full Stack Developer passionate about building useful digital products, privacy-focused tools, and practical software solutions. Specializing in high-performance React and Node.js architectures, Muhammad created ZeroMeta to provide a 100% private, client-side alternative to surveillance-heavy online converters.
              </p>

              {/* Skills / Focus Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-primary" /> Full Stack Software Development
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                  React &amp; Next.js
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                  Node.js &amp; TypeScript
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                  Client-Side Privacy Architecture
                </span>
              </div>

              {/* Verified Domain Cross-Links */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold">
                  <a
                    href="https://www.mrashed21.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Personal Website &amp; Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>

                  <span className="hidden sm:inline text-muted-foreground">•</span>

                  <a
                    href="https://muhammadrashed.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Developer Website</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                </div>

                {/* Verified Social Profiles */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/mrashed21"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Muhammad Rashed on GitHub"
                    className="p-2 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com/in/mrashed21"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Muhammad Rashed on LinkedIn"
                    className="p-2 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

