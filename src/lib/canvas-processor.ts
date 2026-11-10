import { FORMAT_MIME } from "./constants";
import type { ImageFile, MetadataField, ProcessingOptions } from "./types";

export async function extractMetadata(file: File): Promise<MetadataField[]> {
  const fields: MetadataField[] = [];
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  // Basic file info
  fields.push(
    { key: "File Name", value: file.name, category: "other", stripped: false },
    {
      key: "File Size",
      value: `${(file.size / 1024).toFixed(1)} KB`,
      category: "other",
      stripped: false,
    },
    { key: "MIME Type", value: file.type, category: "other", stripped: false },
    {
      key: "Last Modified",
      value: new Date(file.lastModified).toLocaleString(),
      category: "other",
      stripped: false,
    },
  );

  // Try to parse EXIF from JPEG
  if (file.type === "image/jpeg" && view.byteLength > 2) {
    try {
      const exifData = parseJpegExif(view);
      fields.push(...exifData);
    } catch {
      // Not a valid EXIF structure, skip
    }
  }

  // Check for common AI/C2PA markers
  const textDecoder = new TextDecoder("ascii", { fatal: false });
  const headerBytes = new Uint8Array(
    buffer.slice(0, Math.min(buffer.byteLength, 65536)),
  );
  const headerText = textDecoder.decode(headerBytes);

  if (headerText.includes("c2pa") || headerText.includes("C2PA") || headerText.includes("jumbf")) {
    fields.push({
      key: "C2PA / Content Credentials",
      value: "Present (Authenticity Manifest)",
      category: "ai",
      stripped: false,
    });
  }
  if (
    headerText.includes("Stable Diffusion") ||
    headerText.includes("AUTOMATIC1111")
  ) {
    fields.push({
      key: "AI Generator",
      value: "Stable Diffusion",
      category: "ai",
      stripped: false,
    });
  }
  if (headerText.includes("MidJourney") || headerText.includes("midjourney")) {
    fields.push({
      key: "AI Generator",
      value: "MidJourney",
      category: "ai",
      stripped: false,
    });
  }
  if (headerText.includes("DALL-E") || headerText.includes("dall-e")) {
    fields.push({
      key: "AI Generator",
      value: "DALL·E",
      category: "ai",
      stripped: false,
    });
  }
  if (headerText.includes("Adobe") || headerText.includes("Photoshop")) {
    fields.push({
      key: "Software",
      value: "Adobe Photoshop",
      category: "software",
      stripped: false,
    });
  }
  if (headerText.includes("GIMP")) {
    fields.push({
      key: "Software",
      value: "GIMP",
      category: "software",
      stripped: false,
    });
  }

  return fields;
}

/**
 * Parse basic EXIF fields from a JPEG DataView.
 */
function parseJpegExif(view: DataView): MetadataField[] {
  const fields: MetadataField[] = [];

  if (view.getUint16(0) !== 0xffd8) return fields; // Not JPEG

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);

    if (marker === 0xffe1) {
      // APP1 - EXIF
      const length = view.getUint16(offset + 2);
      const exifOffset = offset + 4;

      // Check for "Exif\0\0"
      if (
        view.getUint8(exifOffset) === 0x45 &&
        view.getUint8(exifOffset + 1) === 0x78 &&
        view.getUint8(exifOffset + 2) === 0x69 &&
        view.getUint8(exifOffset + 3) === 0x66
      ) {
        fields.push({
          key: "EXIF Data",
          value: "Present",
          category: "camera",
          stripped: false,
        });

        // Try to find GPS data indicator
        const segmentBytes = new Uint8Array(
          view.buffer.slice(exifOffset, exifOffset + length),
        );
        const segmentText = new TextDecoder("ascii", { fatal: false }).decode(
          segmentBytes,
        );

        if (segmentText.includes("GPS")) {
          fields.push({
            key: "GPS Location",
            value: "Embedded",
            category: "location",
            stripped: false,
          });
        }

        // Look for common EXIF tags in text
        const cameraPatterns = [
          { pattern: /Canon/i, key: "Camera Make", value: "Canon" },
          { pattern: /Nikon/i, key: "Camera Make", value: "Nikon" },
          { pattern: /Sony/i, key: "Camera Make", value: "Sony" },
          { pattern: /Apple/i, key: "Camera Make", value: "Apple" },
          { pattern: /Samsung/i, key: "Camera Make", value: "Samsung" },
          { pattern: /Google/i, key: "Camera Make", value: "Google" },
          { pattern: /HUAWEI/i, key: "Camera Make", value: "Huawei" },
          { pattern: /OnePlus/i, key: "Camera Make", value: "OnePlus" },
        ];

        for (const { pattern, key, value } of cameraPatterns) {
          if (pattern.test(segmentText)) {
            fields.push({ key, value, category: "camera", stripped: false });
            break;
          }
        }
      }

      offset += 2 + length;
    } else if ((marker & 0xff00) === 0xff00) {
      if (marker === 0xffda) break; // Start of scan data
      const length = view.getUint16(offset + 2);
      offset += 2 + length;
    } else {
      break;
    }
  }

  return fields;
}

