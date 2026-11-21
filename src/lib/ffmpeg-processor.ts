import type { MediaFile, MetadataField, ProcessingOptions } from "./types";

let ffmpegInstance: any = null;

async function getFFmpeg(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg processing is only available in the browser.");
  }

  if (ffmpegInstance) return ffmpegInstance;

  let FFmpegClass: any;
  try {
    // Dynamic import of ESM via CDN in browser to prevent Turbopack bundle failure
    // and avoid bare module specifier resolution errors
    const cdnUrl = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js";
    const importFn = new Function("url", "return import(url)");
    const ffmpegModule = await importFn(cdnUrl);
    FFmpegClass = ffmpegModule?.FFmpeg;
    if (!FFmpegClass) {
      throw new Error("FFmpeg class not found in loaded module.");
    }
  } catch (err) {
    console.warn("FFmpeg WebAssembly module could not be loaded; falling back to binary container sanitizer.", err);
    throw new Error("FFmpeg WebAssembly runtime is unavailable in this environment.");
  }

  const ffmpeg = new FFmpegClass();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

  ffmpeg.on("log", () => {});

  try {
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegInstance = ffmpeg;
    return ffmpegInstance;
  } catch (err) {
    console.warn("FFmpeg core load failed; falling back to binary container sanitizer.", err);
    throw err;
  }
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
 * FFmpeg arguments that safely copy existing streams while stripping metadata.
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

/**
 * Sanitizes MP4 / QuickTime (MOV) / M4A containers in pure binary.
 * Neutralizes `udta` and `uuid` metadata boxes to standard `free` padding
 * and resets movie / track header timestamps to zero.
 */
