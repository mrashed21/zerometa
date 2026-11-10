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
import { MapPin, MapPinOff, Download, Play, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function GpsRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const mediaFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
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
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing", progress: 25 } : f))
      );

      try {
        const result = await processUnifiedMediaFile(item, DEFAULT_PROCESSING_OPTIONS);

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
                  error: "Failed to remove GPS tags",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "GPS Neutralized",
      description: "All location tags and coordinates have been deleted.",
      variant: "success",
    });
  };

  const gpsFiles = files.filter((f) =>
    f.metadataBefore.some((m) => m.category === "location" || m.key.toLowerCase().includes("gps"))
  );

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="Photo GPS & Geolocation Remover"
      badge="Location Shield"
      description="Scan your photos for hidden latitude, longitude, altitude, and timestamp coordinates, and strip location tags before sharing publicly."
      breadcrumbs={[{ label: "GPS Remover" }]}
      howItWorks={[
        {
          step: "01",
          title: "Scan For Location",
          desc: "Upload photos taken with your smartphone or digital camera to inspect embedded GPS tags.",
        },
        {
          step: "02",
          title: "Delete Geolocation Records",
          desc: "ZeroMeta purges the GPS IFD directory, latitude/longitude records, and GPS altitude stamps.",
        },
        {
          step: "03",
          title: "Safe Sharing",
          desc: "Download photos verified to have zero geolocation markers.",
        },
      ]}
      supportedFormats={[
        {
          format: "JPEG / JPG",
          extension: ".jpg, .jpeg",
          capabilities: "GPS IFD, GPSLatitude, GPSLongitude, GPSAltitude, GPSTimeStamp",
          notes: "Complete neutralization of smartphone geotags.",
        },
        {
          format: "HEIC / Apple Live Photos",
          extension: ".heic, .jpg",
          capabilities: "Apple MakerNotes location data",
          notes: "Removes iPhone geotags safely.",
        },
        {
          format: "WebP / PNG",
          extension: ".webp, .png",
          capabilities: "XMP and eXIf location blocks",
          notes: "Strips location packets embedded in modern web image formats.",
        },
      ]}
      privacyNotes={[
        "Location inspection and deletion runs entirely in your browser.",
        "Your real-world GPS coordinates are never sent across the internet.",
      ]}
      limitations={[
        "Important: Removing GPS metadata removes digital coordinate tags only.",
        "Visible landmarks, street signs, house numbers, or distinctive architectural clues in the pixels themselves are NOT altered.",
      ]}
      faqs={[
        {
          q: "How accurate is GPS metadata in phone photos?",
          a: "Smartphone GPS geotags are often accurate to within 3 to 5 meters. Anyone downloading an uncleaned photo can view your exact home, school, or workplace address on Google Maps.",
        },
        {
          q: "Does removing GPS alter my photo pixels?",
          a: "No. The visual contents of your photo are untouched. Only the digital header tags containing coordinates and altitudes are removed.",
        },
      ]}
    >
      <div className="space-y-6">
        {/* Pixel Disclaimer Alert */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-900 uppercase tracking-wide">
              Critical Privacy Disclosure
            </span>
            <p className="text-muted-foreground leading-relaxed">
              GPS metadata remover completely purges digital latitude/longitude coordinates and satellite altitude records from your file headers.
              However, <strong>visible location clues in the image pixels (such as street signs, landmarks, or vehicle license plates) are not removed</strong>. If you need to obscure physical details in the photo, use our <a href="/image-privacy-tools" className="text-primary underline">Image Privacy Redaction Tool</a>.
            </p>
          </div>
        </div>

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
            {/* GPS Detection summary */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-xs">
                {gpsFiles.length > 0 ? (
                  <>
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-rose-700 font-medium">
                      GPS coordinates detected in {gpsFiles.length} of {files.length} photos.
                    </span>
                  </>
                ) : (
                  <>
                    <MapPinOff className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-medium">
                      No GPS coordinates found in queued files (or already stripped).
                    </span>
                  </>
                )}
              </div>

              {queuedCount > 0 && (
                <Button
                  onClick={handleProcessAll}
                  disabled={isProcessing}
                  className="btn-primary gap-2 h-9 text-xs"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Stripping Location...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Strip All GPS Data ({queuedCount})
                    </>
                  )}
                </Button>
              )}
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

