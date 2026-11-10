import Image from "next/image";
import { ShieldCheck, ExternalLink, Globe } from "lucide-react";

export function AuthorBox() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border space-y-4 my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted relative">
          <Image
            src="/muhammad_rashed.webp"
            alt="Muhammad Rashed - Founder of ZeroMeta"
            width={64}
            height={64}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Written by</span>
            <a
              href="https://www.mrashed21.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Muhammad Rashed
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>

          <p className="text-xs font-medium text-emerald-400">
            Founder of ZeroMeta &amp; Full Stack Developer
          </p>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Muhammad Rashed is a software engineer specializing in privacy-first web utilities, client-side cryptographic architectures, and modern full-stack web applications.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
            <a
              href="https://www.mrashed21.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
            >
              <Globe className="w-3 h-3" />
              <span>Personal Website &amp; Portfolio</span>
            </a>
            <span className="text-muted-foreground/60">•</span>
            <a
              href="https://muhammadrashed.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-[11px] font-medium"
            >
              Developer Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

