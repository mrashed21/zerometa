/**
 * Unified Media Processing Orchestrator
 * Central hub routing images, videos, audio, and documents through appropriate
 * privacy-focused client-side or server-side pipelines.
 */

import { extractMetadata as extractImageMetadata, processImageCanvas } from "./canvas-processor";
import { extractPdfMetadata, sanitizePdfMetadata } from "./pdf-processor";
import type {
  ImageFile,
  MediaFile,
  MediaType,
  MetadataField,
  ProcessingOptions,
  ProcessingResult,
} from "./types";
import { getMediaType } from "./media-types";
import { MAX_SERVER_IMAGE_UPLOAD_BYTES } from "./constants";

/**
 * Extracts metadata for any supported file format.
 */
export async function extractUnifiedMetadata(file: File): Promise<MetadataField[]> {
  const mediaType = getMediaType(file);

  if (mediaType === "document" || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdfMetadata(file);
  }

  if (mediaType === "video") {
    return extractVideoMetadata(file);
  }

  if (mediaType === "audio") {
    return extractAudioMetadata(file);
  }

  // Default: image metadata extraction
  return extractImageMetadata(file);
}

/**
 * Processes a MediaFile according to user options.
 */
export async function processUnifiedMediaFile(
  mediaFile: MediaFile,
  options: ProcessingOptions,
  onProgress?: (progress: number) => void,
): Promise<ProcessingResult> {
  const file = mediaFile.file;
  const mediaType = mediaFile.mediaType;

  // 1. Documents (PDF)
  if (mediaType === "document" || file.name.toLowerCase().endsWith(".pdf")) {
    onProgress?.(30);
    const { blob, metadataAfter } = await sanitizePdfMetadata(file);
    onProgress?.(100);

    const filename = file.name.replace(/\.[^.]+$/, "_cleaned.pdf");

    return {
      blob,
      mimeType: "application/pdf",
      filename,
      metadataAfter,
      stats: {
        fieldsFound: mediaFile.metadataBefore.length,
        fieldsRemoved: Math.max(0, mediaFile.metadataBefore.length - metadataAfter.length),
        originalSize: file.size,
        processedSize: blob.size,
        savedBytes: Math.max(0, file.size - blob.size),
        savedPercent: file.size > 0 ? Math.round(((file.size - blob.size) / file.size) * 100) : 0,
      },
    };
  }

  // 2. Video & Audio
  if (mediaType === "video" || mediaType === "audio") {
    onProgress?.(15);
    const { processMediaFFmpeg } = await import("./ffmpeg-processor");
    const { blob, metadataAfter } = await processMediaFFmpeg(mediaFile, options, onProgress);
    const ext = file.name.split(".").pop() || (mediaType === "video" ? "mp4" : "mp3");
    const filename = file.name.replace(/\.[^.]+$/, `_cleaned.${ext}`);

    return {
      blob,
      mimeType: file.type || (mediaType === "video" ? "video/mp4" : "audio/mpeg"),
      filename,
      metadataAfter,
      stats: {
        fieldsFound: mediaFile.metadataBefore.length,
        fieldsRemoved: Math.max(0, mediaFile.metadataBefore.length - metadataAfter.length),
        originalSize: file.size,
        processedSize: blob.size,
        savedBytes: Math.max(0, file.size - blob.size),
        savedPercent: file.size > 0 ? Math.round(((file.size - blob.size) / file.size) * 100) : 0,
      },
    };
  }

  // 3. Images: Fast Mode (Canvas) or Advanced Mode (Server Sharp)
  if (options.mode === "advanced") {
    onProgress?.(20);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", options.format);
    formData.append("quality", String(options.quality));
    formData.append("microCrop", String(options.microCrop));
    formData.append("colorShift", String(options.colorShift));
    formData.append("noiseInjection", String(options.noiseInjection));
    formData.append("privacyMode", options.privacyMode);

    if (mediaFile.cropData) {
      formData.append("cropX", String(mediaFile.cropData.x));
      formData.append("cropY", String(mediaFile.cropData.y));
      formData.append("cropW", String(mediaFile.cropData.width));
      formData.append("cropH", String(mediaFile.cropData.height));
    }

    if (mediaFile.customResize?.enabled) {
      formData.append("resizeEnabled", "true");
      if (mediaFile.customResize.width) formData.append("resizeW", String(mediaFile.customResize.width));
      if (mediaFile.customResize.height) formData.append("resizeH", String(mediaFile.customResize.height));
      formData.append("resizeMaintainAspect", String(mediaFile.customResize.maintainAspectRatio));
      if (mediaFile.customResize.preset) formData.append("resizePreset", mediaFile.customResize.preset);
      if (mediaFile.customResize.mode) formData.append("resizeMode", mediaFile.customResize.mode);
    }

    onProgress?.(50);
    const response = await fetch("/api/process-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server returned ${response.status}`);
    }

    onProgress?.(80);
    const blob = await response.blob();
    onProgress?.(100);

    const extMap: Record<string, string> = {
      jpeg: "jpg",
      png: "png",
      webp: "webp",
      avif: "avif",
      gif: "gif",
    };
    const targetExt = extMap[options.format] || "jpg";
    const filename = mediaFile.customName || file.name.replace(/\.[^.]+$/, `_cleaned.${targetExt}`);

    const metadataMode = response.headers.get("X-Metadata-Mode");
    const metadataAfter: MetadataField[] = metadataMode === "clean-branding"
      ? [
          {
            key: "Source Metadata",
            value: "Removed; selected branding EXIF fields written separately",
            category: "other",
            stripped: true,
          },
          {
            key: "Branding Metadata",
            value: "Selected branding fields applied; output not independently inspected",
            category: "software",
            stripped: false,
          },
        ]
      : [
          {
            key: "Embedded Image Metadata",
            value: "Removed during re-encoding",
            category: "camera",
            stripped: true,
          },
          {
            key: "Color Profile",
            value: "Output converted to sRGB by default",
            category: "other",
            stripped: false,
          },
        ];

    return {
      blob,
      mimeType: blob.type || `image/${options.format}`,
      filename,
      metadataAfter,
      stats: {
        fieldsFound: mediaFile.metadataBefore.length,
        fieldsRemoved: Math.max(0, mediaFile.metadataBefore.length - metadataAfter.length),
        originalSize: file.size,
        processedSize: blob.size,
        savedBytes: Math.max(0, file.size - blob.size),
        savedPercent: file.size > 0 ? Math.round(((file.size - blob.size) / file.size) * 100) : 0,
      },
    };
  }

  // Fast Mode: Local HTML5 Canvas Processing
  onProgress?.(30);
  const legacyImageFile: ImageFile = {
    id: mediaFile.id,
    file: mediaFile.file,
    mediaType: "image",
    preview: mediaFile.preview || "",
    status: "processing",
    progress: 30,
    processedBlob: null,
    processedPreview: null,
    metadataBefore: mediaFile.metadataBefore,
    metadataAfter: [],
    cropData: mediaFile.cropData,
    customResize: mediaFile.customResize,
    customName: mediaFile.customName,
    width: mediaFile.width,
    height: mediaFile.height,
  };

  const canvasResult = await processImageCanvas(legacyImageFile, options);
  onProgress?.(100);

  const extMap: Record<string, string> = {
    jpeg: "jpg",
    png: "png",
    webp: "webp",
    avif: "avif",
  };
  const targetExt = extMap[options.format] || "jpg";
  const filename = mediaFile.customName || file.name.replace(/\.[^.]+$/, `_cleaned.${targetExt}`);

  const metadataAfter = canvasResult.metadataAfter && canvasResult.metadataAfter.length > 0
    ? canvasResult.metadataAfter
    : [
        { key: "EXIF Block", value: "Stripped (Re-encoded)", category: "camera" as const, stripped: true },
        { key: "GPS Coordinates", value: "Removed", category: "location" as const, stripped: true },
        { key: "Orientation", value: "Normalized (0°)", category: "camera" as const, stripped: false },
      ];

  return {
    blob: canvasResult.blob,
    mimeType: canvasResult.blob.type,
    filename,
    metadataAfter,
    stats: {
      fieldsFound: mediaFile.metadataBefore.length,
      fieldsRemoved: Math.max(0, mediaFile.metadataBefore.length - metadataAfter.length),
      originalSize: file.size,
      processedSize: canvasResult.blob.size,
      savedBytes: Math.max(0, file.size - canvasResult.blob.size),
      savedPercent: file.size > 0 ? Math.round(((file.size - canvasResult.blob.size) / file.size) * 100) : 0,
    },
  };
}