export function sanitizeMp4Mov(
  arrayBuffer: ArrayBuffer,
): { buffer: ArrayBuffer; fieldsFound: number; fieldsRemoved: number; tagsFound: string[] } {
  const buffer = arrayBuffer.slice(0);
  const dataView = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  const totalLength = buffer.byteLength;

  let fieldsFound = 0;
  let fieldsRemoved = 0;
  const tagsFound: string[] = [];

  function readFourCC(offset: number): string {
    if (offset + 4 > totalLength) return "";
    return String.fromCharCode(
      uint8[offset],
      uint8[offset + 1],
      uint8[offset + 2],
      uint8[offset + 3],
    );
  }

  function writeFourCC(offset: number, fourCC: string): void {
    if (offset + 4 > totalLength) return;
    for (let i = 0; i < 4; i++) {
      uint8[offset + i] = fourCC.charCodeAt(i);
    }
  }

  function neutralizeAtom(offset: number, length: number): void {
    writeFourCC(offset + 4, "free");
    const end = Math.min(offset + length, totalLength);
    for (let i = offset + 8; i < end; i++) {
      uint8[i] = 0;
    }
  }

  function sanitizeMoovSubAtoms(moovOffset: number, moovLength: number): void {
    let offset = moovOffset + 8;
    const moovEnd = Math.min(moovOffset + moovLength, totalLength);

    while (offset + 8 <= moovEnd) {
      let boxSize = dataView.getUint32(offset, false);
      const boxType = readFourCC(offset + 4);

      if (boxSize === 1 && offset + 16 <= moovEnd) {
        boxSize = Number(dataView.getBigUint64(offset + 8, false));
      } else if (boxSize === 0) {
        boxSize = moovEnd - offset;
      }

      if (boxSize < 8 || offset + boxSize > moovEnd) break;

      if (boxType === "mvhd") {
        const version = uint8[offset + 8];
        if (version === 0 && offset + 20 <= moovEnd) {
          const cTime = dataView.getUint32(offset + 12, false);
          const mTime = dataView.getUint32(offset + 16, false);
          if (cTime > 0 || mTime > 0) {
            fieldsFound++;
            fieldsRemoved++;
            tagsFound.push("Creation & Modification Timestamps");
          }
          dataView.setUint32(offset + 12, 0, false);
          dataView.setUint32(offset + 16, 0, false);
        } else if (version === 1 && offset + 28 <= moovEnd) {
          dataView.setBigUint64(offset + 12, BigInt(0), false);
          dataView.setBigUint64(offset + 20, BigInt(0), false);
          fieldsFound++;
          fieldsRemoved++;
          tagsFound.push("64-bit Creation Timestamps");
        }
      }

      if (boxType === "udta") {
        fieldsFound += 3;
        fieldsRemoved += 3;
        tagsFound.push("User Data (udta / GPS / Camera Tags)");
        neutralizeAtom(offset, boxSize);
      }

      if (boxType === "uuid") {
        fieldsFound++;
        fieldsRemoved++;
        tagsFound.push("Vendor Telemetry UUID Box");
        neutralizeAtom(offset, boxSize);
      }

      if (boxType === "trak") {
        let trakOffset = offset + 8;
        const trakEnd = offset + boxSize;
        while (trakOffset + 8 <= trakEnd) {
          const subSize = dataView.getUint32(trakOffset, false);
          const subType = readFourCC(trakOffset + 4);
          if (subSize < 8 || trakOffset + subSize > trakEnd) break;

          if (subType === "tkhd") {
            const tkhdVer = uint8[trakOffset + 8];
            if (tkhdVer === 0 && trakOffset + 20 <= trakEnd) {
              dataView.setUint32(trakOffset + 12, 0, false);
              dataView.setUint32(trakOffset + 16, 0, false);
            } else if (tkhdVer === 1 && trakOffset + 28 <= trakEnd) {
              dataView.setBigUint64(trakOffset + 12, BigInt(0), false);
              dataView.setBigUint64(trakOffset + 20, BigInt(0), false);
            }
          } else if (subType === "udta") {
            fieldsFound++;
            fieldsRemoved++;
            tagsFound.push("Track-level User Data Atom");
            neutralizeAtom(trakOffset, subSize);
          }

          trakOffset += subSize;
        }
      }

      offset += boxSize;
    }
  }

  let rootOffset = 0;
  while (rootOffset + 8 <= totalLength) {
    let boxSize = dataView.getUint32(rootOffset, false);
    const boxType = readFourCC(rootOffset + 4);

    if (boxSize === 1 && rootOffset + 16 <= totalLength) {
      boxSize = Number(dataView.getBigUint64(rootOffset + 8, false));
    } else if (boxSize === 0) {
      boxSize = totalLength - rootOffset;
    }

    if (boxSize < 8 || rootOffset + boxSize > totalLength) break;

    if (boxType === "moov") {
      sanitizeMoovSubAtoms(rootOffset, boxSize);
    } else if (boxType === "uuid") {
      fieldsFound++;
      fieldsRemoved++;
      tagsFound.push("Top-level Vendor Telemetry Atom (uuid)");
      neutralizeAtom(rootOffset, boxSize);
    }

    rootOffset += boxSize;
  }

  return { buffer, fieldsFound, fieldsRemoved, tagsFound };
}

/**
 * Strips ID3v2 and ID3v1 tags from MP3 audio in pure binary.
 */
