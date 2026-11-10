"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { FileQueue } from "@/components/file-queue";
import { extractUnifiedMetadata, processUnifiedMediaFile } from "@/lib/unified-processor";
import { generateId } from "@/lib/utils";
import { downloadAsZip, downloadBlob } from "@/lib/download";
import { DEFAULT_PROCESSING_OPTIONS } from "@/lib/constants";
import type { MediaFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Video, Download, Play, RefreshCw, Film } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function VideoMetadataRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const videoFiles = newFiles.filter((f) => f.type.startsWith("video/") || [".mp4", ".mov", ".webm", ".mkv"].some((ext) => f.name.toLowerCase().endsWith(ext)));

    const mediaFiles = await Promise.all(
      videoFiles.map(async (file) => {
        const metadata = await extractUnifiedMetadata(file);

        return {
          id: generateId(),
          file,
          mediaType: "video" as const,
          preview: null,
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

  const handleDownloadSingle = useCallback((id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.result?.blob) {
      downloadBlob(target.result.blob, target.result.filename);
    }
  }, [files]);

  const handleProcessAll = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued" || f.status === "error");
    if (queuedFiles.length === 0) return;

    setIsProcessing(true);

    for (const item of queuedFiles) {
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
                  error: "Failed to process video",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "Video Cleaning Complete",
      description: "Container metadata atoms cleared.",
      variant: "success",
    });
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-clean-videos");
    setIsZipping(false);
    if (result.success) {
      toast({
        title: "ZIP Ready",
        description: `Exported ${result.fileCount} clean videos.`,
        variant: "success",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="Video Metadata Remover & Privacy Cleaner"
      badge="Video Container Neutralizer"
      description="Clean QuickTime atoms, camera models, recording timestamps, and GPS tracking coordinates from MP4, MOV, WebM, and MKV video files."
      breadcrumbs={[{ label: "Video Metadata Remover" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select Video Files",
          desc: "Upload MP4, MOV, WebM, or MKV video recordings from cameras, drones, or smartphones.",
        },
        {
          step: "02",
          title: "Metadata Atom Stripping",
          desc: "ZeroMeta neutralizes moov, udta, and user data atoms while bit-copying video and audio streams.",
        },
        {
          step: "03",
          title: "Save Cleaned Video",
          desc: "Download video files without losing visual resolution or audio fidelity.",
        },
      ]}
      supportedFormats={[
        {
          format: "MP4 / M4V",
          extension: ".mp4, .m4v",
          capabilities: "QuickTime atoms, creation time, handler descriptions",
          notes: "Stream copy ensures zero re-encoding time for fast processing.",
        },
        {
          format: "QuickTime MOV",
          extension: ".mov",
          capabilities: "Apple iPhone ProRes / HEVC metadata atoms, location tags",
          notes: "Cleans smartphone camera profiles.",
        },
        {
          format: "WebM / MKV",
          extension: ".webm, .mkv",
          capabilities: "Matroska Title, WritingApp, MuxingApp",
          notes: "Removes encoder fingerprints.",
        },
      ]}
      privacyNotes={[
        "Runs on-device via WebAssembly stream processors.",
        "Your private video footage is never uploaded to third-party cloud servers.",
      ]}
      limitations={[
        "Video metadata cleaning removes digital header tags; visual elements (like faces or timestamps burned into the video frames) are not removed.",
      ]}
      faqs={[
        {
          q: "Does cleaning video metadata cause loss of video quality?",
          a: "No. Video metadata stripping uses bitexact stream copy flags, leaving video H.264/HEVC/VP9 streams and AAC/Opus audio streams 100% unaltered.",
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
          allowedType="video"
        />

        {files.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">{files.length}</span> videos queued •{" "}
                <span className="font-semibold text-emerald-600">{doneCount}</span> cleaned
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
                        Cleaning Video...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Strip Video Metadata ({queuedCount})
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
                    {isZipping ? "Packaging..." : `Download Videos (${doneCount})`}
                  </Button>
                )}
              </div>
            </div>

            <FileQueue
              files={files as any}
              onRemove={handleRemove}
              onInspect={() => {}}
              onDownload={handleDownloadSingle}
            />
          </div>
        )}
      </div>
    </ToolShell>
  );
}