async function extractVideoMetadata(file: File): Promise<MetadataField[]> {
  const fields: MetadataField[] = [
    { key: "File Name", value: file.name, category: "other", stripped: false },
    { key: "File Size", value: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, category: "other", stripped: false },
    { key: "Container", value: file.type || "Video Container", category: "other", stripped: false },
    { key: "Last Modified", value: new Date(file.lastModified).toLocaleString(), category: "other", stripped: false },
  ];

  if (typeof window !== "undefined") {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          if (video.videoWidth && video.videoHeight) {
            fields.push({
              key: "Resolution",
              value: `${video.videoWidth} × ${video.videoHeight}`,
              category: "camera",
              stripped: false,
            });
          }
          if (video.duration) {
            fields.push({
              key: "Duration",
              value: `${video.duration.toFixed(1)} seconds`,
              category: "other",
              stripped: false,
            });
          }
          resolve();
        };
        video.onerror = () => resolve();
        video.src = url;
        setTimeout(resolve, 1500); // 1.5s timeout safeguard
      });

      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  return fields;
}

async function extractAudioMetadata(file: File): Promise<MetadataField[]> {
  const fields: MetadataField[] = [
    { key: "File Name", value: file.name, category: "other", stripped: false },
    { key: "File Size", value: `${(file.size / 1024).toFixed(1)} KB`, category: "other", stripped: false },
    { key: "Audio Format", value: file.type || "Audio Stream", category: "other", stripped: false },
    { key: "Last Modified", value: new Date(file.lastModified).toLocaleString(), category: "other", stripped: false },
  ];

  if (typeof window !== "undefined") {
    try {
      const url = URL.createObjectURL(file);
      const audio = document.createElement("audio");
      audio.preload = "metadata";

      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          if (audio.duration) {
            fields.push({
              key: "Duration",
              value: `${audio.duration.toFixed(1)} seconds`,
              category: "other",
              stripped: false,
            });
          }
          resolve();
        };
        audio.onerror = () => resolve();
        audio.src = url;
        setTimeout(resolve, 1500);
      });

      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  return fields;
}
