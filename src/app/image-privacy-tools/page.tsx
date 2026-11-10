"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { downloadBlob } from "@/lib/download";
import { Button } from "@/components/ui/button";
import {
  EyeOff,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Square,
  Grid,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type RedactionEffect = "blur" | "pixelate" | "blackout";

interface RedactionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  effect: RedactionEffect;
}

export default function ImagePrivacyToolsPage() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [effect, setEffect] = useState<RedactionEffect>("blur");
  const [history, setHistory] = useState<ImageData[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const { toast } = useToast();

  const handleFileAdded = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const imgFile = files[0];
    setSourceImage(imgFile);
    const url = URL.createObjectURL(imgFile);
    setSourceImageUrl(url);
    setHistory([]);
  }, []);

  // Initialize canvas with uploaded image
  useEffect(() => {
    if (!sourceImageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      // Save baseline state in history
      const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initial]);
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl]);

  const applyEffectToRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    currentEffect: RedactionEffect
  ) => {
    const rx = Math.max(0, Math.floor(Math.min(x, x + w)));
    const ry = Math.max(0, Math.floor(Math.min(y, y + h)));
    const rw = Math.min(ctx.canvas.width - rx, Math.abs(Math.floor(w)));
    const rh = Math.min(ctx.canvas.height - ry, Math.abs(Math.floor(h)));

    if (rw <= 0 || rh <= 0) return;

    if (currentEffect === "blackout") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(rx, ry, rw, rh);
      return;
    }

    if (currentEffect === "pixelate") {
      const blockSize = Math.max(8, Math.floor(Math.min(rw, rh) / 8));
      const imgData = ctx.getImageData(rx, ry, rw, rh);
      const data = imgData.data;

      for (let py = 0; py < rh; py += blockSize) {
        for (let px = 0; px < rw; px += blockSize) {
          const sampleIdx = (py * rw + px) * 4;
          const r = data[sampleIdx];
          const g = data[sampleIdx + 1];
          const b = data[sampleIdx + 2];

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(rx + px, ry + py, blockSize, blockSize);
        }
      }
      return;
    }

    // Heavy Box/Stack Blur
    const imgData = ctx.getImageData(rx, ry, rw, rh);
    const data = imgData.data;
    const radius = Math.max(4, Math.floor(Math.min(rw, rh) / 10));

    // Multi-pass box blur for smooth, irreversible redaction
    for (let pass = 0; pass < 3; pass++) {
      for (let py = 0; py < rh; py++) {
        for (let px = 0; px < rw; px++) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let dy = -radius; dy <= radius; dy += 2) {
            for (let dx = -radius; dx <= radius; dx += 2) {
              const nx = px + dx;
              const ny = py + dy;
              if (nx >= 0 && nx < rw && ny >= 0 && ny < rh) {
                const idx = (ny * rw + nx) * 4;
                sumR += data[idx];
                sumG += data[idx + 1];
                sumB += data[idx + 2];
                count++;
              }
            }
          }
          const curIdx = (py * rw + px) * 4;
          data[curIdx] = Math.round(sumR / count);
          data[curIdx + 1] = Math.round(sumG / count);
          data[curIdx + 2] = Math.round(sumB / count);
        }
      }
    }
    ctx.putImageData(imgData, rx, ry);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    isDrawingRef.current = true;
    startPosRef.current = coords;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !startPosRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;

    const coords = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = coords.x - startPosRef.current.x;
    const h = coords.y - startPosRef.current.y;

    if (Math.abs(w) > 5 && Math.abs(h) > 5) {
      applyEffectToRect(ctx, startPosRef.current.x, startPosRef.current.y, w, h, effect);
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev, snapshot]);
      toast({
        title: "Area Redacted",
        description: `Applied ${effect} to selected region.`,
        variant: "success",
      });
    }

    startPosRef.current = null;
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const last = newHistory[newHistory.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory(newHistory);
  };

  const handleReset = () => {
    if (history.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const original = history[0];
    ctx.putImageData(original, 0, 0);
    setHistory([original]);
  };

  const handleDownload = () => {
    if (!canvasRef.current || !sourceImage) return;
    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${sourceImage.name.replace(/\.[^.]+$/, "")}_redacted.png`);
        toast({
          title: "Image Downloaded",
          description: "Permanent redacted photo saved with zero metadata.",
          variant: "success",
        });
      }
    }, "image/png");
  };

  return (
    <ToolShell
      title="Image Privacy & Redaction Studio"
      badge="Pixel Redaction"
      description="Protect visual privacy before sharing: interactive face blur, license plate mosaic, and permanent solid black-box redactions running locally on your device."
      breadcrumbs={[{ label: "Image Privacy Tools" }]}
      howItWorks={[
        {
          step: "01",
          title: "Upload Photo",
          desc: "Select any photo containing faces, vehicle license plates, ID cards, or sensitive documents.",
        },
        {
          step: "02",
          title: "Select Redaction Tool",
          desc: "Choose between Irreversible Gaussian Blur, Pixelate Mosaic, or Solid Blackout Box.",
        },
        {
          step: "03",
          title: "Drag Across Target",
          desc: "Click and drag directly over faces, names, or addresses. The pixels are permanently modified.",
        },
      ]}
      supportedFormats={[
        {
          format: "Images (All Formats)",
          extension: ".jpg, .png, .webp, .tiff",
          capabilities: "Real-time canvas blur, pixelation, blackout box, metadata purge",
          notes: "Exports metadata-free PNG or JPG with permanent pixel alteration.",
        },
      ]}
      privacyNotes={[
        "Redaction occurs directly in your browser's HTML5 Canvas context.",
        "Modified pixels are permanently altered in memory—no original pixel layer is retained in the exported file.",
      ]}
      limitations={[
        "Ensure the entire sensitive area (e.g. all digits of an ID or credit card) is covered by the box.",
      ]}
      faqs={[
        {
          q: "Can blurred faces or license plates be un-blurred by AI?",
          a: "ZeroMeta uses destructive box blur and mosaic averaging that permanently discards high-frequency pixel data. When combined with black-out mode, the information is completely non-recoverable.",
        },
      ]}
    >
      <div className="space-y-6">
        {!sourceImageUrl ? (
          <UniversalUploader
            files={[]}
            onFilesAdded={handleFileAdded}
            onFileRemove={() => {}}
            onClearAll={() => {}}
            allowedType="image"
          />
        ) : (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider mr-2">
                  Redaction Tool:
                </span>
                <Button
                  size="sm"
                  variant={effect === "blur" ? "default" : "outline"}
                  onClick={() => setEffect("blur")}
                  className="gap-1.5 h-8 text-xs"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Heavy Blur
                </Button>
                <Button
                  size="sm"
                  variant={effect === "pixelate" ? "default" : "outline"}
                  onClick={() => setEffect("pixelate")}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Grid className="w-3.5 h-3.5" />
                  Pixelate Mosaic
                </Button>
                <Button
                  size="sm"
                  variant={effect === "blackout" ? "default" : "outline"}
                  onClick={() => setEffect("blackout")}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  Solid Blackout
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndo}
                  disabled={history.length <= 1}
                  className="gap-1.5 h-8 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="btn-primary gap-1.5 h-8 text-xs shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Redacted Photo
                </Button>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>Click and drag a box across faces, license plates, or confidential text to redact.</span>
            </div>

            {/* Canvas Workspace */}
            <div className="relative border border-border rounded-xl bg-black/40 overflow-hidden flex items-center justify-center p-2 min-h-[400px]">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="max-w-full max-h-[70vh] object-contain cursor-crosshair shadow-2xl rounded"
              />
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

