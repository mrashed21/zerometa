"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ProcessingOptions } from "@/lib/types";
import {
  Check,
  FileType,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Lock,
  Maximize2,
  Music,
  Play,
  Settings2,
  Unlock,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

interface ControlPanelProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  onProcess: () => void;
  onCancel?: () => void;
  isProcessing: boolean;
  activeTab: "image" | "video" | "audio";
  fileCount: number;
}

export function ControlPanel({
  options,
  onOptionsChange,
  onProcess,
  onCancel,
  isProcessing,
  activeTab,
  fileCount,
}: ControlPanelProps) {
  const toggleOptimize = (enabled: boolean) => {
    onOptionsChange({
      ...options,
      quality: enabled ? 80 : 95,
      // We could also toggle resizing here if desired
    });
  };

  const isOptimized = options.quality < 95;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
        className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <CardHeader className="pb-4 shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5 text-primary" />
            Processing Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-5 pb-0">
          {/* Image Settings */}
          {activeTab === "image" && (
            <>
              <Separator className="bg-border/50" />

              {/* SPRINT 3-6: Resize Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> Resize Image
                  </Label>
                  <Switch
                    checked={options.globalResize.enabled || false}
                    onCheckedChange={(c) =>
                      onOptionsChange({
                        ...options,
                        globalResize: { ...options.globalResize, enabled: c },
                      })
                    }
                  />
                </div>

                {options.globalResize.enabled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Ratio Presets as button grid */}
                    <div className="space-y-2">
                      <Label className="text-[11px] text-muted-foreground">
                        Aspect Ratio Preset
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            { label: "Custom", value: "custom" },
                            { label: "1:1", value: "1:1" },
                            { label: "16:9", value: "16:9" },
                            { label: "9:16", value: "9:16" },
                          ] as const
                        ).map(({ label, value }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              const cur = options.globalResize;
                              let w = cur.width || 1920;
                              let h = cur.height || 1080;
                              if (value === "1:1") {
                                h = w;
                              }
                              if (value === "16:9") {
                                h = Math.round((w * 9) / 16);
                              }
                              if (value === "9:16") {
                                h = Math.round((w * 16) / 9);
                              }
                              onOptionsChange({
                                ...options,
                                globalResize: {
                                  ...cur,
                                  preset: value,
                                  width: w,
                                  height: value === "custom" ? h : h,
                                  maintainAspectRatio: value !== "custom",
                                },
                              });
                            }}
                            className={`h-9 rounded-md border text-xs font-medium transition-all ${
                              options.globalResize.preset === value
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-card/50 text-muted-foreground hover:border-neutral-300 hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions */}
                    {options.globalResize.preset === "custom" && (
                      <div className="flex items-center gap-3">
                        <div className="space-y-2 flex-1">
                          <Label className="text-[11px] text-muted-foreground">
                            Width (px)
                          </Label>
                          <Input
                            type="number"
                            className="h-9 bg-card/50 font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Auto"
                            min={1}
                            onWheel={(e) => e.currentTarget.blur()}
                            value={options.globalResize.width || ""}
                            onChange={(e) => {
                              const w = parseInt(e.target.value) || undefined;
                              const cur = options.globalResize;
                              let h = cur.height;
                              if (
                                w &&
                                cur.maintainAspectRatio &&
                                cur.width &&
                                cur.height
                              ) {
                                h = Math.round((cur.height / cur.width) * w);
                              }
                              onOptionsChange({
                                ...options,
                                globalResize: { ...cur, width: w, height: h },
                              });
                            }}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`mt-6 shrink-0 h-9 w-9 rounded-full ${options.globalResize.maintainAspectRatio ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                          onClick={() =>
                            onOptionsChange({
                              ...options,
                              globalResize: {
                                ...options.globalResize,
                                maintainAspectRatio:
                                  !options.globalResize.maintainAspectRatio,
                              },
                            })
                          }
                          title="Lock Aspect Ratio"
                        >
                          {options.globalResize.maintainAspectRatio ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </Button>

                        <div className="space-y-2 flex-1">
                          <Label className="text-[11px] text-muted-foreground">
                            Height (px)
                          </Label>
                          <Input
                            type="number"
                            className="h-9 bg-card/50 font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Auto"
                            min={1}
                            onWheel={(e) => e.currentTarget.blur()}
                            value={options.globalResize.height || ""}
                            onChange={(e) => {
                              const h = parseInt(e.target.value) || undefined;
                              const cur = options.globalResize;
                              let w = cur.width;
                              if (
                                h &&
                                cur.maintainAspectRatio &&
                                cur.width &&
                                cur.height
                              ) {
                                w = Math.round((cur.width / cur.height) * h);
                              }
                              onOptionsChange({
                                ...options,
                                globalResize: { ...cur, width: w, height: h },
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Mode */}
                    <div className="space-y-2">
                      <Label className="text-[11px] text-muted-foreground">
                        Resize Mode
                      </Label>
                      <Select
                        value={options.globalResize.mode || "fit"}
                        onValueChange={(val: any) => {
                          onOptionsChange({
                            ...options,
                            globalResize: {
                              ...options.globalResize,
                              mode: val,
                            },
                          });
                        }}
                      >
                        <SelectTrigger className="h-9 bg-card/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fit">
                            Fit (Preserve ratio, fit inside)
                          </SelectItem>
                          <SelectItem value="fill">
                            Fill (Preserve ratio, fill area)
                          </SelectItem>
                          <SelectItem value="crop">
                            Crop (Crop excess area)
                          </SelectItem>
                          <SelectItem value="stretch">
                            Stretch (Ignore ratio)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-border/50" />

              {/* SPRINT 7: Format Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <FileType className="w-3.5 h-3.5" /> Output Format
                  </Label>
                </div>
                <Select
                  value={options.format}
                  onValueChange={(val: any) =>
                    onOptionsChange({ ...options, format: val })
                  }
                >
                  <SelectTrigger className="h-9 bg-card/50">
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP (Recommended)</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="avif">
                      AVIF (Best compression)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-border/50" />

              {/* SPRINT 8: Quality Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5" /> Quality:{" "}
                    {options.quality}%
                  </Label>
                </div>
                <div className="space-y-3 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                  <Slider
                    value={[options.quality]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={([val]) =>
                      onOptionsChange({ ...options, quality: val })
                    }
                  />
                  {options.quality < 50 && (
                    <p className="text-[11px] text-amber-500/90 leading-tight">
                      Warning: Quality below 50% may result in noticeable
                      artifacts and blurriness.
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* SPRINT 9: Metadata & Optimization (Existing) */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Metadata & Optimization
                </Label>
                <div className="space-y-2">
                  <ChecklistItem checked label="Remove EXIF" />
                  <ChecklistItem checked label="Remove GPS" />
                  <ChecklistItem checked label="Remove device info" />
                  <ChecklistItem
                    checked={!isOptimized}
                    label="Preserve quality"
                  />
                  <ChecklistItem
                    checked={isOptimized}
                    interactive
                    onChange={() => toggleOptimize(!isOptimized)}
                    label="Optimize file size"
                  />
                </div>
              </div>
            </>
          )}

          {/* Video Settings */}
          {activeTab === "video" && (
            <>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Video Rules
                </Label>
                <div className="space-y-2">
                  <ChecklistItem checked label="Remove metadata" />
                  <ChecklistItem checked label="Preserve resolution" />
                  <ChecklistItem checked label="Preserve audio" />
                  <ChecklistItem
                    checked={isOptimized}
                    interactive
                    onChange={() => toggleOptimize(!isOptimized)}
                    label="Optimize file size"
                  />
                </div>
              </div>
            </>
          )}

          {/* Audio Settings */}
          {activeTab === "audio" && (
            <>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Audio Rules
                </Label>
                <div className="space-y-2">
                  <ChecklistItem checked label="Remove metadata" />
                  <ChecklistItem checked label="Preserve audio quality" />
                  <ChecklistItem
                    checked={isOptimized}
                    interactive
                    onChange={() => toggleOptimize(!isOptimized)}
                    label="Optimize file size"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>

        {/* ── Sticky Process Button — always visible ── */}
        <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
          {isProcessing ? (
            <Button
              className="w-full h-12 btn-secondary bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 hover:border-destructive/30"
              onClick={onCancel}
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              CANCEL PROCESSING
            </Button>
          ) : (
            <Button
              className="w-full h-12 btn-primary"
              onClick={onProcess}
              disabled={fileCount === 0}
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              PROCESS{" "}
              {fileCount > 0
                ? `${fileCount} FILE${fileCount > 1 ? "S" : ""}`
                : ""}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function ChecklistItem({
  checked,
  label,
  interactive,
  onChange,
}: {
  checked: boolean;
  label: string;
  interactive?: boolean;
  onChange?: () => void;
}) {
  const Component = interactive ? "button" : "div";
  return (
    <Component
      type={interactive ? "button" : undefined}
      role={interactive ? "checkbox" : undefined}
      aria-checked={interactive ? checked : undefined}
      aria-disabled={!interactive}
      onClick={interactive ? onChange : undefined}
      className={`flex items-center gap-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm w-full text-left ${
        interactive ? "cursor-pointer select-none group" : "opacity-80"
      }`}
    >
      <div
        className={`flex items-center justify-center w-4 h-4 rounded-sm border transition-colors shrink-0 ${
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="w-3 h-3 stroke-3" />}
      </div>
      <span
        className={
          checked ? "text-foreground font-medium" : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </Component>
  );
}
