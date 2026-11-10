import Link from "next/link";
import { Shield, Lock, FileCheck, ExternalLink } from "lucide-react";
import { TOOLS_LIST } from "@/lib/tools-data";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 text-neutral-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 font-sans">
                ZeroMeta
              </span>
            </Link>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm">
              Your Files. Your Privacy. Zero Metadata. Inspect, strip, edit, and redact sensitive digital footprints directly in your browser with complete privacy.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Offline-ready client-side execution</span>
            </div>
          </div>

          {/* Core Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Privacy Tools
            </h4>
            <ul className="space-y-2 text-sm">
              {TOOLS_LIST.slice(0, 5).map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-blue-600 transition-colors">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialized Cleaners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Cleaners &amp; Redaction
            </h4>
            <ul className="space-y-2 text-sm">
              {TOOLS_LIST.slice(5).map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-blue-600 transition-colors">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Founder Integration */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Resources &amp; Founder
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors font-medium text-neutral-900">
                  About ZeroMeta
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-blue-600 transition-colors">
                  All Privacy Guides
                </Link>
              </li>
              <li>
                <Link href="/guides/what-is-exif" className="hover:text-blue-600 transition-colors">
                  What is EXIF Data?
                </Link>
              </li>
              <li>
                <Link href="/guides/how-to-remove-photo-location" className="hover:text-blue-600 transition-colors">
                  Remove Photo Location
                </Link>
              </li>
              <li>
                <Link href="/guides/metadata-vs-watermark" className="hover:text-blue-600 transition-colors">
                  Metadata vs Watermarks
                </Link>
              </li>
              <li className="pt-2 border-t border-neutral-200">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block pb-1">
                  Founded by Muhammad Rashed
                </span>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <a
                      href="https://www.mrashed21.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Personal Website</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://muhammadrashed.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Developer Website</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://muhammadrashed.tech/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Technology Website</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© {new Date().getFullYear()} ZeroMeta (zerometa.tech). Privacy-focused digital media toolkit.</p>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <p>
              Developed by{" "}
              <a
                href="https://www.mrashed21.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 hover:text-blue-600 transition-colors font-medium underline"
              >
                Muhammad Rashed
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Tracking &amp; No Persistent Storage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>C2PA &amp; EXIF Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
