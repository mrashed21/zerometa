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
import { Music, Download, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AudioMetadataRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const audioFiles = newFiles.filter((f) => f.type.startsWith("audio/") || [".mp3", ".wav", ".flac", ".m4a", ".ogg"].some((ext) => f.name.toLowerCase().endsWith(ext)));

    const mediaFiles = await Promise.all(
      audioFiles.map(async (file) => {
        const metadata = await extractUnifiedMetadata(file);

        return {
          id: generateId(),
          file,
          mediaType: "audio" as const,
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
                  error: "Failed to sanitize audio tags",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "Audio Sanitized",
      description: "ID3 and audio tags cleared successfully.",
      variant: "success",
    });
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-clean-audio");
    setIsZipping(false);
    if (result.success) {
      toast({
        title: "ZIP Ready",
        description: `Exported ${result.fileCount} clean audio files.`,
        variant: "success",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="Audio Metadata Remover (ID3 & Vorbis Cleaner)"
      badge="Audio Privacy"
      description="Remove ID3v1, ID3v2, Vorbis Comments, artist tags, album titles, lyrics, and recording hardware serials from MP3, WAV, FLAC, M4A, and OGG audio tracks."
      breadcrumbs={[{ label: "Audio Metadata Remover" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select Audio Recordings",
          desc: "Upload voice memos, podcast tracks, music stems, or sound recordings.",
        },
        {
          step: "02",
          title: "Audio Tag Purge",
          desc: "ZeroMeta discards ID3 frames and comment chunks while retaining the bitexact audio stream.",
        },
        {
          step: "03",
          title: "Save Cleaned Audio",
          desc: "Download pristine, anonymized audio files without re-encoding quality loss.",
        },
      ]}
      supportedFormats={[
        {
          format: "MP3 Audio",
          extension: ".mp3",
          capabilities: "ID3v1, ID3v2.3, ID3v2.4 headers, APE tags",
          notes: "Bitexact audio stream preservation.",
        },
        {
          format: "WAV Audio",
          extension: ".wav",
          capabilities: "RIFF INFO chunks, BEXT broadcast wav metadata",
          notes: "Leaves uncompressed PCM audio bytes 100% intact.",
        },
        {
          format: "FLAC / M4A / OGG",
          extension: ".flac, .m4a, .ogg",
          capabilities: "Vorbis Comments, iTunes metadata atoms",
          notes: "Preserves lossless acoustic dynamics.",
        },
      ]}
      privacyNotes={[
        "Audio processing runs client-side.",
        "Voice recordings, personal interviews, and music stems are never uploaded.",
      ]}
      limitations={[
        "Only digital container tags are removed; acoustic watermarks or spoken audio words remain within the soundtrack.",
      ]}
      faqs={[
        {
          q: "Does cleaning audio reduce sample rate or bitrate?",
          a: "No. Stream copy mode directly transfers the encoded or uncompressed audio packets without re-encoding.",
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
          allowedType="audio"
        />

        {files.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">{files.length}</span> audio track{files.length > 1 ? "s" : ""} •{" "}
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
                        Cleaning Audio...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Clean Audio Tracks ({queuedCount})
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
                    {isZipping ? "Packaging..." : `Download Audio (${doneCount})`}
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

