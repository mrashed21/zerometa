import Image from "next/image";
import { ExternalLink, Globe, Code2, Laptop } from "lucide-react";

export function AuthorBox() {
  return (
    <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-4 my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 relative">
          <Image
            src="/muhammad_rashed.webp"
            alt="Muhammad Rashed - Founder of ZeroMeta"
            width={56}
            height={56}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Written by</span>
            <a
              href="https://www.mrashed21.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-neutral-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              Muhammad Rashed
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>

          <p className="text-xs font-medium text-neutral-700">
            Full Stack Developer | Founder of ZeroMeta
          </p>

          <p className="text-xs text-neutral-600 leading-relaxed">
            ZeroMeta is developed by Muhammad Rashed, a Full Stack Developer focused on building practical software products and privacy-focused digital tools.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
            <a
              href="https://www.mrashed21.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
            >
              <Globe className="w-3 h-3 text-neutral-400" />
              <span>Personal Website &amp; Portfolio</span>
            </a>
            <span className="text-neutral-300">•</span>
            <a
              href="https://muhammadrashed.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
            >
              <Code2 className="w-3 h-3 text-neutral-400" />
              <span>Developer Website</span>
            </a>
            <span className="text-neutral-300">•</span>
            <a
              href="https://muhammadrashed.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
            >
              <Laptop className="w-3 h-3 text-neutral-400" />
              <span>Personal Technology Website</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