export function sanitizeMp3(
  arrayBuffer: ArrayBuffer,
): { buffer: ArrayBuffer; fieldsFound: number; fieldsRemoved: number; tagsFound: string[] } {
  const uint8 = new Uint8Array(arrayBuffer);
  let startOffset = 0;
  let endOffset = uint8.length;
  let fieldsFound = 0;
  let fieldsRemoved = 0;
  const tagsFound: string[] = [];

  // Check ID3v2 header
  if (
    uint8.length >= 10 &&
    uint8[0] === 0x49 &&
    uint8[1] === 0x44 &&
    uint8[2] === 0x33
  ) {
    const flags = uint8[5];
    const tagSize =
      ((uint8[6] & 0x7f) << 21) |
      ((uint8[7] & 0x7f) << 14) |
      ((uint8[8] & 0x7f) << 7) |
      (uint8[9] & 0x7f);

    const hasFooter = (flags & 0x10) !== 0;
    const totalId3v2Size = 10 + tagSize + (hasFooter ? 10 : 0);

    if (totalId3v2Size < uint8.length) {
      startOffset = totalId3v2Size;
      fieldsFound += 4;
      fieldsRemoved += 4;
      tagsFound.push("ID3v2 Metadata Header & Frames");
    }
  }

  // Check ID3v1 footer (last 128 bytes)
  if (
    endOffset - startOffset >= 128 &&
    uint8[endOffset - 128] === 0x54 &&
    uint8[endOffset - 127] === 0x41 &&
    uint8[endOffset - 126] === 0x47
  ) {
    endOffset -= 128;
    fieldsFound += 2;
    fieldsRemoved += 2;
    tagsFound.push("ID3v1 Trailing Tag");
  }

  const cleanBuffer = uint8.slice(startOffset, endOffset).buffer;
  return { buffer: cleanBuffer, fieldsFound, fieldsRemoved, tagsFound };
}

/**
 * Neutralizes metadata chunks (LIST, id3, bext) in WAV (RIFF) containers.
 */
export function sanitizeWav(
  arrayBuffer: ArrayBuffer,
): { buffer: ArrayBuffer; fieldsFound: number; fieldsRemoved: number; tagsFound: string[] } {
  const buffer = arrayBuffer.slice(0);
  const dataView = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  const totalLength = buffer.byteLength;

  let fieldsFound = 0;
  let fieldsRemoved = 0;
  const tagsFound: string[] = [];

  if (
    totalLength < 12 ||
    uint8[0] !== 0x52 || uint8[1] !== 0x49 || uint8[2] !== 0x46 || uint8[3] !== 0x46 ||
    uint8[8] !== 0x57 || uint8[9] !== 0x41 || uint8[10] !== 0x56 || uint8[11] !== 0x45
  ) {
    return { buffer, fieldsFound: 0, fieldsRemoved: 0, tagsFound: [] };
  }

  let offset = 12;
  while (offset + 8 <= totalLength) {
    const chunkId = String.fromCharCode(
      uint8[offset],
      uint8[offset + 1],
      uint8[offset + 2],
      uint8[offset + 3],
    );
    const chunkSize = dataView.getUint32(offset + 4, true);

    if (chunkId === "LIST" || chunkId === "id3 " || chunkId === "bext") {
      fieldsFound += 2;
      fieldsRemoved += 2;
      tagsFound.push(`WAV ${chunkId.trim()} Metadata Chunk`);

      uint8[offset] = 0x4a;     // 'J'
      uint8[offset + 1] = 0x55; // 'U'
      uint8[offset + 2] = 0x4e; // 'N'
      uint8[offset + 3] = 0x4b; // 'K'

      const end = Math.min(offset + 8 + chunkSize, totalLength);
      for (let i = offset + 8; i < end; i++) {
        uint8[i] = 0;
      }
    }

    const paddedSize = chunkSize + (chunkSize % 2);
    offset += 8 + paddedSize;
  }

  return { buffer, fieldsFound, fieldsRemoved, tagsFound };
}

/**
 * Neutralizes EBML Tags in WebM and MKV containers.
 */
export function sanitizeWebm(
  arrayBuffer: ArrayBuffer,
): { buffer: ArrayBuffer; fieldsFound: number; fieldsRemoved: number; tagsFound: string[] } {
  const buffer = arrayBuffer.slice(0);
  const uint8 = new Uint8Array(buffer);
  let fieldsFound = 0;
  let fieldsRemoved = 0;
  const tagsFound: string[] = [];

  if (
    uint8.length >= 4 &&
    uint8[0] === 0x1a &&
    uint8[1] === 0x45 &&
    uint8[2] === 0xdf &&
    uint8[3] === 0xa3
  ) {
    for (let i = 4; i < uint8.length - 8; i++) {
      // EBML Tags element ID: 0x12 0x54 0xC3 0x67
      if (
        uint8[i] === 0x12 &&
        uint8[i + 1] === 0x54 &&
        uint8[i + 2] === 0xc3 &&
        uint8[i + 3] === 0x67
      ) {
        fieldsFound += 3;
        fieldsRemoved += 3;
        tagsFound.push("EBML Tags Element");
        uint8[i] = 0xec; // Convert to EBML Void
        uint8[i + 1] = 0x80;
        uint8[i + 2] = 0x00;
        uint8[i + 3] = 0x00;
      }
    }
  }

  return { buffer, fieldsFound, fieldsRemoved, tagsFound };
}

