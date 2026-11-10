"use client";

import Link from "next/link";
import { ChevronRight, Shield, Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolShellProps {
  title: string;
  badge?: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
  howItWorks: Array<{ step: string; title: string; desc: string }>;
  supportedFormats: Array<{ format: string; extension: string; capabilities: string; notes: string }>;
  privacyNotes: string[];
  limitations: string[];
  faqs: ToolFaq[];
}

export function ToolShell({
  title,
  badge = "100% Client-Side",
  description,
  breadcrumbs,
  children,
  howItWorks,
  supportedFormats,
  privacyNotes,
  limitations,
  faqs,
}: ToolShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Hero Header */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge className="badge-brand gap-1.5">
                <Sparkles className="w-3 h-3" />
                {badge}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/80">
                Zero Cloud Storage
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Interactive Workspace Area */}
          <div className="bg-card/50 border border-border/70 rounded-2xl p-4 sm:p-8 shadow-sm">
            {children}
          </div>

          {/* How It Works */}
          <section className="space-y-6 pt-8 border-t border-border">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                How It Works
              </h2>
              <p className="text-sm text-muted-foreground">
                Execution is localized inside your browser engine to guarantee absolute privacy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((item, i) => (
                <Card key={i} className="surface-hover border-border">
                  <CardContent className="p-6 space-y-2">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      STEP {item.step}
                    </span>
                    <h3 className="font-semibold text-foreground pt-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Supported Formats */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Supported File Formats & Capabilities
              </h2>
              <p className="text-sm text-muted-foreground">
                ZeroMeta validates authentic file binary headers and signatures prior to processing.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Format</th>
                    <th className="p-3">Extension</th>
                    <th className="p-3">Inspection / Stripping Scope</th>
                    <th className="p-3">Technical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {supportedFormats.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{row.format}</td>
                      <td className="p-3 font-mono text-muted-foreground">{row.extension}</td>
                      <td className="p-3 text-muted-foreground">{row.capabilities}</td>
                      <td className="p-3 text-muted-foreground">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Privacy & Limitations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Privacy Architecture */}
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-wide uppercase">Privacy Considerations</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {privacyNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations & Disclaimers */}
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-wide uppercase">Technical Boundaries</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

