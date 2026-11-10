"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  Server,
  ShieldCheck,
  Trash2,
  Video,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { handleEmailClick } from "@/lib/utils";

export function LandingSections() {
  return (
    <div className="flex flex-col gap-24 py-16 sm:py-24">
      {/* ─── HOW IT WORKS ─── */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <Badge className="badge-brand">How It Works</Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Strip metadata in 3 simple steps
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our tool operates entirely in your browser, ensuring maximum privacy
            and blazing-fast processing without the need for uploads.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Select Files",
              desc: "Drag and drop images, videos, or audio files directly into the browser.",
              icon: ImageIcon,
            },
            {
              step: "02",
              title: "Configure Rules",
              desc: "Choose strict Privacy Clean or inject your own custom branding tags.",
              icon: Zap,
            },
            {
              step: "03",
              title: "Download Clean",
              desc: "Download individual files or grab the entire batch in a neat ZIP archive.",
              icon: ShieldCheck,
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="surface-hover h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <item.icon className="w-6 h-6 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Built for creators and privacy advocates
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[
            {
              title: "Universal Media Support",
              desc: "Process JPG, PNG, WebP, MP4, WebM, and MP3 seamlessly.",
              icon: Video,
            },
            {
              title: "Intelligent File Engine",
              desc: "Automated filename sanitization and conflict resolution.",
              icon: Server,
            },
            {
              title: "Zero Quality Loss",
              desc: "Remove EXIF without destroying your media dimensions or quality.",
              icon: ImageIcon,
            },
            {
              title: "Batch Processing",
              desc: "Handle 50+ files simultaneously with intelligent queue management.",
              icon: Zap,
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 p-4 surface-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PRIVACY ─── */}
      <section id="privacy" className="space-y-10">
        <div className="text-center space-y-4">
          <Badge className="badge-success">Privacy Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Clear, transparent privacy principles
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            We clearly separate local browser execution from optional server tasks so you always know where your data lives.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Lock className="w-6 h-6 status-success" />
              <h3 className="font-medium">Client-Side by Default</h3>
              <p className="text-sm text-muted-foreground">
                In standard mode, all metadata inspection, stripping, and editing occurs directly inside your web browser using HTML5 Canvas and local WebAssembly. Your media files never leave your computer.
              </p>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Server className="w-6 h-6 status-success" />
              <h3 className="font-medium">Explicit Server Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Advanced server processing (e.g. sharp image optimizations) only occurs when you specifically select it. Files are processed in memory and never saved to persistent database storage or media caches.
              </p>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Trash2 className="w-6 h-6 status-success" />
              <h3 className="font-medium">No Persistent Retention</h3>
              <p className="text-sm text-muted-foreground">
                We do not harvest metadata, track uploaded filenames, or store media files. Diagnostic metrics are strictly privacy-conscious and contain zero file content or sensitive EXIF tags.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="space-y-10 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="w-full flex flex-col gap-3">
          {[
            {
              q: "Why should I remove EXIF data?",
              a: "Photos and videos capture hidden metadata including exact GPS coordinates, camera serial numbers, and device models. Removing this data protects your identity and exact physical location when sharing online.",
            },
            {
              q: "Does ZeroMeta compress my images?",
              a: 'No. By default, ZeroMeta completely preserves your original dimensions and visual quality. You optionally select "Optimize file size" if you wish to apply compression.',
            },
            {
              q: "Is it really free?",
              a: 'Yes. ZeroMeta is 100% free with no hidden limits. Our "Privacy Clean" mode runs entirely in your browser, costing us nothing in server fees, allowing us to keep it free.',
            },
            {
              q: "How does Clean + Branding work?",
              a: 'Clean + Branding acts as a double-pass system. First, it strictly strips all original EXIF data (GPS, camera info). Then, it safely injects "Muhammad Rashed" as the Author/Creator tag in the IFD0 block, allowing you to protect your identity while claiming creative ownership.',
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group border rounded-xl overflow-hidden bg-card/50"
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-sm text-foreground hover:bg-muted/50 transition-colors">
                {faq.q}
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-muted-foreground text-sm border-t border-border/50 bg-muted/10">
                <div className="pt-3 leading-relaxed">{faq.a}</div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── ABOUT & DEVELOPER LINKS ─── */}
      <section className="max-w-4xl mx-auto w-full pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm p-8 sm:p-12 shadow-2xl"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-inner mb-2">
              <Code2 className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Muhammad Rashed
              </h2>
              <p className="text-lg text-primary font-medium max-w-lg mx-auto">
                Full Stack Developer building modern web applications, developer
                tools, and privacy-focused utilities from Bangladesh.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
                ZeroMeta is built to give power back to the user. In an era where AI
                companies scrape the internet for training data and social networks
                track every EXIF coordinate, we provide a mathematically secure way
                to strip your files of hidden trackers.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 w-full">
              <a
                href="#"
                onClick={(e) => handleEmailClick(e, "rashedjaman768@gmail.com", "ZeroMeta Feedback", "Hi Muhammad Rashed,\n\nI have some feedback regarding ZeroMeta:\n\n")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a
                href="https://wa.me/@mrashed21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-card hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="https://github.com/mrashed21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-card hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/mrashed21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-card hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <Globe className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href="https://facebook.com/mrasheed21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-card hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <Globe className="w-4 h-4" />
                Facebook
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
