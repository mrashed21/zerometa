import Link from "next/link";
import { Shield, Lock, FileCheck, ExternalLink, Heart } from "lucide-react";
import { TOOLS_LIST } from "@/lib/tools-data";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 text-muted-foreground pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                ZeroMeta
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your Files. Your Privacy. Zero Metadata. Inspect, strip, edit, and redact sensitive digital footprints directly in your browser with complete privacy.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Offline-ready client-side execution</span>
            </div>
          </div>

          {/* Core Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Privacy Tools
            </h4>
            <ul className="space-y-2 text-sm">
              {TOOLS_LIST.slice(0, 5).map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-foreground transition-colors">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialized Cleaners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Cleaners & Redaction
            </h4>
            <ul className="space-y-2 text-sm">
              {TOOLS_LIST.slice(5).map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-foreground transition-colors">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Guides & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources & Guides
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guides" className="hover:text-foreground transition-colors">
                  All Privacy Guides
                </Link>
              </li>
              <li>
                <Link href="/guides/what-is-exif" className="hover:text-foreground transition-colors">
                  What is EXIF Data?
                </Link>
              </li>
              <li>
                <Link href="/guides/how-to-remove-photo-location" className="hover:text-foreground transition-colors">
                  Remove Photo Location
                </Link>
              </li>
              <li>
                <Link href="/guides/metadata-vs-watermark" className="hover:text-foreground transition-colors">
                  Metadata vs Watermarks
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="hover:text-foreground transition-colors">
                  Privacy Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ZeroMeta (zerometa.tech). Privacy-focused digital media toolkit.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Tracking & No Persistent Storage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-primary" />
              <span>C2PA & EXIF Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
