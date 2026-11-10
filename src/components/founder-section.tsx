import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Code2, ExternalLink, ShieldCheck, Laptop } from "lucide-react";

export function FounderSection() {
  return (
    <section id="founder" className="space-y-6 scroll-mt-24 max-w-4xl mx-auto w-full">
      <div className="text-center space-y-2">
        <Badge className="badge-brand">Founder</Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans">
          Meet the Founder
        </h2>
        <p className="text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
          The engineering and privacy philosophy driving the development of ZeroMeta.
        </p>
      </div>

      <Card className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Founder Profile Image */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative bg-neutral-100">
                <Image
                  src="/muhammad_rashed.webp"
                  alt="Muhammad Rashed - Founder of ZeroMeta"
                  width={144}
                  height={144}
                  priority
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-white border border-neutral-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Founder Details & Bio */}
            <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-sans">
                    Muhammad Rashed
                  </h3>
                  <Badge variant="outline" className="text-xs text-blue-700 border-blue-200 bg-blue-50">
                    Founder
                  </Badge>
                </div>
                <p className="text-sm font-medium text-neutral-700">
                  Full Stack Developer | Founder of ZeroMeta
                </p>
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed">
                ZeroMeta is developed by <strong>Muhammad Rashed</strong>, a Full Stack Developer focused on building practical software products and privacy-focused digital tools.
              </p>

              {/* Three Verified Personal Domains */}
              <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 font-medium">
                  <a
                    href="https://www.mrashed21.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Personal Website &amp; Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>

                  <span className="hidden sm:inline text-neutral-300">•</span>

                  <a
                    href="https://muhammadrashed.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Developer Website</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>

                  <span className="hidden sm:inline text-neutral-300">•</span>

                  <a
                    href="https://muhammadrashed.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Personal Technology Website</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>

                  <span className="hidden sm:inline text-neutral-300">•</span>

                  <a
                    href="https://www.linkedin.com/in/mrashed21/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
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
