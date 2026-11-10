import type { MediaFile, MetadataField, ProcessingOptions } from "./types";

let ffmpegInstance: any = null;

async function getFFmpeg(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg processing is only available in the browser.");
  }

  if (ffmpegInstance) return ffmpegInstance;

  // Keep this dynamic: statically bundling the FFmpeg worker breaks the app build.
  const ffmpegModule = await (new Function('return import("@ffmpeg/ffmpeg")')() as Promise<any>);
  const FFmpegClass = ffmpegModule.FFmpeg;
  const ffmpeg = new FFmpegClass();

  // Match the installed @ffmpeg/core dependency in package.json / pnpm-lock.yaml.
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

  ffmpeg.on("log", () => {});

  let coreURL: string | undefined;
  let wasmURL: string | undefined;
  try {
    coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    await ffmpeg.load({ coreURL, wasmURL });
  } finally {
    if (coreURL) URL.revokeObjectURL(coreURL);
    if (wasmURL) URL.revokeObjectURL(wasmURL);
  }

  ffmpegInstance = ffmpeg;
  return ffmpegInstance;
}

async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Unable to download FFmpeg core (${resp.status}).`);
  }
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

/**
 * FFmpeg disables global/stream metadata mapping and chapter mapping. We do
 * not claim that every container-specific tag or attached picture was removed:
 * stream-copy output is not independently probed for every metadata location.
 */
export function buildMetadataRemovalArgs(
  inputName: string,
  outputName: string,
  isAudio: boolean,
): string[] {
  const args = [
    "-i", inputName,
    "-map_metadata", "-1",
    "-map_metadata:s", "-1",
    "-map_chapters", "-1",
  ];

  if (isAudio) {
    args.push("-vn", "-c:a", "copy");
  } else {
    args.push("-c:v", "copy", "-c:a", "copy");
  }

  args.push("-fflags", "+bitexact", outputName);
  return args;
}

export async function processMediaFFmpeg(
  mediaFile: MediaFile,
  _options: ProcessingOptions,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; metadataAfter: MetadataField[] }> {
  const ffmpeg = await getFFmpeg();

  const progressHandler = ({ progress }: { progress: number; time: number }) => {
    if (onProgress) onProgress(Math.round(progress * 100));
  };
  ffmpeg.on("progress", progressHandler);

  const file = mediaFile.file;
  const isAudio = mediaFile.mediaType === "audio";
  const rawExtension = file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "mp4");
  const ext = rawExtension.replace(/[^a-z0-9]/g, "") || (isAudio ? "mp3" : "mp4");
  const fileToken = mediaFile.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "media";
  const inputName = `input_${fileToken}.${ext}`;
  const outputName = `output_${fileToken}.${ext}`;

  let inputWritten = false;
  let outputWritten = false;

  try {
    const arrayBuffer = await file.arrayBuffer();
    inputWritten = true;
    await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuffer));

    outputWritten = true;
    await ffmpeg.exec(buildMetadataRemovalArgs(inputName, outputName, isAudio));
    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: file.type || (isAudio ? "audio/mpeg" : "video/mp4"),
    });

    const metadataAfter: MetadataField[] = [
      {
        key: "File Name",
        value: file.name,
        category: "other",
        stripped: false,
      },
      {
        key: "File Size",
        value: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        category: "other",
        stripped: false,
      },
      {
        key: "MIME Type",
        value: blob.type,
        category: "other",
        stripped: false,
      },
      ...(!isAudio
        ? [{
            key: "Video Stream",
            value: "Preserved (stream copy)",
            category: "other" as const,
            stripped: false,
          }]
        : []),
      {
        key: "Audio Stream",
        value: "Preserved (stream copy)",
        category: "other",
        stripped: false,
      },
      {
        key: "Global / Stream Metadata",
        value: "Metadata mapping disabled; output not independently probed",
        category: "camera",
        stripped: false,
      },
      {
        key: "Chapter Metadata",
        value: "Chapter mapping disabled",
        category: "other",
        stripped: true,
      },
      {
        key: "Embedded Artwork / Posters",
        value: "Not independently verified; may be retained depending on container",
        category: "other",
        stripped: false,
      },
      {
        key: "Container-specific Tags",
        value: "Not independently verified",
        category: "other",
        stripped: false,
      },
    ];

    return { blob, metadataAfter };
  } finally {
    if (inputWritten) {
      try { await ffmpeg.deleteFile(inputName); } catch { /* best-effort cleanup */ }
    }
    if (outputWritten) {
      try { await ffmpeg.deleteFile(outputName); } catch { /* best-effort cleanup */ }
    }
    ffmpeg.off("progress", progressHandler);
  }
}