export async function processImageCanvas(
  imageFile: ImageFile,
  options: ProcessingOptions,
): Promise<{ blob: Blob; metadataAfter: MetadataField[] }> {
  return new Promise((resolve, reject) => {
    const file = imageFile.file;
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Base crop
        let srcX = options.microCrop;
        let srcY = options.microCrop;
        let srcW = img.width - options.microCrop * 2;
        let srcH = img.height - options.microCrop * 2;

        // Apply custom user crop if present
        if (imageFile.cropData && imageFile.cropData.width > 0) {
          srcX = imageFile.cropData.x;
          srcY = imageFile.cropData.y;
          srcW = imageFile.cropData.width;
          srcH = imageFile.cropData.height;
        }

        if (srcW <= 0 || srcH <= 0) {
          throw new Error("Crop value too large or invalid for this image");
        }

        // Calculate final dimensions (resize)
        let destW = srcW;
        let destH = srcH;

        const activeResize = imageFile.customResize || options.globalResize;
        if (activeResize && activeResize.enabled) {
          let targetW = activeResize.width;
          let targetH = activeResize.height;

          // Preset handling (longest side OR ratio)
          const preset = activeResize.preset;
          if (preset && preset !== "original" && preset !== "custom") {
            // Ratio presets: "1:1", "16:9", "9:16"
            if (preset === "1:1") {
              const side = Math.max(srcW, srcH);
              targetW = side;
              targetH = side;
            } else if (preset === "16:9") {
              targetW = activeResize.width || srcW;
              targetH = Math.round((targetW * 9) / 16);
            } else if (preset === "9:16") {
              targetH = activeResize.height || srcH;
              targetW = Math.round((targetH * 9) / 16);
            } else {
              // Legacy pixel preset (longest side)
              const dim = parseInt(preset);
              if (!isNaN(dim)) {
                if (srcW > srcH) {
                  targetW = dim;
                  targetH = Math.round((srcH / srcW) * dim);
                } else {
                  targetH = dim;
                  targetW = Math.round((srcW / srcH) * dim);
                }
              }
            }
          } else if (preset === "original") {
            targetW = srcW;
            targetH = srcH;
          }

          if (targetW || targetH) {
            const mode = activeResize.mode || "fit";

            // If only one dimension is provided, calculate the other
            if (targetW && !targetH) {
              targetH = activeResize.maintainAspectRatio
                ? Math.round((srcH / srcW) * targetW)
                : srcH;
            } else if (targetH && !targetW) {
              targetW = activeResize.maintainAspectRatio
                ? Math.round((srcW / srcH) * targetH)
                : srcW;
            }

            if (targetW && targetH) {
              if (mode === "stretch" || !activeResize.maintainAspectRatio) {
                destW = targetW;
                destH = targetH;
              } else if (mode === "fit") {
                const ratio = Math.min(targetW / srcW, targetH / srcH);
                destW = Math.round(srcW * ratio);
                destH = Math.round(srcH * ratio);
              } else if (mode === "fill" || mode === "crop") {
                const ratio = Math.max(targetW / srcW, targetH / srcH);
                destW = targetW;
                destH = targetH;

                const newSrcW = Math.round(targetW / ratio);
                const newSrcH = Math.round(targetH / ratio);
                srcX = srcX + (srcW - newSrcW) / 2;
                srcY = srcY + (srcH - newSrcH) / 2;
                srcW = newSrcW;
                srcH = newSrcH;
              }
            }
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = destW;
        canvas.height = destH;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Draw the image (cropped and resized if applicable)
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH);

        // Apply color shift if enabled
        if (options.colorShift !== 0) {
          const imageData = ctx.getImageData(0, 0, destW, destH);
          const data = imageData.data;
          const shift = options.colorShift / 100; // Convert percentage to fraction

          for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] + data[i] * shift * 0.5); // R
            data[i + 1] = clamp(data[i + 1] + data[i + 1] * shift * 0.3); // G
            data[i + 2] = clamp(data[i + 2] + data[i + 2] * shift * 0.7); // B
          }

          ctx.putImageData(imageData, 0, 0);
        }

        // Apply noise injection if enabled
        if (options.noiseInjection > 0) {
          const imageData = ctx.getImageData(0, 0, destW, destH);
          const data = imageData.data;
          const intensity = options.noiseInjection * 2.55;

          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity;
            data[i] = clamp(data[i] + noise);
            data[i + 1] = clamp(data[i + 1] + noise);
            data[i + 2] = clamp(data[i + 2] + noise);
          }

          ctx.putImageData(imageData, 0, 0);
        }

        const requestedMime = FORMAT_MIME[options.format] || "image/jpeg";
        const quality = options.quality / 100;

        const tryToBlob = (
          mimeType: string,
          onDone: (blob: Blob | null) => void,
        ) => {
          canvas.toBlob(onDone, mimeType, quality);
        };

        tryToBlob(requestedMime, (blob) => {
          if (!blob && requestedMime === "image/avif") {
            // AVIF encode not supported in this browser — fall back to WebP
            tryToBlob("image/webp", (fallbackBlob) => {
              URL.revokeObjectURL(url);
              if (!fallbackBlob) {
                reject(new Error("Failed to create blob from canvas"));
                return;
              }
              resolveWithBlob(fallbackBlob, "image/webp");
            });
          } else {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"));
              return;
            }
            resolveWithBlob(blob, requestedMime);
          }
        });

        function resolveWithBlob(blob: Blob, mimeType: string) {
          const metadataAfter: MetadataField[] = [
            {
              key: "File Name",
              value: file.name,
              category: "other",
              stripped: false,
            },
            {
              key: "File Size",
              value: `${(blob.size / 1024).toFixed(1)} KB`,
              category: "other",
              stripped: false,
            },
            {
              key: "MIME Type",
              value: mimeType,
              category: "other",
              stripped: false,
            },
            {
              key: "Dimensions",
              value: `${destW} × ${destH}`,
              category: "other",
              stripped: false,
            },
            {
              key: "EXIF Data",
              value: "Stripped ✓",
              category: "camera",
              stripped: true,
            },
            {
              key: "GPS Location",
              value: "Stripped ✓",
              category: "location",
              stripped: true,
            },
            {
              key: "C2PA Manifest",
              value: "Stripped ✓",
              category: "ai",
              stripped: true,
            },
            {
              key: "AI Tags",
              value: "Stripped ✓",
              category: "ai",
              stripped: true,
            },
            {
              key: "Software",
              value: "Stripped ✓",
              category: "software",
              stripped: true,
            },
          ];

          if (options.microCrop > 0 || imageFile.cropData) {
            metadataAfter.push({
              key: "Crop Applied",
              value: "Yes",
              category: "other",
              stripped: false,
            });
          }
          if (activeResize && (activeResize.width || activeResize.height)) {
            metadataAfter.push({
              key: "Resize Applied",
              value: "Yes",
              category: "other",
              stripped: false,
            });
          }
          if (options.colorShift !== 0) {
            metadataAfter.push({
              key: "Color Shift Applied",
              value: `${options.colorShift > 0 ? "+" : ""}${options.colorShift}%`,
              category: "other",
              stripped: false,
            });
          }
          if (options.noiseInjection > 0) {
            metadataAfter.push({
              key: "Noise Injection",
              value: `${options.noiseInjection}%`,
              category: "other",
              stripped: false,
            });
          }

          resolve({ blob, metadataAfter });
        }
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
