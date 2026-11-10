import {
  createProcessingError,
  formatBytes,
  getMediaType,
  getSupportedType,
  isNonEmptyFile,
  isSupportedMimeType,
  isWithinSizeLimit,
  MAX_FILE_SIZE,
} from "./media-types";
import { validateFileSignature } from "./signature-validator";
import type { MediaFile, MediaType, ProcessingError } from "./types";

export function validateFile(file: File): ProcessingError | null {
  // 1. Empty file check
  if (!isNonEmptyFile(file)) {
    return createProcessingError(
      "EMPTY_FILE",
      "This file is empty and cannot be processed.",
      `File size is 0 bytes: ${file.name}`,
    );
  }

  // 2. MIME type / format support check
  if (!isSupportedMimeType(file.type, file.name)) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `"${getReadableType(file.type, file.name)}" files are not supported. Please upload an image, video, audio, or PDF document.`,
      `Unsupported format: ${file.type || "(empty)"} — file: ${file.name}`,
    );
  }

  // 3. File size limit check
  const mediaType = getMediaType(file) as MediaType;
  if (!mediaType) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `Unrecognized media type for "${file.name}".`,
      `Unrecognized media type: ${file.name}`,
    );
  }

  if (!isWithinSizeLimit(file, mediaType)) {
    const limit = formatBytes(MAX_FILE_SIZE[mediaType]);
    const size = formatBytes(file.size);
    return createProcessingError(
      "FILE_TOO_LARGE",
      `This file is too large (${size}). The limit for ${mediaType} files is ${limit}.`,
      `File size ${file.size} exceeds limit ${MAX_FILE_SIZE[mediaType]} for ${mediaType}: ${file.name}`,
    );
  }

  // 4. Extension / MIME consistency check (warns about mismatches)
  const extensionError = validateExtension(file);
  if (extensionError) return extensionError;

  return null;
}

export async function validateFileAsync(file: File): Promise<ProcessingError | null> {
  const syncError = validateFile(file);
  if (syncError) return syncError;

  const sigResult = await validateFileSignature(file, file.type);
  if (!sigResult.valid) {
    return createProcessingError(
      "CORRUPTED_FILE",
      sigResult.error || "File signature verification failed.",
      `Magic byte validation failed: ${sigResult.error}`,
    );
  }

  return null;
}

export function validateNotDuplicate(
  file: File,
  queue: MediaFile[],
): ProcessingError | null {
  const isDuplicate = queue.some(
    (queued) =>
      queued.file.name === file.name &&
      queued.file.size === file.size &&
      queued.file.lastModified === file.lastModified,
  );

  if (isDuplicate) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `"${file.name}" is already in the queue.`,
      `Duplicate file detected: ${file.name} (${file.size} bytes, ${file.lastModified})`,
    );
  }

  return null;
}

export interface ValidationResult {
  valid: File[];
  errors: Array<{ file: File; error: ProcessingError }>;
}

export function validateBatch(
  files: File[],
  existingQueue: MediaFile[],
): ValidationResult {
  const valid: File[] = [];
  const errors: Array<{ file: File; error: ProcessingError }> = [];

  const workingQueue: MediaFile[] = [...existingQueue];

  for (const file of files) {
    const dupError = validateNotDuplicate(file, workingQueue);
    if (dupError) {
      errors.push({ file, error: dupError });
      continue;
    }

    const fileError = validateFile(file);
    if (fileError) {
      errors.push({ file, error: fileError });
      continue;
    }

    valid.push(file);

    workingQueue.push({
      id: `pending-${file.name}-${file.size}`,
      file,
      mediaType: getMediaType(file) ?? "image",
      preview: null,
      status: "queued",
      progress: 0,
      result: null,
      metadataBefore: [],
    });
  }

  return { valid, errors };
}

function validateExtension(file: File): ProcessingError | null {
  const registryEntry = getSupportedType(file.type);
  if (!registryEntry) return null;

  const filename = file.name.toLowerCase();
  const hasValidExtension = registryEntry.extensions.some((ext) =>
    filename.endsWith(ext),
  );

  const hasAnyExtension = filename.includes(".");

  if (hasAnyExtension && !hasValidExtension) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `The file "${file.name}" has an extension that doesn't match its detected type (${registryEntry.label}). Please check the file.`,
      `Extension mismatch: file "${file.name}" declared as ${file.type}, expected one of ${registryEntry.extensions.join(", ")}`,
    );
  }

  return null;
}

function getReadableType(mime: string, filename?: string): string {
  const entry = getSupportedType(mime, filename);
  if (entry) return entry.label;
  if (!mime) return "Unknown";
  const [, subtype] = mime.split("/");
  return subtype?.toUpperCase() ?? mime;
}