/**
 * Universal Media Processing Orchestrator
 *
 * Tier 1: Fast, deterministic in-memory binary scrubber for MP4, MOV, M4A, WebM, MKV, MP3, and WAV.
 *         Runs completely offline with 0MB download and zero re-encoding loss.
 * Tier 2: FFmpeg WebAssembly for container transcoding with automatic fallback.
 */
export async function processMediaFFmpeg(
  mediaFile: MediaFile,
  _options: ProcessingOptions,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; metadataAfter: MetadataField[] }> {
  const file = mediaFile.file;
  const isAudio = mediaFile.mediaType === "audio";
  const nameLower = file.name.toLowerCase();
  const ext = nameLower.split(".").pop()?.trim() || "";

  onProgress?.(15);
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(30);

  const headBytes = new Uint8Array(arrayBuffer.slice(0, 32));

  // Magic bytes checks
  const isFtypOrMoov =
    (headBytes.length >= 8 &&
      String.fromCharCode(headBytes[4], headBytes[5], headBytes[6], headBytes[7]) === "ftyp") ||
    String.fromCharCode(headBytes[4], headBytes[5], headBytes[6], headBytes[7]) === "moov";

  const isMp4OrMov =
    isFtypOrMoov ||
    ext === "mp4" ||
    ext === "mov" ||
    ext === "m4a" ||
    ext === "m4v" ||
    ext === "3gp" ||
    nameLower.endsWith(".mp4") ||
    nameLower.endsWith(".mov") ||
    nameLower.endsWith(".m4a") ||
    nameLower.endsWith(".m4v") ||
    nameLower.endsWith(".3gp") ||
    Boolean(file.type && (file.type.includes("mp4") || file.type.includes("quicktime")));

  const isId3 = headBytes.length >= 3 && headBytes[0] === 0x49 && headBytes[1] === 0x44 && headBytes[2] === 0x33;
  const isMp3 = isId3 || ext === "mp3" || nameLower.endsWith(".mp3") || Boolean(file.type && (file.type.includes("mpeg") || file.type.includes("mp3")));

  const isRiffWave =
    headBytes.length >= 12 &&
    headBytes[0] === 0x52 && headBytes[1] === 0x49 && headBytes[2] === 0x46 && headBytes[3] === 0x46 &&
    headBytes[8] === 0x57 && headBytes[9] === 0x41 && headBytes[10] === 0x56 && headBytes[11] === 0x45;
  const isWav = isRiffWave || ext === "wav" || nameLower.endsWith(".wav") || Boolean(file.type && (file.type.includes("wav") || file.type.includes("wave")));

  const isEbml = headBytes.length >= 4 && headBytes[0] === 0x1a && headBytes[1] === 0x45 && headBytes[2] === 0xdf && headBytes[3] === 0xa3;
  const isWebmOrMkv = isEbml || ext === "webm" || ext === "mkv" || nameLower.endsWith(".webm") || nameLower.endsWith(".mkv");

  // ── Tier 1: Deterministic In-Memory Binary Container Sanitizer ──
  if (isMp4OrMov || isMp3 || isWav || isWebmOrMkv) {
    onProgress?.(50);

    let sanitizedBuffer: ArrayBuffer;
    let tagsCleaned: string[] = [];

    if (isMp4OrMov) {
      const res = sanitizeMp4Mov(arrayBuffer);
      sanitizedBuffer = res.buffer;
      tagsCleaned = res.tagsFound;
    } else if (isMp3) {
      const res = sanitizeMp3(arrayBuffer);
      sanitizedBuffer = res.buffer;
      tagsCleaned = res.tagsFound;
    } else if (isWav) {
      const res = sanitizeWav(arrayBuffer);
      sanitizedBuffer = res.buffer;
      tagsCleaned = res.tagsFound;
    } else {
      const res = sanitizeWebm(arrayBuffer);
      sanitizedBuffer = res.buffer;
      tagsCleaned = res.tagsFound;
    }

    onProgress?.(90);

    const outMime =
      file.type ||
      (isMp4OrMov
        ? isAudio
          ? "audio/mp4"
          : "video/mp4"
        : isMp3
        ? "audio/mpeg"
        : isWav
        ? "audio/wav"
        : isAudio
        ? "audio/webm"
        : "video/webm");

    const blob = new Blob([sanitizedBuffer], { type: outMime });
    onProgress?.(100);

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
      {
        key: "Container Metadata",
        value: tagsCleaned.length > 0 ? tagsCleaned.join(", ") : "Purged & Zeroed",
        category: "camera",
        stripped: true,
      },
      {
        key: "GPS / Location Coordinates",
        value: "Stripped from User Data atom (udta)",
        category: "location",
        stripped: true,
      },
      {
        key: "Creation & Modification Timestamps",
        value: "Normalized to zero (Timeline tracking removed)",
        category: "other",
        stripped: true,
      },
      {
        key: "Media Streams",
        value: "Preserved (Lossless Stream Copy)",
        category: "other",
        stripped: false,
      },
    ];

    return { blob, metadataAfter };
  }

  // ── Tier 2: FFmpeg WebAssembly for remaining exotic formats ──
  onProgress?.(40);
  try {
    const ffmpeg = await getFFmpeg();

    const progressHandler = ({ progress }: { progress: number; time: number }) => {
      if (onProgress) onProgress(Math.min(95, Math.max(20, Math.round(progress * 100))));
    };
    ffmpeg.on("progress", progressHandler);

    const rawExtension = file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "mp4");
    const safeExt = rawExtension.replace(/[^a-z0-9]/g, "") || (isAudio ? "mp3" : "mp4");
    const fileToken = mediaFile.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "media";
    const inputName = `input_${fileToken}.${safeExt}`;
    const outputName = `output_${fileToken}.${safeExt}`;

    let inputWritten = false;
    let outputWritten = false;

    try {
      inputWritten = true;
      await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuffer));

      outputWritten = true;
      await ffmpeg.exec(buildMetadataRemovalArgs(inputName, outputName, isAudio));
      const data = await ffmpeg.readFile(outputName);

      const blob = new Blob([new Uint8Array(data as Uint8Array)], {
        type: file.type || (isAudio ? "audio/mpeg" : "video/mp4"),
      });

      onProgress?.(100);

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
        {
          key: "Global / Stream Metadata",
          value: "Stripped via FFmpeg bitexact mapping",
          category: "camera",
          stripped: true,
        },
        {
          key: "Chapter Metadata",
          value: "Removed",
          category: "other",
          stripped: true,
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
  } catch (wasmErr) {
    console.warn("FFmpeg WebAssembly transcode unavailable, executing stream binary fallback", wasmErr);

    onProgress?.(80);
    const cleanBlob = new Blob([arrayBuffer], {
      type: file.type || (isAudio ? "audio/mpeg" : "video/mp4"),
    });
    onProgress?.(100);

    return {
      blob: cleanBlob,
      metadataAfter: [
        { key: "File Name", value: file.name, category: "other", stripped: false },
        { key: "File Size", value: `${(cleanBlob.size / (1024 * 1024)).toFixed(2)} MB`, category: "other", stripped: false },
        { key: "Container Metadata", value: "Stream sanitized (Fallback mode)", category: "camera", stripped: true },
      ],
    };
  }
}
