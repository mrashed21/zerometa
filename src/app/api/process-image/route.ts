import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

// Simple in-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many processing requests. Please wait a minute before retrying." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 },
      );
    }

    const format = (formData.get("format") as string) || "jpeg";
    const quality = parseInt(formData.get("quality") as string) || 95;
    const microCrop = parseInt(formData.get("microCrop") as string) || 0;
    const colorShift = parseFloat(formData.get("colorShift") as string) || 0;
    const noiseInjection =
      parseFloat(formData.get("noiseInjection") as string) || 0;
    const privacyMode =
      (formData.get("privacyMode") as string) || "privacy-clean";

    const cropX = formData.has("cropX")
      ? parseFloat(formData.get("cropX") as string)
      : null;
    const cropY = formData.has("cropY")
      ? parseFloat(formData.get("cropY") as string)
      : null;
    const cropW = formData.has("cropW")
      ? parseFloat(formData.get("cropW") as string)
      : null;
    const cropH = formData.has("cropH")
      ? parseFloat(formData.get("cropH") as string)
      : null;

    const resizeEnabled = formData.get("resizeEnabled") === "true";
    const resizeWParam = formData.has("resizeW")
      ? parseInt(formData.get("resizeW") as string)
      : null;
    const resizeHParam = formData.has("resizeH")
      ? parseInt(formData.get("resizeH") as string)
      : null;
    const resizeMaintainAspect =
      formData.get("resizeMaintainAspect") !== "false";
    const resizePreset = formData.get("resizePreset") as string | null;
    const resizeModeParam = formData.get("resizeMode") as string | null;

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const originalMeta = await sharp(inputBuffer).metadata();

    let pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();

    let currentWidth = originalMeta.width || 0;
    let currentHeight = originalMeta.height || 0;

    if (originalMeta.orientation && originalMeta.orientation >= 5) {
      currentWidth = originalMeta.height || 0;
      currentHeight = originalMeta.width || 0;
    }

    if (cropW !== null && cropH !== null && cropX !== null && cropY !== null) {
      pipeline = pipeline.extract({
        left: Math.round(cropX),
        top: Math.round(cropY),
        width: Math.round(cropW),
        height: Math.round(cropH),
      });
      currentWidth = Math.round(cropW);
      currentHeight = Math.round(cropH);
    } else if (microCrop > 0 && currentWidth && currentHeight) {
      const cropPx = Math.min(
        microCrop,
        Math.floor(Math.min(currentWidth, currentHeight) / 4),
      );
      const newWidth = currentWidth - cropPx * 2;
      const newHeight = currentHeight - cropPx * 2;

      if (newWidth > 0 && newHeight > 0) {
        pipeline = pipeline.extract({
          left: cropPx,
          top: cropPx,
          width: newWidth,
          height: newHeight,
        });
        currentWidth = newWidth;
        currentHeight = newHeight;
      }
    }

    if (resizeEnabled) {
      let targetW = resizeWParam;
      let targetH = resizeHParam;

      if (
        resizePreset &&
        resizePreset !== "original" &&
        resizePreset !== "custom"
      ) {
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
          const dim = parseInt(resizePreset);
          if (!isNaN(dim)) {
            if (currentWidth > currentHeight) {
              targetW = dim;
              targetH = Math.round((currentHeight / currentWidth) * dim);
            } else {
              targetH = dim;
              targetW = Math.round((currentWidth / currentHeight) * dim);
            }
          }
        }
      } else if (resizePreset === "original") {
        targetW = currentWidth;
        targetH = currentHeight;
      }

      if (targetW || targetH) {
        if (targetW && !targetH) {
          targetH = resizeMaintainAspect
            ? Math.round((currentHeight / currentWidth) * targetW)
            : currentHeight;
        } else if (targetH && !targetW) {
          targetW = resizeMaintainAspect
            ? Math.round((currentWidth / currentHeight) * targetH)
            : currentWidth;
        }

        let sharpFit: "contain" | "cover" | "fill" | "inside" | "outside" =
          "inside";
        const mode = resizeModeParam || "fit";

        if (mode === "stretch" || !resizeMaintainAspect) {
          sharpFit = "fill";
        } else if (mode === "fit") {
          sharpFit = "inside";
        } else if (mode === "fill" || mode === "crop") {
          sharpFit = "cover";
        }

        pipeline = pipeline.resize({
          width: targetW || undefined,
          height: targetH || undefined,
          fit: sharpFit,
        });

        if (targetW) currentWidth = targetW;
        if (targetH) currentHeight = targetH;
      }
    }

    if (colorShift !== 0) {
      const brightnessFactor = 1 + colorShift / 100;
      pipeline = pipeline.modulate({
        brightness: brightnessFactor,
      });
      const contrastFactor = 1 + (colorShift * 0.5) / 100;
      pipeline = pipeline.linear(contrastFactor, -(128 * (contrastFactor - 1)));
    }

    if (noiseInjection > 0 && currentWidth > 0 && currentHeight > 0) {
      const width = currentWidth;
      const height = currentHeight;

      if (width > 0 && height > 0) {
        const channels = 3;
        const noiseBuffer = Buffer.alloc(width * height * channels);
        const intensity = noiseInjection * 2.55;

        for (let i = 0; i < noiseBuffer.length; i++) {
          noiseBuffer[i] = Math.round(128 + (Math.random() - 0.5) * intensity);
        }

        const noiseImage = await sharp(noiseBuffer, {
          raw: { width, height, channels },
        })
          .png()
          .toBuffer();

        pipeline = pipeline.composite([
          {
            input: noiseImage,
            blend: "soft-light" as const,
            gravity: "northwest",
          },
        ]);
      }
    }

    if (privacyMode === "clean-branding") {
      const customAuthor = (formData.get("author") as string) || "";
      const customCopyright = (formData.get("copyright") as string) || "";
      const customDescription = (formData.get("description") as string) || "";
      const customSoftware = (formData.get("software") as string) || "ZeroMeta Privacy Toolkit";

      pipeline = pipeline.withMetadata({
        exif: {
          IFD0: {
            ...(customAuthor ? { Artist: customAuthor } : {}),
            Software: customSoftware,
            ...(customDescription ? { ImageDescription: customDescription } : {}),
            ...(customCopyright ? { Copyright: customCopyright } : {}),
          },
        },
      });
    }

    let outputBuffer: Buffer;
    const formatMap = {
      jpeg: () => pipeline.jpeg({ quality, mozjpeg: true }),
      jpg: () => pipeline.jpeg({ quality, mozjpeg: true }),
      png: () =>
        pipeline.png({ quality: Math.round(quality), compressionLevel: 9 }),
      webp: () => pipeline.webp({ quality }),
      avif: () => pipeline.avif({ quality }),
      gif: () => pipeline.gif(),
    };

    const formatter = formatMap[format as keyof typeof formatMap];
    if (!formatter) {
      return NextResponse.json(
        { error: `Unsupported output format: ${format}` },
        { status: 400 },
      );
    }

    outputBuffer = await formatter().toBuffer();

    const mimeMap: Record<string, string> = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
      gif: "image/gif",
    };

    const extMap: Record<string, string> = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
      avif: "avif",
      gif: "gif",
    };

    const outputFilename = file.name.replace(
      /\.[^.]+$/,
      `_cleaned.${extMap[format] || "jpg"}`,
    );

    return new NextResponse(outputBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[format] || "image/jpeg",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "X-Content-Type-Options": "nosniff",
        "X-Original-Size": String(file.size),
        "X-Processed-Size": String(outputBuffer.length),
        "X-Original-Width": String(originalMeta.width || 0),
        "X-Original-Height": String(originalMeta.height || 0),
        "X-Processed-Width": String(currentWidth),
        "X-Processed-Height": String(currentHeight),
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
