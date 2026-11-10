import JSZip from "jszip";
import type { MediaFile } from "./types";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

export function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function downloadMediaFile(file: MediaFile): boolean {
  if (!file.result?.blob) return false;

  const filename = file.result.filename || getFallbackFilename(file);
  downloadBlob(file.result.blob, filename);
  return true;
}

export interface ZipResult {
  success: boolean;
  fileCount: number;
  error?: string;
}

export async function downloadAsZip(
  files: MediaFile[],
  zipName = "zerometa-cleaned",
  onProgress?: (percent: number) => void,
): Promise<ZipResult> {
  const completed = files.filter((f) => f.status === "done" && f.result?.blob);

  if (completed.length === 0) {
    return {
      success: false,
      fileCount: 0,
      error: "No completed files to download.",
    };
  }

  try {
    const zip = new JSZip();

    for (const file of completed) {
      if (!file.result?.blob) continue;
      const filename = file.result.filename || getFallbackFilename(file);
      const safeFilename = deduplicateZipName(zip, filename);
      zip.file(safeFilename, file.result.blob);
    }

    const blob = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 1 },
      },
      (metadata) => {
        onProgress?.(Math.round(metadata.percent));
      },
    );

    const timestamp = getTimestampSuffix();
    downloadBlob(blob, `${zipName}-${timestamp}.zip`);

    return { success: true, fileCount: completed.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, fileCount: 0, error: message };
  }
}

export function createTrackedObjectUrl(
  source: File | Blob,
  tracker: Set<string>,
): string {
  const url = URL.createObjectURL(source);
  tracker.add(url);
  return url;
}

export function revokeTrackedObjectUrls(tracker: Set<string>): void {
  for (const url of tracker) {
    URL.revokeObjectURL(url);
  }
  tracker.clear();
}

export function safeRevokeObjectUrl(url: string | null | undefined): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function getFallbackFilename(file: MediaFile): string {
  const original = file.customName || file.file.name;
  const dot = original.lastIndexOf(".");
  if (dot < 0) return `${original}_cleaned`;
  return `${original.slice(0, dot)}_cleaned${original.slice(dot)}`;
}

function deduplicateZipName(zip: JSZip, filename: string): string {
  if (!zip.file(filename)) return filename;

  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const ext = dot >= 0 ? filename.slice(dot) : "";

  let counter = 2;
  let candidate = `${base}(${counter})${ext}`;
  while (zip.file(candidate)) {
    counter++;
    candidate = `${base}(${counter})${ext}`;
  }
  return candidate;
}

function getTimestampSuffix(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}
