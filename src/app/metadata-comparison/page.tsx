"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { CompareSlider } from "@/components/compare-slider";
import { extractUnifiedMetadata, processUnifiedMediaFile } from "@/lib/unified-processor";
import { getMediaType } from "@/lib/media-types";
import { generateId } from "@/lib/utils";
import { DEFAULT_PROCESSING_OPTIONS } from "@/lib/constants";
import type { MediaFile, MetadataField } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitCompare,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Layers,
  ArrowRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { downloadBlob } from "@/lib/download";

export default function MetadataComparisonPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);
    const mediaFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        const metadataBefore = await extractUnifiedMetadata(file);

        const tempFile: MediaFile = {
          id: generateId(),
          file,
          mediaType: getMediaType(file) || ("image" as const),
          preview,
          status: "processing" as const,
          progress: 50,
          result: null,
          metadataBefore,
        };

        const result = await processUnifiedMediaFile(tempFile, DEFAULT_PROCESSING_OPTIONS);

        return {
          ...tempFile,
          status: "done" as const,
          progress: 100,
          result,
        };
      })
    );

    setFiles((prev) => {
      const updated = [...prev, ...mediaFiles];
      if (!activeFileId && updated.length > 0) {
        setActiveFileId(updated[0].id);
      }
      return updated;
    });
    setIsProcessing(false);
  }, [activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeFileId]);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setActiveFileId(null);
  }, []);

  const beforeFields = activeFile?.metadataBefore || [];
  const afterFields = activeFile?.result?.metadataAfter || [];

  const strippedFields = beforeFields.filter(
    (b) => !afterFields.some((a) => a.key === b.key && !a.stripped)
  );

  const exportComparisonReport = () => {
    if (!activeFile) return;
    const report = {
      filename: activeFile.file.name,
      originalSize: activeFile.file.size,
      processedSize: activeFile.result?.blob.size,
      totalOriginalFields: beforeFields.length,
      fieldsStrippedCount: strippedFields.length,
      strippedFields: strippedFields.map((f) => ({ key: f.key, originalValue: f.value, category: f.category })),
      preservedFields: afterFields,
    };

    downloadBlob(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      `${activeFile.file.name}-diff-report.json`
    );
  };

  return (
    <ToolShell
      title="Metadata Diff & Comparison Engine"
      badge="Side-by-Side Diff"
      description="Inspect exactly what metadata was detected, stripped, and preserved between the original and cleaned media files."
      breadcrumbs={[{ label: "Metadata Comparison" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select Media",
          desc: "Upload any image, video, audio, or PDF file to compare before and after state.",
        },
        {
          step: "02",
          title: "Automated Diff Generation",
          desc: "Our engine parses original tags and computes the exact delta of removed metadata.",
        },
        {
          step: "03",
          title: "Inspect Visual & Binary Diffs",
          desc: "Use the interactive compare slider for images and inspect the structured field-by-field table.",
        },
      ]}
      supportedFormats={[
        {
          format: "Images (JPG, PNG, WebP)",
          extension: ".jpg, .png, .webp",
          capabilities: "Interactive pixel compare slider + EXIF / GPS / XMP diff",
          notes: "Confirms visual fidelity while verifying metadata destruction.",
        },
        {
          format: "Audio & Video",
          extension: ".mp4, .mp3, .wav, .mov",
          capabilities: "Container header diff, tag removal audit",
          notes: "Audits track titles, encoders, artist tags.",
        },
        {
          format: "PDF Documents",
          extension: ".pdf",
          capabilities: "Document Info Dictionary & XMP metadata diff",
          notes: "Compares /Title, /Author, and modifying application.",
        },
      ]}
      privacyNotes={[
        "All comparison diff calculations run 100% in client-side memory.",
        "Nothing is uploaded or stored during comparison.",
      ]}
      limitations={[
        "Comparison diff evaluates header tag presence, not pixel steganography.",
      ]}
      faqs={[
        {
          q: "How does the comparison verify that GPS is gone?",
          a: "ZeroMeta inspects the raw output binary and confirms that GPS IFD markers, latitude, longitude, and timestamp tags are absent.",
        },
        {
          q: "Does the slider change image quality?",
          a: "No, the compare slider directly renders the original buffer on one half and the re-encoded clean buffer on the other so you can visually verify zero perceptible loss.",
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

        {isProcessing && (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            Analyzing metadata delta...
          </div>
        )}

        {files.length > 0 && activeFile && !isProcessing && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Multi-file selector */}
            {files.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {files.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFileId(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                      activeFile.id === f.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {f.file.name}
                  </button>
                ))}
              </div>
            )}

            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-primary" />
                  Comparison Audit: {activeFile.file.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {beforeFields.length} original tags detected • {strippedFields.length} tags stripped
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={exportComparisonReport}
                className="gap-1.5 h-8 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export Diff Report (JSON)
              </Button>
            </div>

            {/* Visual Compare Slider if Image */}
            {activeFile.mediaType === "image" && activeFile.preview && activeFile.result?.blob && (
              <div className="space-y-3 p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Visual Side-by-Side Verification
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Drag slider to compare original vs cleaned
                  </span>
                </div>
                <div className="max-w-2xl mx-auto overflow-hidden rounded-xl border border-border">
                  <CompareSlider
                    beforeImage={activeFile.preview}
                    afterImage={URL.createObjectURL(activeFile.result.blob)}
                    beforeLabel="Original (With Metadata)"
                    afterLabel="Cleaned (Zero Metadata)"
                  />
                </div>
              </div>
            )}

            {/* Field Diff Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Removed / Stripped Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Metadata Stripped ({strippedFields.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {strippedFields.length > 0 ? (
                    strippedFields.map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs"
                      >
                        <span className="font-medium text-foreground">{field.key}</span>
                        <span className="font-mono text-muted-foreground line-through">
                          {field.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground text-center">
                      No stripped fields recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Preserved / Retained Properties */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Preserved Structure ({afterFields.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {afterFields.map((field, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border text-xs"
                    >
                      <span className="font-medium text-foreground">{field.key}</span>
                      <span className="font-mono text-emerald-400">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

