"use client";

import { useState, useCallback, useRef } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { FileQueue } from "@/components/file-queue";
import { MetadataInspector } from "@/components/metadata-inspector";
import { extractUnifiedMetadata, processUnifiedMediaFile } from "@/lib/unified-processor";
import { getMediaType } from "@/lib/media-types";
import { generateId } from "@/lib/utils";
import { downloadAsZip, downloadBlob } from "@/lib/download";
import { DEFAULT_PROCESSING_OPTIONS } from "@/lib/constants";
import type { MediaFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Layers, Download, Play, RefreshCw, CheckCircle2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";

export default function BatchMetadataRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

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
    setBatchProgress(0);
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
    }
  }, [files]);

  const handleProcessBatch = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued" || f.status === "error");
    if (queuedFiles.length === 0) return;

    setIsProcessing(true);
    abortRef.current = new AbortController();

    let processedCount = 0;
    const total = queuedFiles.length;

    for (const item of queuedFiles) {
      if (abortRef.current?.signal.aborted) break;

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing", progress: 20 } : f))
      );

      try {
        const result = await processUnifiedMediaFile(item, DEFAULT_PROCESSING_OPTIONS, (p) => {
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
                  error: err instanceof Error ? err.message : "Cleaning failed",
                }
              : f
          )
        );
      }

      processedCount++;
      setBatchProgress(Math.round((processedCount / total) * 100));
    }

    setIsProcessing(false);
    toast({
      title: "Batch Complete",
      description: `Finished processing ${processedCount} file${processedCount > 1 ? "s" : ""}.`,
      variant: "success",
    });
  };

  const handleRetryFailed = () => {
    setFiles((prev) =>
      prev.map((f) => (f.status === "error" ? { ...f, status: "queued", progress: 0, error: undefined } : f))
    );
    handleProcessBatch();
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-batch-cleaned");
    setIsZipping(false);

    if (result.success) {
      toast({
        title: "ZIP Ready",
        description: `Exported ${result.fileCount} clean files.`,
        variant: "success",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <ToolShell
      title="High-Volume Batch Media Cleaner"
      badge="Batch Queue Engine"
      description="Queue and process dozens of files simultaneously across images, videos, audio, and PDF documents with real-time queue metrics and failure recovery."
      breadcrumbs={[{ label: "Batch Media Cleaner" }]}
      howItWorks={[
        {
          step: "01",
          title: "Drag Entire Folders or Files",
          desc: "Drop up to 50 files simultaneously into the high-capacity queue.",
        },
        {
          step: "02",
          title: "Continuous Async Processing",
          desc: "Each file is sequentially stripped of EXIF, GPS, and XMP headers while monitoring individual progress.",
        },
        {
          step: "03",
          title: "ZIP Package Generation",
          desc: "Download all sanitized files compressed into a neat, sanitized ZIP file with zero file loss.",
        },
      ]}
      supportedFormats={[
        {
          format: "Mixed Formats",
          extension: "JPG, PNG, WebP, TIFF, MP4, MOV, MP3, WAV, PDF",
          capabilities: "Unified batch queue handling cross-media files in a single pass",
          notes: "Automatically dispatches files to their respective format sanitizer.",
        },
      ]}
      privacyNotes={[
        "Batch processing stays completely local within browser memory.",
        "ZIP files are assembled on-the-fly using browser memory blobs.",
      ]}
      limitations={[
        "Very large batches (e.g. 50+ video files totaling multiple gigabytes) may be constrained by available device RAM.",
      ]}
      faqs={[
        {
          q: "What happens if one file in the batch fails?",
          a: "ZeroMeta isolates errors per file. If one corrupted file fails, the rest of the batch continues smoothly, and a 'Retry Failed' button allows you to re-attempt failed items.",
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
            {/* Batch Status Bar */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Queue Status ({files.length} items)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doneCount} Completed • {queuedCount} Waiting • {errorCount} Failed
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {errorCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryFailed}
                      disabled={isProcessing}
                      className="gap-1.5 h-9 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Failed ({errorCount})
                    </Button>
                  )}

                  {queuedCount > 0 && (
                    <Button
                      onClick={handleProcessBatch}
                      disabled={isProcessing}
                      className="btn-primary gap-2 h-9 text-xs"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Batch...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Batch ({queuedCount})
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
                      {isZipping ? "Packing ZIP..." : `Download All in ZIP (${doneCount})`}
                    </Button>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Overall Batch Progress</span>
                    <span className="font-mono">{batchProgress}%</span>
                  </div>
                  <Progress value={batchProgress} className="h-2" />
                </div>
              )}
            </div>

            <FileQueue
              files={files as any}
              onRemove={handleRemove}
              onInspect={handleInspect}
              onDownload={handleDownloadSingle}
            />
          </div>
        )}

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

