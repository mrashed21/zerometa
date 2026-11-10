"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { TOOLS_LIST } from "@/lib/tools-data";
import { Footer } from "@/components/footer";
import { UniversalUploader } from "@/components/universal-uploader";
import { FileQueue } from "@/components/file-queue";
import { ControlPanel } from "@/components/control-panel";
import { MetadataInspector } from "@/components/metadata-inspector";
import { CompareSlider } from "@/components/compare-slider";
import { extractUnifiedMetadata, processUnifiedMediaFile } from "@/lib/unified-processor";
import { getMediaType } from "@/lib/media-types";
import { generateId, getImageDimensions } from "@/lib/utils";
import { downloadAsZip, downloadBlob } from "@/lib/download";
import { DEFAULT_PROCESSING_OPTIONS } from "@/lib/constants";
import type { MediaFile, ImageFile, ProcessingOptions, CropData, ResizeOptions } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Sparkles,
  ArrowRight,
  Download,
  Play,
  RefreshCw,
  Lock,
  Server,
  Trash2,
  FileCheck,
  Eye,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  Eraser,
  GitCompare,
  SlidersHorizontal,
  Camera,
  MapPin,
  FileText,
  EyeOff,
  Layers,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { motion } from "motion/react";

export default function Home() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_PROCESSING_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | "image" | "video" | "audio" | "document">("all");

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedFile, setInspectedFile] = useState<MediaFile | null>(null);

  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const mediaFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        const metadataBefore = await extractUnifiedMetadata(file);
        let dims: { width: number; height: number } | null = null;

        if (file.type.startsWith("image/")) {
          dims = await getImageDimensions(file);
        }

        return {
          id: generateId(),
          file,
          mediaType: getMediaType(file) || ("image" as const),
          preview,
          status: "queued" as const,
          progress: 0,
          result: null,
          metadataBefore,
          width: dims?.width,
          height: dims?.height,
        };
      })
    );

    setFiles((prev) => [...prev, ...mediaFiles]);
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  }, [files]);

  const handleInspect = useCallback((id: string) => {
    const target = files.find((f) => f.id === id);
    if (target) {
      setInspectedFile(target);
      setInspectorOpen(true);
    }
  }, [files]);

  const handleDownloadSingle = useCallback((id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.result?.blob) {
      downloadBlob(target.result.blob, target.result.filename);
      toast({
        title: "Download Started",
        description: `Saved ${target.result.filename}`,
        variant: "success",
      });
    }
  }, [files, toast]);

  const handleProcessAll = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued" || f.status === "error");
    if (queuedFiles.length === 0) return;

    setIsProcessing(true);
    abortRef.current = new AbortController();

    for (const item of queuedFiles) {
      if (abortRef.current?.signal.aborted) break;

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing", progress: 20 } : f))
      );

      try {
        const result = await processUnifiedMediaFile(item, options, (p) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, progress: p } : f))
          );
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "done",
                  progress: 100,
                  result,
                }
              : f
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Processing failed",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "Batch Cleaning Complete",
      description: "All files have been processed.",
      variant: "success",
    });
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-cleaned");
    setIsZipping(false);

    if (result.success) {
      toast({
        title: "ZIP Generated",
        description: `Exported ${result.fileCount} clean files.`,
        variant: "success",
      });
    } else {
      toast({
        title: "ZIP Failed",
        description: result.error || "Could not generate ZIP archive.",
        variant: "error",
      });
    }
  };

  const filteredFiles = activeTab === "all" ? files : files.filter((f) => f.mediaType === activeTab);
  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {/* ─── 1. HERO SECTION ─── */}
          <section className="text-center pt-8 sm:pt-14 pb-4 space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-sans leading-[1.08]">
              Your Files. Your Privacy. <br className="hidden sm:inline" />
              <span className="text-gradient-brand">Zero Metadata.</span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Remove hidden metadata, GPS coordinates, device information, and unwanted digital footprints from your media files.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="btn-primary h-12 px-8 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                <a href="#uploader">
                  Clean My Files
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-sm font-medium rounded-xl border-border hover:bg-muted w-full sm:w-auto">
                <a href="#tools">Explore Tools</a>
              </Button>
            </div>

            {/* Security Indicators Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No Cloud Uploads Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero Account Signup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Binary Stripping
              </span>
            </div>
          </section>

          {/* ─── 2. MAIN FILE PROCESSOR DASHBOARD ─── */}
          <section id="uploader" className="space-y-6 scroll-mt-24">
            <div className="bg-card/70 border border-border/80 rounded-3xl p-4 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
              {/* Format Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
                  <TabsList className="bg-muted/70 p-1 rounded-xl">
                    <TabsTrigger value="all" className="text-xs px-3 py-1.5">All ({files.length})</TabsTrigger>
                    <TabsTrigger value="image" className="text-xs px-3 py-1.5 gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Images
                    </TabsTrigger>
                    <TabsTrigger value="video" className="text-xs px-3 py-1.5 gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Videos
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="text-xs px-3 py-1.5 gap-1.5">
                      <Music className="w-3.5 h-3.5" /> Audio
                    </TabsTrigger>
                    <TabsTrigger value="document" className="text-xs px-3 py-1.5 gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> PDFs
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Queue Summary & Global Actions */}
                {files.length > 0 && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {queuedCount > 0 && (
                      <Button
                        onClick={handleProcessAll}
                        disabled={isProcessing}
                        size="sm"
                        className="btn-primary gap-1.5 h-8 text-xs font-semibold"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Clean All ({queuedCount})
                          </>
                        )}
                      </Button>
                    )}
                    {doneCount > 0 && (
                      <Button
                        onClick={handleDownloadZip}
                        disabled={isZipping}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isZipping ? "Packing..." : `Save ZIP (${doneCount})`}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Universal Dropzone */}
              <UniversalUploader
                files={files}
                onFilesAdded={handleFilesAdded}
                onFileRemove={handleFileRemove}
                onClearAll={handleClearAll}
                disabled={isProcessing}
                allowedType="all"
              />

              {/* Processing Queue & Settings Layout */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-border">
                  {/* File Queue List */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Queue ({filteredFiles.length} visible)</span>
                      <span>Status</span>
                    </div>

                    <FileQueue
                      files={filteredFiles as any}
                      onRemove={handleFileRemove}
                      onInspect={handleInspect}
                      onDownload={handleDownloadSingle}
                    />
                  </div>

                  {/* Settings Panel */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Processing Rules
                    </div>
                    <ControlPanel
                      options={options}
                      onOptionsChange={setOptions}
                      onProcess={handleProcessAll}
                      onCancel={() => abortRef.current?.abort()}
                      isProcessing={isProcessing}
                      activeTab={activeTab === "all" || activeTab === "document" ? "image" : activeTab}
                      fileCount={files.length}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─── 3. CORE TOOLS OVERVIEW ─── */}
          <section id="tools" className="space-y-10 scroll-mt-24">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge className="badge-brand">Modular Privacy Toolkit</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Dedicated Privacy Tools
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose the exact specialized tool for your privacy workflow. Every tool operates with zero cloud retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOOLS_LIST.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group block focus:outline-none">
                  <Card className="surface-hover border-border h-full transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg">
                    <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                          <tool.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* ─── 4. HOW IT WORKS ─── */}
          <section id="how-it-works" className="space-y-10 scroll-mt-24">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge className="badge-brand">How It Works</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Strip metadata in 3 simple steps
              </h2>
              <p className="text-sm text-muted-foreground">
                Execution is localized inside your browser engine to guarantee absolute privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Select Files",
                  desc: "Drag and drop images, videos, audio clips, or PDFs directly into the browser uploader.",
                  icon: ImageIcon,
                },
                {
                  step: "02",
                  title: "In-Memory Header Purge",
                  desc: "Our engine parses the raw binary and neutralizes EXIF, GPS, IPTC, and XMP packets without cloud upload.",
                  icon: Shield,
                },
                {
                  step: "03",
                  title: "Download Clean Files",
                  desc: "Save individual sanitized media files or download all files together in a ZIP package.",
                  icon: Download,
                },
              ].map((item, i) => (
                <Card key={i} className="surface-hover border-border">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
                      <item.icon className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ─── 5. SUPPORTED FORMATS SECTION ─── */}
          <section className="space-y-6">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge className="badge-brand">Universal Compatibility</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Supported File Formats
              </h2>
              <p className="text-sm text-muted-foreground">
                ZeroMeta validates true binary signatures (magic bytes) to guarantee reliable processing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Images</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["JPG", "JPEG", "PNG", "WebP", "TIFF", "GIF"].map((ext) => (
                    <span key={ext} className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-medium">
                      {ext}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strips EXIF, GPS IFD, IPTC, XMP, and software tags. Re-encodes or preserves bitstreams.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["MP4", "MOV", "WebM", "MKV"].map((ext) => (
                    <span key={ext} className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-medium">
                      {ext}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Removes QuickTime atoms, user data, recording timestamps, and GPS tracking tracks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Music className="w-4 h-4" />
                  <span>Audio</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["MP3", "WAV", "FLAC", "M4A", "OGG"].map((ext) => (
                    <span key={ext} className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-medium">
                      {ext}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Purges ID3v1, ID3v2, Vorbis Comments, and hardware serials with bitexact copy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-medium">
                    PDF (1.0 – 2.0)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sanitizes Document Info Dictionary (/Title, /Author, /Creator) and embedded XMP streams.
                </p>
              </div>
            </div>
          </section>

          {/* ─── 6. PRIVACY ARCHITECTURE EXPLANATION ─── */}
          <section id="privacy" className="space-y-10 scroll-mt-24">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge className="badge-brand">Privacy Architecture</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Clear, Verified Privacy Principles
              </h2>
              <p className="text-sm text-muted-foreground">
                We clearly separate local browser execution from optional server tasks so you always know where your data lives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="surface-hover border-border">
                <CardContent className="p-6 space-y-3">
                  <Lock className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-bold text-base text-foreground">Client-Side by Default</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In standard mode, all metadata inspection, stripping, and editing occurs directly inside your web browser using HTML5 Canvas and local WebAssembly. Your media files never leave your computer.
                  </p>
                </CardContent>
              </Card>

              <Card className="surface-hover border-border">
                <CardContent className="p-6 space-y-3">
                  <Server className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-bold text-base text-foreground">Explicit Server Tasks</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Advanced server processing (e.g. sharp image optimizations) only occurs when you specifically select it. Files are processed in memory and never saved to persistent database storage or media caches.
                  </p>
                </CardContent>
              </Card>

              <Card className="surface-hover border-border">
                <CardContent className="p-6 space-y-3">
                  <Trash2 className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-bold text-base text-foreground">No Persistent Retention</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We do not harvest metadata, track uploaded filenames, or store media files. Diagnostic metrics are strictly privacy-conscious and contain zero file content or sensitive EXIF tags.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ─── 7. FAQ SECTION ─── */}
          <section id="faq" className="space-y-10 scroll-mt-24 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "Why should I remove EXIF data before sharing photos?",
                  a: "Smartphone photos automatically record exact GPS latitude and longitude coordinates, camera hardware serials, and timestamps. Removing EXIF prevents strangers, stalkers, or platforms from locating your home or tracking your daily routines.",
                },
                {
                  q: "Does ZeroMeta reduce visual image quality or resolution?",
                  a: "No. ZeroMeta preserves your original image resolution and pixel dimensions. Canvas re-encoding defaults to 95% high quality, and audio/video processing copies original streams without compression.",
                },
                {
                  q: "Can metadata removal erase visible watermarks or logos?",
                  a: "No. Metadata cleaning strips hidden digital header tags (EXIF, IPTC, XMP, GPS). Visible text or logos drawn into the image pixels are part of the image content. Use our Image Privacy Tools to blur or black out visible elements.",
                },
                {
                  q: "Does ZeroMeta remove SynthID or invisible AI watermarks?",
                  a: "No. Invisible AI watermarks (like DeepMind's SynthID) are mathematically embedded in the pixel distribution, not stored as metadata tags. No metadata cleaner can remove statistical latent watermarks, and claiming so is scientifically false.",
                },
                {
                  q: "Does PDF metadata cleaning remove all hidden document content?",
                  a: "ZeroMeta cleans Document Info dictionaries (/Title, /Author, /Creator, /Producer) and XMP packages. It does not alter text formatting, but does not guarantee removal of deep incremental revision history or visual redactions.",
                },
                {
                  q: "What are C2PA Content Credentials?",
                  a: "C2PA is a cryptographic authenticity standard backed by Adobe and camera makers. Removing metadata from a file with C2PA breaks the credential chain, which is often necessary when whistleblowers or privacy advocates need complete anonymity.",
                },
              ].map((faq, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-2">
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

          {/* ─── 8. STRONG FINAL CTA ─── */}
          <section className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-card to-muted border border-border text-center space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Take Control of Your Digital Privacy
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Clean hidden camera tags, GPS coordinates, and personal device footprints from your files completely offline.
            </p>
            <Button asChild size="lg" className="btn-primary h-12 px-8 text-sm font-semibold rounded-xl shadow-lg">
              <a href="#uploader">
                Start Cleaning Files Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </section>
        </div>
      </main>

      <Footer />

      {/* Metadata Inspector Modal */}
      <MetadataInspector
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        metadataBefore={inspectedFile?.metadataBefore || []}
        metadataAfter={inspectedFile?.result?.metadataAfter || []}
        fileName={inspectedFile?.file.name}
      />
    </div>
  );
}
