import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_INPUT_DIMENSION = 40_000_000;
const MAX_OUTPUT_DIMENSION = 12_000;
const MAX_OUTPUT_PIXELS = 40_000_000;
const MAX_NOISE_PIXELS = 16_000_000;
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

// Best-effort per-instance limiter. Production deployments should also enforce
// rate limits at the edge because serverless instances do not share this map.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
    while (rateLimitMap.size > 1000) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (!oldestKey) break;
      rateLimitMap.delete(oldestKey);
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
  record.count++;
  return true;
}

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buffer.length >= 4 &&
    ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
      (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a))
  ) {
    return "image/tiff";
  }
  return null;
}

function readNumber(
  formData: FormData,
  key: string,
  fallback: number,
  min: number,
  max: number,
  integer = false,
): number {
  const value = formData.get(key);
  if (value === null || value === "") return fallback;
  if (typeof value !== "string") throw new Error(`Invalid ${key} value.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${key} must be between ${min} and ${max}.`);
  }
  if (integer && !Number.isInteger(parsed)) {
    throw new Error(`${key} must be a whole number.`);
  }
  return parsed;
}

export function safeOutputFilename(originalName: string, extension: string): string {
  const base = originalName.replace(/\\.[^.]*$/, "");
  const safeBase = base
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^[_\.]+|[_\.]+$/g, "")
    .slice(0, 100) || "image";
  return `${safeBase}_cleaned.${extension}`;
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Reject oversized requests before multipart parsing when Content-Length is
    // available. The platform/proxy must also enforce a body limit because
    // chunked requests may omit this header.
    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (!Number.isFinite(contentLength) || contentLength < 0) {
        return badRequest("Invalid request content length.");
      }
      if (contentLength > MAX_UPLOAD_BYTES + 256 * 1024) {
        return badRequest("Request body exceeds the 50MB upload limit.", 413);
      }
    }

    // This header is expected to be set by the hosting proxy. Keep edge-level
    // rate limiting enabled as well; this in-memory limiter is per instance.
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many processing requests. Please wait a minute before retrying." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return badRequest("No valid image file was provided.");
    }
    if (file.size === 0) return badRequest("The uploaded file is empty.");
    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequest("File size exceeds the 50MB limit.", 413);
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!validTypes.includes(file.type)) {
      return badRequest(`Unsupported file type: ${file.type || "unknown"}`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(inputBuffer);
    if (!detectedMime || detectedMime !== file.type) {
      return badRequest("The file content does not match its declared image type.");
    }

    const originalMeta = await sharp(inputBuffer, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
      pages: 1,
    }).metadata();

    if (!originalMeta.width || !originalMeta.height) {
      return badRequest("The image dimensions could not be read.");
    }
    if (originalMeta.width * originalMeta.height > MAX_INPUT_PIXELS) {
      return badRequest("Image dimensions exceed the 40-megapixel processing limit.", 413);
    }

    const format = String(formData.get("format") || "jpeg").toLowerCase();
    const quality = readNumber(formData, "quality", 95, 1, 100, true);
    const microCrop = readNumber(formData, "microCrop", 0, 0, 1000, true);
    const colorShift = readNumber(formData, "colorShift", 0, -100, 100);
    const noiseInjection = readNumber(formData, "noiseInjection", 0, 0, 100);
    const privacyMode = String(formData.get("privacyMode") || "privacy-clean");

    if (!["privacy-clean", "clean-branding"].includes(privacyMode)) {
      return badRequest("Unsupported privacy mode.");
    }

    const cropKeys = ["cropX", "cropY", "cropW", "cropH"];
    const suppliedCropKeys = cropKeys.filter((key) => formData.has(key));
    if (suppliedCropKeys.length !== 0 && suppliedCropKeys.length !== cropKeys.length) {
      return badRequest("All four crop values must be provided together.");
    }

    const resizeEnabled = formData.get("resizeEnabled") === "true";
    const resizeWParam = formData.has("resizeW")
      ? readNumber(formData, "resizeW", 0, 1, MAX_OUTPUT_DIMENSION, true)
      : null;
    const resizeHParam = formData.has("resizeH")
      ? readNumber(formData, "resizeH", 0, 1, MAX_OUTPUT_DIMENSION, true)
      : null;
    const resizeMaintainAspect = formData.get("resizeMaintainAspect") !== "false";
    const resizePreset = formData.get("resizePreset") as string | null;
    const resizeModeParam = formData.get("resizeMode") as string | null;

    if (resizePreset && !["original", "custom", "1:1", "16:9", "9:16", "1920", "1280", "1080", "720"].includes(resizePreset)) {
      return badRequest("Unsupported resize preset.");
    }
    if (resizeModeParam && !["fit", "fill", "crop", "stretch"].includes(resizeModeParam)) {
      return badRequest("Unsupported resize mode.");
    }

    let currentWidth = originalMeta.width;
    let currentHeight = originalMeta.height;
    if (originalMeta.orientation && originalMeta.orientation >= 5) {
      [currentWidth, currentHeight] = [currentHeight, currentWidth];
    }

    let pipeline = sharp(inputBuffer, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
      pages: 1,
    }).rotate();

    if (suppliedCropKeys.length === 4) {
      const cropX = readNumber(formData, "cropX", 0, 0, MAX_INPUT_DIMENSION, true);
      const cropY = readNumber(formData, "cropY", 0, 0, MAX_INPUT_DIMENSION, true);
      const cropW = readNumber(formData, "cropW", 0, 1, MAX_INPUT_DIMENSION, true);
      const cropH = readNumber(formData, "cropH", 0, 1, MAX_INPUT_DIMENSION, true);
      if (cropX + cropW > currentWidth || cropY + cropH > currentHeight) {
        return badRequest("Crop area is outside the image boundaries.");
      }
      pipeline = pipeline.extract({ left: cropX, top: cropY, width: cropW, height: cropH });
      currentWidth = cropW;
      currentHeight = cropH;
    } else if (microCrop > 0 && currentWidth && currentHeight) {
      const cropPx = Math.min(microCrop, Math.floor(Math.min(currentWidth, currentHeight) / 4));
      const newWidth = currentWidth - cropPx * 2;
      const newHeight = currentHeight - cropPx * 2;
      if (newWidth > 0 && newHeight > 0) {
        pipeline = pipeline.extract({ left: cropPx, top: cropPx, width: newWidth, height: newHeight });
        currentWidth = newWidth;
        currentHeight = newHeight;
      }
    }

    if (resizeEnabled) {
      let targetW = resizeWParam;
      let targetH = resizeHParam;

      if (resizePreset && resizePreset !== "original" && resizePreset !== "custom") {
        if (resizePreset === "1:1") {
          const side = Math.max(currentWidth, currentHeight);
          targetW = side;
          targetH = side;
        } else if (resizePreset === "16:9") {
          targetW = resizeWParam || currentWidth;
          targetH = Math.round((targetW * 9) / 16);
        } else if (resizePreset === "9:16") {
          targetH = resizeHParam || currentHeight;
          targetW = Math.round((targetH * 9) / 16);
        } else {
          const dimension = Number(resizePreset);
          if (currentWidth > currentHeight) {
            targetW = dimension;
            targetH = Math.round((currentHeight / currentWidth) * dimension);
          } else {
            targetH = dimension;
            targetW = Math.round((currentWidth / currentHeight) * dimension);
          }
        }
      } else if (resizePreset === "original") {
        targetW = currentWidth;
        targetH = currentHeight;
      }

      if (targetW && !targetH) {
        targetH = resizeMaintainAspect
          ? Math.round((currentHeight / currentWidth) * targetW)
          : currentHeight;
      } else if (targetH && !targetW) {
        targetW = resizeMaintainAspect
          ? Math.round((currentWidth / currentHeight) * targetH)
          : currentWidth;
      }

      if (targetW && targetH) {
        if (
          targetW > MAX_OUTPUT_DIMENSION ||
          targetH > MAX_OUTPUT_DIMENSION ||
          targetW * targetH > MAX_OUTPUT_PIXELS
        ) {
          return badRequest("Requested output dimensions exceed the processing limit.", 413);
        }

        const mode = resizeModeParam || "fit";
        const sharpFit: "fill" | "inside" | "cover" = mode === "stretch" || !resizeMaintainAspect
          ? "fill"
          : mode === "fill" || mode === "crop"
            ? "cover"
            : "inside";

        pipeline = pipeline.resize({ width: targetW, height: targetH, fit: sharpFit });
        if (sharpFit === "inside") {
          const scale = Math.min(targetW / currentWidth, targetH / currentHeight);
          currentWidth = Math.max(1, Math.round(currentWidth * scale));
          currentHeight = Math.max(1, Math.round(currentHeight * scale));
        } else {
          currentWidth = targetW;
          currentHeight = targetH;
        }
      }
    }

    if (colorShift !== 0) {
      const brightnessFactor = 1 + colorShift / 100;
      pipeline = pipeline.modulate({ brightness: brightnessFactor });
      const contrastFactor = 1 + (colorShift * 0.5) / 100;
      pipeline = pipeline.linear(contrastFactor, -(128 * (contrastFactor - 1)));
    }

    if (noiseInjection > 0) {
      if (currentWidth * currentHeight > MAX_NOISE_PIXELS) {
        return badRequest("Noise injection is limited to 16 megapixels. Resize the image first.", 413);
      }
      const noiseBuffer = Buffer.alloc(currentWidth * currentHeight * 3);
      const intensity = noiseInjection * 2.55;
      for (let i = 0; i < noiseBuffer.length; i++) {
        noiseBuffer[i] = Math.round(128 + (Math.random() - 0.5) * intensity);
      }
      const noiseImage = await sharp(noiseBuffer, {
        raw: { width: currentWidth, height: currentHeight, channels: 3 },
      }).png().toBuffer();
      pipeline = pipeline.composite([{
        input: noiseImage,
        blend: "soft-light",
        gravity: "northwest",
      }]);
    }

    if (privacyMode === "clean-branding") {
      const author = String(formData.get("author") || "").slice(0, 256);
      const copyright = String(formData.get("copyright") || "").slice(0, 256);
      const description = String(formData.get("description") || "").slice(0, 512);
      const software = String(formData.get("software") || "ZeroMeta Privacy Toolkit").slice(0, 256);

      pipeline = pipeline.withMetadata({
        exif: {
          IFD0: {
            ...(author ? { Artist: author } : {}),
            Software: software,
            ...(description ? { ImageDescription: description } : {}),
            ...(copyright ? { Copyright: copyright } : {}),
          },
        },
      });
    }

    const formatMap = {
      jpeg: () => pipeline.jpeg({ quality, mozjpeg: true }),
      jpg: () => pipeline.jpeg({ quality, mozjpeg: true }),
      png: () => pipeline.png({ quality, compressionLevel: 9 }),
      webp: () => pipeline.webp({ quality }),
      avif: () => pipeline.avif({ quality }),
      gif: () => pipeline.gif(),
    };
    const formatter = formatMap[format as keyof typeof formatMap];
    if (!formatter) return badRequest(`Unsupported output format: ${format}`);

    const outputBuffer = await formatter().toBuffer();
    const outputMeta = await sharp(outputBuffer, { limitInputPixels: MAX_OUTPUT_PIXELS }).metadata();

    const mimeMap: Record<string, string> = {
      jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png",
      webp: "image/webp", avif: "image/avif", gif: "image/gif",
    };
    const extMap: Record<string, string> = {
      jpeg: "jpg", jpg: "jpg", png: "png", webp: "webp", avif: "avif", gif: "gif",
    };
    const outputFilename = safeOutputFilename(file.name, extMap[format]);

    return new NextResponse(outputBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[format],
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "X-Content-Type-Options": "nosniff",
        "X-Original-Size": String(file.size),
        "X-Processed-Size": String(outputBuffer.length),
        "X-Original-Width": String(originalMeta.width),
        "X-Original-Height": String(originalMeta.height),
        "X-Processed-Width": String(outputMeta.width || currentWidth),
        "X-Processed-Height": String(outputMeta.height || currentHeight),
        "X-Metadata-Mode": privacyMode,
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    const message = error instanceof Error ? error.message : "";
    if (
      message.startsWith("Invalid ") ||
      message.includes(" must be between ") ||
      message.includes(" must be a whole number.")
    ) {
      return badRequest(message);
    }
    return NextResponse.json(
      { error: "Failed to process image. Check that the file is valid and within the supported limits." },
      { status: 500 },
    );
  }
}
