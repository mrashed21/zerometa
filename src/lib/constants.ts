import type { ProcessingOptions } from "./types";

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  mode: "advanced",
  privacyMode: "clean-branding",
  format: "webp",
  quality: 80,
  microCrop: 0,
  colorShift: 0,
  noiseInjection: 0,
  globalResize: {
    enabled: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
    preset: "custom",
    mode: "fit",
  },
};

export const SLIDER_CONFIG = {
  quality: { min: 80, max: 100, step: 1, unit: "%" },
  microCrop: { min: 0, max: 5, step: 1, unit: "px" },
  colorShift: { min: -1, max: 1, step: 0.1, unit: "%" },
  noiseInjection: { min: 0, max: 1, step: 0.1, unit: "%" },
} as const;

export const QUALITY_PRESETS = {
  high: { label: "High", value: 95 },
  medium: { label: "Medium", value: 85 },
  low: { label: "Low", value: 80 },
} as const;

export const SUPPORTED_FILE_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

export const IMAGE_ACCEPT_STRING = Object.keys(SUPPORTED_FILE_TYPES).join(",");

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// Vercel Functions cap buffered request bodies at 4.5 MB; leave room for multipart overhead.
export const MAX_SERVER_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB

export const MAX_QUEUE_SIZE = 50;

export const FORMAT_LABELS: Record<string, string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
  avif: "AVIF",
};

export const FORMAT_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export const OUTPUT_FORMAT_OPTIONS = [
  { value: "jpeg" as const, label: "JPG", description: "Best for photos" },
  {
    value: "png" as const,
    label: "PNG",
    description: "Lossless, best for graphics",
  },
  {
    value: "webp" as const,
    label: "WebP",
    description: "Modern format, smallest size",
  },
  { value: "avif" as const, label: "AVIF", description: "Best compression" },
];

export const EXIF_CATEGORIES = {
  camera: { label: "Camera Info", color: "blue" },
  location: { label: "Location", color: "red" },
  ai: { label: "AI Tags", color: "purple" },
  software: { label: "Software", color: "yellow" },
  other: { label: "Other", color: "zinc" },
} as const;

export const ANIMATION_MS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const ANIMATION_EASE = {
  default: [0.4, 0, 0.2, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export const TITLE_TEMPLATE = "ZeroMeta";

export const ARIA_LABELS = {
  uploadZone: "Upload files — drag and drop or click to browse",
  removeFile: "Remove file from queue",
  downloadFile: "Download processed file",
  downloadAll: "Download all as ZIP",
  processAll: "Process all queued files",
  retryFile: "Retry processing this file",
  clearQueue: "Remove all files from queue",
  compareSlider: "Drag to compare original and processed image",
} as const;
