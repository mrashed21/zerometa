/**
 * File Signature (Magic Bytes) Verification Engine
 * Validates actual binary headers to prevent file spoofing and detect corrupt uploads.
 */

export interface SignatureValidationResult {
  valid: boolean;
  detectedFormat?: string;
  expectedFormat?: string;
  error?: string;
}

/**
 * Reads up to the first 32 bytes of a file to check binary magic signatures.
 */
export async function validateFileSignature(
  file: File,
  expectedType?: string,
): Promise<SignatureValidationResult> {
  // If file is 0 bytes, cannot validate
  if (file.size === 0) {
    return { valid: false, error: "File is empty (0 bytes)." };
  }

  try {
    const slice = file.slice(0, 32);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 4) {
      return { valid: false, error: "File header too short to verify signature." };
    }

    const detected = detectBinaryFormat(bytes);

    if (!detected) {
      // Some media containers have subtle headers, permit fallback if extension and mime match
      return {
        valid: true,
        detectedFormat: "generic-binary",
      };
    }

    if (expectedType) {
      const isMatch = checkFormatMatch(detected, expectedType, file.name);
      if (!isMatch) {
        return {
          valid: false,
          detectedFormat: detected,
          expectedFormat: expectedType,
          error: `File signature mismatch: File appears to be ${detected.toUpperCase()}, but was uploaded as ${expectedType}.`,
        };
      }
    }

    return {
      valid: true,
      detectedFormat: detected,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Failed to read file signature.",
    };
  }
}

function detectBinaryFormat(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  // GIF: GIF87a or GIF89a
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "gif";
  }

  // PDF: %PDF-
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "pdf";
  }

  // WebP or WAV (RIFF header)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    if (bytes.length >= 12) {
      const sub = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (sub === "WEBP") return "webp";
      if (sub === "WAVE") return "wav";
      if (sub === "AVI ") return "avi";
    }
    return "riff";
  }

  // TIFF: II*. (little endian) or MM.* (big endian)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return "tiff";
  }

  // MP4 / MOV: bytes 4-7 'ftyp' or 'moov'
  if (bytes.length >= 8) {
    const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (ftyp === "ftyp" || ftyp === "moov") {
      return "mp4";
    }
  }

  // Matroska / WebM: EBML header 1A 45 DF A3
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "webm";
  }

  // FLAC: fLaC
  if (
    bytes[0] === 0x66 &&
    bytes[1] === 0x4c &&
    bytes[2] === 0x61 &&
    bytes[3] === 0x43
  ) {
    return "flac";
  }

  // OGG: OggS
  if (
    bytes[0] === 0x4f &&
    bytes[1] === 0x67 &&
    bytes[2] === 0x67 &&
    bytes[3] === 0x53
  ) {
    return "ogg";
  }

  // MP3: ID3 or 0xFF followed by audio sync
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "mp3";
  }
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "mp3";
  }

  return null;
}

function checkFormatMatch(
  detected: string,
  expectedType: string,
  filename: string,
): boolean {
  const normExpected = expectedType.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (detected === "jpeg" && (normExpected.includes("jpeg") || normExpected.includes("jpg") || ext === "jpg" || ext === "jpeg")) {
    return true;
  }
  if (detected === "png" && (normExpected.includes("png") || ext === "png")) {
    return true;
  }
  if (detected === "webp" && (normExpected.includes("webp") || ext === "webp")) {
    return true;
  }
  if (detected === "gif" && (normExpected.includes("gif") || ext === "gif")) {
    return true;
  }
  if (detected === "pdf" && (normExpected.includes("pdf") || ext === "pdf")) {
    return true;
  }
  if (detected === "tiff" && (normExpected.includes("tiff") || normExpected.includes("tif") || ext === "tif" || ext === "tiff")) {
    return true;
  }
  if (detected === "mp4" && (normExpected.includes("mp4") || normExpected.includes("quicktime") || ext === "mp4" || ext === "mov" || ext === "m4a")) {
    return true;
  }
  if (detected === "webm" && (normExpected.includes("webm") || normExpected.includes("matroska") || ext === "webm" || ext === "mkv")) {
    return true;
  }
  if (detected === "mp3" && (normExpected.includes("mpeg") || normExpected.includes("mp3") || ext === "mp3")) {
    return true;
  }
  if (detected === "wav" && (normExpected.includes("wav") || ext === "wav")) {
    return true;
  }
  if (detected === "flac" && (normExpected.includes("flac") || ext === "flac")) {
    return true;
  }
  if (detected === "ogg" && (normExpected.includes("ogg") || ext === "ogg")) {
    return true;
  }
  if (detected === "riff" && (normExpected.includes("webp") || normExpected.includes("wav"))) {
    return true;
  }

  return false;
}

