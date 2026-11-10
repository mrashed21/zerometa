"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { extractUnifiedMetadata } from "@/lib/unified-processor";
import { getMediaType } from "@/lib/media-types";
import { generateId } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import type { MediaFile, MetadataField } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  MapPin,
  Cpu,
  Code,
  FileSearch,
  Download,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  camera: <Camera className="w-4 h-4 text-blue-400" />,
  location: <MapPin className="w-4 h-4 text-rose-400" />,
  ai: <Cpu className="w-4 h-4 text-purple-400" />,
  software: <Code className="w-4 h-4 text-amber-400" />,
  other: <FileSearch className="w-4 h-4 text-zinc-400" />,
};

export default function MetadataViewerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const mediaFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        const metadata = await extractUnifiedMetadata(file);

        return {
          id: generateId(),
          file,
          mediaType: getMediaType(file) || ("image" as const),
          preview,
          status: "done" as const,
          progress: 100,
          result: null,
          metadataBefore: metadata,
        };
      })
    );

    setFiles((prev) => {
      const updated = [...prev, ...mediaFiles];
      if (!selectedFileId && updated.length > 0) {
        setSelectedFileId(updated[0].id);
      }
      return updated;
    });
  }, [selectedFileId]);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [selectedFileId]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setSelectedFileId(null);
  }, []);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  // GPS detection helper
  const latField = selectedFile?.metadataBefore.find((f) => f.key.includes("Latitude"));
  const lonField = selectedFile?.metadataBefore.find((f) => f.key.includes("Longitude"));
  const hasGps = Boolean(latField || lonField);

  // Filtered fields
  const displayedFields = selectedFile
    ? activeCategory === "all"
      ? selectedFile.metadataBefore
      : selectedFile.metadataBefore.filter((f) => f.category === activeCategory)
    : [];

  const exportReport = (format: "json" | "csv" | "txt") => {
    if (!selectedFile) return;
    const name = selectedFile.file.name;

    if (format === "json") {
      const data = {
        fileName: name,
        fileSize: selectedFile.file.size,
        mediaType: selectedFile.mediaType,
        inspectedAt: new Date().toISOString(),
        metadata: selectedFile.metadataBefore,
      };
      downloadBlob(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
        `${name}-metadata.json`
      );
    } else if (format === "csv") {
      let csv = "Category,Property,Value\n";
      selectedFile.metadataBefore.forEach((f) => {
        csv += `"${f.category}","${f.key}","${f.value.replace(/"/g, '""')}"\n`;
      });
      downloadBlob(new Blob([csv], { type: "text/csv" }), `${name}-metadata.csv`);
    } else {
      let txt = `ZeroMeta Inspection Report\nFile: ${name}\nDate: ${new Date().toLocaleString()}\n\n`;
      selectedFile.metadataBefore.forEach((f) => {
        txt += `[${f.category.toUpperCase()}] ${f.key}: ${f.value}\n`;
      });
      downloadBlob(new Blob([txt], { type: "text/plain" }), `${name}-metadata.txt`);
    }
  };

  return (
    <ToolShell
      title="Universal Metadata Viewer & Inspector"
      badge="Offline Inspection"
      description="Inspect EXIF, IPTC, XMP, GPS coordinates, device serials, camera lenses, and C2PA credentials across images, videos, audio, and documents."
      breadcrumbs={[{ label: "Metadata Viewer" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select Any Media File",
          desc: "Drag and drop any JPG, PNG, WebP, MP4, MP3, or PDF directly into your browser.",
        },
        {
          step: "02",
          title: "Instant In-Memory Extraction",
          desc: "Our engine scans binary headers, IFD tables, and XMP packets without sending bytes to any server.",
        },
        {
          step: "03",
          title: "Categorized Report & Export",
          desc: "Review device models, location clues, timestamps, and export structured JSON/CSV reports.",
        },
      ]}
      supportedFormats={[
        {
          format: "JPEG / JPG",
          extension: ".jpg, .jpeg",
          capabilities: "EXIF IFD0, SubIFD, GPS, IPTC, XMP, C2PA Manifests",
          notes: "Full camera exposure parameters, focal length, lens serial numbers.",
        },
        {
          format: "PNG / WebP",
          extension: ".png, .webp",
          capabilities: "eXIf chunks, textual comments, XMP packets",
          notes: "Software tags, rendering engines, and transparency metadata.",
        },
        {
          format: "Video (MP4 / WebM / MOV)",
          extension: ".mp4, .mov, .webm",
          capabilities: "QuickTime atoms, ISO base media tracks, container properties",
          notes: "Resolution, framerate, duration, audio channels.",
        },
        {
          format: "PDF Document",
          extension: ".pdf",
          capabilities: "Document Info Dictionary (/Title, /Author, /Creator), XMP streams",
          notes: "Detects software generator, modification dates, and producer signatures.",
        },
      ]}
      privacyNotes={[
        "Files are parsed strictly inside your browser sandbox using ArrayBuffers.",
        "Zero network requests are triggered when inspecting metadata.",
        "No files or extracted GPS coordinates are logged or transmitted.",
      ]}
      limitations={[
        "Viewer only displays metadata tags actually encoded in the file headers.",
        "Corrupted or stripped headers will not yield EXIF or IPTC values.",
        "Steganographic hidden data or non-standard proprietary tags may not be parsed.",
      ]}
      faqs={[
        {
          q: "What kind of sensitive data does this viewer reveal?",
          a: "Most modern smartphone photos include exact GPS latitude/longitude, altitude, timestamp, phone model, iOS/Android version, and unique camera hardware IDs.",
        },
        {
          q: "Does opening a file here compromise my privacy?",
          a: "No. ZeroMeta processes your file 100% locally in your browser memory. We have no servers observing or logging your inspection.",
        },
        {
          q: "Can I export the metadata for forensic or archive purposes?",
          a: "Yes. You can export complete reports in JSON, CSV, or formatted text with one click.",
        },
      ]}
    >
      <div className="space-y-6">
        <UniversalUploader
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemove={handleRemove}
          onClearAll={handleClearAll}
          allowedType="all"
        />

        {files.length > 0 && selectedFile && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* File Switcher Tabs */}
            {files.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {files.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFileId(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                      selectedFile.id === f.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f.file.name}
                  </button>
                ))}
              </div>
            )}

            {/* Header info & export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-primary" />
                  {selectedFile.file.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(selectedFile.file.size / 1024).toFixed(1)} KB • {selectedFile.mediaType.toUpperCase()} • {selectedFile.metadataBefore.length} fields detected
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => exportReport("json")} className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" /> JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport("csv")} className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport("txt")} className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" /> TXT
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(selectedFile.id)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* GPS Warning Banner if coordinates present */}
            {hasGps && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Geolocation Footprint Detected</h4>
                    <p className="text-xs text-muted-foreground">
                      This file contains exact GPS coordinates pinpointing the physical location where it was recorded.
                    </p>
                  </div>
                </div>
                {latField && lonField && (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(latField.value)},${encodeURIComponent(lonField.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-medium hover:bg-rose-500/30 transition-colors"
                  >
                    <span>View Coordinates</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: "All Properties", count: selectedFile.metadataBefore.length },
                { id: "camera", label: "Camera & Hardware", count: selectedFile.metadataBefore.filter((f) => f.category === "camera").length },
                { id: "location", label: "Location & GPS", count: selectedFile.metadataBefore.filter((f) => f.category === "location").length },
                { id: "software", label: "Software & OS", count: selectedFile.metadataBefore.filter((f) => f.category === "software").length },
                { id: "ai", label: "AI & Provenance", count: selectedFile.metadataBefore.filter((f) => f.category === "ai").length },
                { id: "other", label: "General & Container", count: selectedFile.metadataBefore.filter((f) => f.category === "other").length },
              ]
                .filter((cat) => cat.id === "all" || cat.count > 0)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
            </div>

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {displayedFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-muted shrink-0">
                      {categoryIcons[field.category] || categoryIcons.other}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate block">
                        {field.key}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {field.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-foreground bg-muted/60 px-2.5 py-1 rounded-md max-w-[200px] truncate text-right">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

