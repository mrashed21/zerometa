export type ProcessingMode = "fast" | "advanced";

export type OutputFormat = "jpeg" | "png" | "webp" | "avif";

export interface ResizeOptions {
  enabled?: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  preset?:
    | "original"
    | "1920"
    | "1280"
    | "1080"
    | "720"
    | "custom"
    | "1:1"
    | "16:9"
    | "9:16";
  mode?: "fit" | "fill" | "crop" | "stretch";
}

export interface ProcessingOptions {
  mode: ProcessingMode;
  privacyMode: PrivacyMode;
  format: OutputFormat;
  quality: number;
  microCrop: number;
  colorShift: number;
  noiseInjection: number;
  globalResize: ResizeOptions;
}

export type FileStatus = "queued" | "processing" | "done" | "error";

export interface MetadataField {
  key: string;
  value: string;
  category: "camera" | "location" | "ai" | "software" | "other";
  stripped: boolean;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageFile {
  id: string;
  file: File;
  mediaType: MediaType;
  preview: string;
  status: FileStatus;
  progress: number;
  processedBlob: Blob | null;
  processedPreview: string | null;
  metadataBefore: MetadataField[];
  metadataAfter: MetadataField[];
  error?: string;
  cropData?: CropData;
  customResize?: ResizeOptions;
  customName?: string;
  width?: number;
  height?: number;
}

export type MediaType = "image" | "video" | "audio" | "document";

export type PrivacyMode = "privacy-clean" | "clean-branding";

export interface BrandingConfig {
  creator: string;
  author: string;
  software: string;
  keywords: string[];
}

export interface MetadataStats {
  fieldsFound: number;
  fieldsRemoved: number;
  originalSize: number;
  processedSize: number;
  savedBytes: number;
  savedPercent: number;
}

export interface ProcessingResult {
  blob: Blob;
  mimeType: string;
  filename: string;
  metadataAfter: MetadataField[];
  stats: MetadataStats;
}

export interface MediaFile {
  id: string;
  file: File;
  mediaType: MediaType;
  preview: string | null;
  status: FileStatus;
  progress: number;
  result: ProcessingResult | null;
  metadataBefore: MetadataField[];
  error?: string;
  cropData?: CropData;
  customResize?: ResizeOptions;
  customName?: string;
  width?: number;
  height?: number;
}

export interface ImageProcessingOptions {
  removeExif: boolean;
  removeGps: boolean;
  removeIptc: boolean;
  removeXmp: boolean;
  preserveOrientation: boolean;
  preserveDimensions: boolean;
  outputFormat: OutputFormat;
  outputQuality: number;
  microCrop: number;
  colorShift: number;
  noiseInjection: number;
}

export interface VideoProcessingOptions {
  removeMetadata: boolean;
  preserveResolution: boolean;
  preserveAudio: boolean;
  forceReencode: boolean;
}

export interface AudioProcessingOptions {
  removeId3Tags: boolean;
  removeArtist: boolean;
  removeAlbum: boolean;
  removeTitle: boolean;
  removeComment: boolean;
  removeEncoder: boolean;
  preserveAudioQuality: boolean;
}

export interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  hasAudio: boolean;
  bitrate?: number;
}

export interface AudioMetadata {
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  tags?: Record<string, string>;
}

export interface SupportedMimeType {
  mime: string;
  mediaType: MediaType;
  extensions: string[];
  label: string;
}

export type ProcessingErrorCode =
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "CORRUPTED_FILE"
  | "PROCESSING_FAILED"
  | "CANCELLED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface ProcessingError {
  code: ProcessingErrorCode;
  message: string;
  technical?: string;
}
