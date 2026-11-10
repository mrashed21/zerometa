"use client";

import { useState, useCallback, useRef } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { FileQueue } from "@/components/file-queue";
import { ControlPanel } from "@/components/control-panel";
import { MetadataInspector } from "@/components/metadata-inspector";
import { extractUnifiedMetadata, processUnifiedMediaFile } from "@/lib/unified-processor";
import { getMediaType } from "@/lib/media-types";
import { generateId } from "@/lib/utils";
import { downloadAsZip, downloadBlob } from "@/lib/download";
import { DEFAULT_PROCESSING_OPTIONS } from "@/lib/constants";
import type { MediaFile, ImageFile, ProcessingOptions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Eraser, Download, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function MetadataRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_PROCESSING_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedFile, setInspectedFile] = useState<MediaFile | null>(null);

  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

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
          status: "queued" as const,
          progress: 0,
          result: null,
          metadataBefore: metadata,
        };
      })
    );

    setFiles((prev) => [...prev, ...mediaFiles]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

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
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing", progress: 10 } : f))
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
      description: "All files have been sanitized.",
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
        description: `Packed ${result.fileCount} cleaned files into archive.`,
        variant: "success",
      });
    } else {
      toast({
        title: "ZIP Failed",
        description: result.error || "Could not generate archive.",
        variant: "error",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="Universal Metadata Remover"
      badge="Full Privacy Strip"
      description="Remove all embedded EXIF, IPTC, XMP, GPS coordinates, device models, and editing software signatures from your files while preserving visual quality."
      breadcrumbs={[{ label: "Metadata Remover" }]}
      howItWorks={[
        {
          step: "01",
          title: "Queue Your Files",
          desc: "Upload images, videos, audio clips, or PDF documents in batch.",
        },
        {
          step: "02",
          title: "Select Cleaning Rules",
          desc: "Choose fast client-side re-encoding or high-precision sharpness optimization.",
        },
        {
          step: "03",
          title: "Download Clean Files",
          desc: "Save individual sanitized media files or download all in a ZIP package.",
        },
      ]}
      supportedFormats={[
        {
          format: "All Images",
          extension: "JPG, PNG, WebP, GIF, TIFF",
          capabilities: "Full EXIF / GPS / XMP strip, canvas re-encoding, orientation normalized",
          notes: "Preserves pixel dimensions and native color space.",
        },
        {
          format: "Audio Files",
          extension: "MP3, WAV, FLAC, M4A, OGG",
          capabilities: "ID3v1, ID3v2, Vorbis Comments, INFO chunks removed",
          notes: "Bitexact audio stream preservation.",
        },
        {
          format: "Video Clips",
          extension: "MP4, MOV, WebM, MKV",
          capabilities: "QuickTime meta atom, udta tags, track titles neutralized",
          notes: "Preserves original codecs and audio channels.",
        },
        {
          format: "PDF Documents",
          extension: "PDF",
          capabilities: "Info Dictionary & XMP packets sanitized",
          notes: "Preserves vector typography and document structure.",
        },
      ]}
      privacyNotes={[
        "Standard mode executes 100% inside your browser memory.",
        "Zero tracking cookies, zero analytics on file contents.",
        "Files are completely discarded when browser tab is closed.",
      ]}
      limitations={[
        "Metadata removal strips header tags, not visible watermark text printed on pixels.",
        "Invisible watermarking methods embedded in latents (e.g. SynthID) cannot be removed via metadata stripping.",
      ]}
      faqs={[
        {
          q: "Does metadata removal decrease image sharpness or resolution?",
          a: "No. By default, ZeroMeta preserves your original dimensions and visually identical resolution. For images, re-encoding defaults to 95% high quality.",
        },
        {
          q: "Can I clean multiple files at once?",
          a: "Yes. You can queue dozens of files and clean them in a single batch, then export everything as a single ZIP archive.",
        },
      ]}
    >
      <div className="space-y-6">
        <UniversalUploader
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemove={handleRemove}
          onClearAll={handleClearAll}
          disabled={isProcessing}
          allowedType="all"
        />

        {files.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{files.length}</span> total files •{" "}
                <span className="font-semibold text-emerald-400">{doneCount}</span> cleaned •{" "}
                <span className="font-semibold text-amber-400">{queuedCount}</span> ready
              </div>

              <div className="flex items-center gap-3">
                {queuedCount > 0 && (
                  <Button
                    onClick={handleProcessAll}
                    disabled={isProcessing}
                    className="btn-primary gap-2 h-9 text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Cleaning...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Clean All Files ({queuedCount})
                      </>
                    )}
                  </Button>
                )}

                {doneCount > 0 && (
                  <Button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    variant="outline"
                    className="gap-2 h-9 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    {isZipping ? "Creating ZIP..." : `Download ZIP (${doneCount})`}
                  </Button>
                )}
              </div>
            </div>

            {/* Queue List */}
            <FileQueue
              files={files as any}
              onRemove={handleRemove}
              onInspect={handleInspect}
              onDownload={handleDownloadSingle}
            />
          </div>
        )}

        {/* Metadata Inspector Dialog */}
        <MetadataInspector
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          metadataBefore={inspectedFile?.metadataBefore || []}
          metadataAfter={inspectedFile?.result?.metadataAfter || []}
          fileName={inspectedFile?.file.name}
        />
      </div>
    </ToolShell>
  );
}

