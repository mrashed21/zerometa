"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  FileSearch,
  Eraser,
  SlidersHorizontal,
  GitCompare,
  Camera,
  MapPin,
  FileText,
  EyeOff,
  Layers,
  BookOpen,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import * as React from "react";

import { TOOLS_LIST } from "@/lib/tools-data";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "nav-surface border-b backdrop-blur-md bg-background/85"
            : "bg-background/40 backdrop-blur-sm border-b border-border/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* ─── Logo / Branding  */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-neutral-900 leading-tight font-sans">
                ZeroMeta
              </span>
              <span className="text-[10px] font-medium text-neutral-500 leading-none hidden sm:block uppercase tracking-wider mt-0.5">
                Privacy Toolkit
              </span>
            </div>
          </Link>

          {/* ─── Desktop Navigation  */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setToolsDropdownOpen(true)}
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 py-2 hover:text-foreground transition-colors focus:outline-none"
                  aria-expanded={toolsDropdownOpen}
                >
                  <span>Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {toolsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[540px] p-3 rounded-xl bg-white border border-neutral-200 shadow-xl grid grid-cols-2 gap-1.5 z-50"
                    >
                      {TOOLS_LIST.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                          onClick={() => setToolsDropdownOpen(false)}
                        >
                          <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <tool.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                              {tool.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 line-clamp-1 leading-snug">
                              {tool.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/guides" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Privacy Guides</span>
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="/#privacy" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </Link>
              <Link href="/#faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
            </nav>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side Engine</span>
              </div>
              <Button asChild size="sm" className="btn-primary h-8 px-3 text-xs">
                <Link href="/#uploader">Clean Files</Link>
              </Button>
            </div>
          </div>

          {/* ─── Mobile Menu Toggle ─── */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="rounded-lg h-9 w-9 text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-out Menu ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 inset-x-0 bg-background/98 border-b border-border shadow-2xl z-40 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 flex flex-col gap-6"
          >
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                Core Privacy Tools
              </div>
              <div className="grid grid-cols-1 gap-1">
                {TOOLS_LIST.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{tool.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link
                href="/guides"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 text-sm font-medium rounded-lg hover:bg-muted text-foreground"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Privacy Guides & Knowledge Base</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-sm font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                About &amp; Founder
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-sm font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="/#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-sm font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                Privacy Architecture
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-sm font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                Frequently Asked Questions
              </Link>
            </div>

            <div className="pt-2 border-t border-border">
              <Button asChild className="w-full btn-primary" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/#uploader">Clean My Files Now</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
