"use client";

import { useState, useCallback } from "react";
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
import { Camera, Download, Play, RefreshCw, MapPinOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ExifRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedFile, setInspectedFile] = useState<MediaFile | null>(null);

  const { toast } = useToast();

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const mediaFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const metadata = await extractUnifiedMetadata(file);

        return {
          id: generateId(),
          file,
          mediaType: "image" as const,
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
                  error: err instanceof Error ? err.message : "EXIF removal failed",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "EXIF Removed",
      description: "Images sanitized successfully.",
      variant: "success",
    });
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-exif-stripped");
    setIsZipping(false);
    if (result.success) {
      toast({
        title: "ZIP Ready",
        description: `Exported ${result.fileCount} clean images.`,
        variant: "success",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="Dedicated EXIF Metadata Remover"
      badge="Photography Privacy"
      description="Inspect and strip all EXIF tags, camera serial numbers, lens models, shutter speed, ISO values, and GPS coordinates from your photos while preserving original dimensions."
      breadcrumbs={[{ label: "EXIF Remover" }]}
      howItWorks={[
        {
          step: "01",
          title: "Drop Your Photos",
          desc: "Select JPG, PNG, WebP, or TIFF photos directly from your phone or desktop.",
        },
        {
          step: "02",
          title: "EXIF Header Stripping",
          desc: "ZeroMeta isolates and eliminates APP1 / eXIf blocks without modifying photo quality.",
        },
        {
          step: "03",
          title: "Download Anonymous Photos",
          desc: "Save your stripped photos safely for public posting on social networks or classifieds.",
        },
      ]}
      supportedFormats={[
        {
          format: "JPEG / JPG",
          extension: ".jpg, .jpeg",
          capabilities: "APP1 EXIF Marker, SubIFD, GPS IFD, MakerNote",
          notes: "Complete neutralization of camera, lens, and geolocation tags.",
        },
        {
          format: "PNG",
          extension: ".png",
          capabilities: "eXIf chunk, tEXt, zTXt, iTXt chunks",
          notes: "Strips ancillary metadata chunks while preserving alpha channel transparency.",
        },
        {
          format: "WebP",
          extension: ".webp",
          capabilities: "EXIF chunk, XMP chunk",
          notes: "Maintains optimal WebP compression.",
        },
      ]}
      privacyNotes={[
        "Runs 100% inside your browser sandbox.",
        "Your photos are never transmitted over the internet or logged on any server.",
      ]}
      limitations={[
        "Strips digital metadata only. Visible details in the image (like street signs or recognizable landmarks) remain visible in the photo pixels.",
      ]}
      faqs={[
        {
          q: "What is EXIF data?",
          a: "Exchangeable Image File Format (EXIF) is data automatically written into image files by digital cameras and smartphones. It records date, time, camera settings (aperture, ISO, shutter speed), phone serials, and exact GPS coordinates.",
        },
        {
          q: "Does removing EXIF change the photo orientation?",
          a: "No. ZeroMeta normalizes and bakes in the correct orientation so your photo displays upright everywhere without needing the EXIF orientation tag.",
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
          allowedType="image"
        />

        {files.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPinOff className="w-4 h-4 text-emerald-400" />
                <span>GPS coordinates & camera serials will be permanently removed.</span>
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
                        Stripping EXIF...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Strip EXIF ({queuedCount})
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
                    {isZipping ? "Packaging..." : `Download All (${doneCount})`}
                  </Button>
                )}
              </div>
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

