"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { MetadataField } from "@/lib/types";
import { downloadBlob } from "@/lib/download";
import { Camera, Code, Cpu, Download, FileSearch, MapPin, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface MetadataInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadataBefore: MetadataField[];
  metadataAfter: MetadataField[];
  fileName?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  camera: <Camera className="w-3.5 h-3.5" />,
  location: <MapPin className="w-3.5 h-3.5" />,
  ai: <Cpu className="w-3.5 h-3.5" />,
  software: <Code className="w-3.5 h-3.5" />,
  other: <FileSearch className="w-3.5 h-3.5" />,
};

const categoryColors: Record<string, string> = {
  camera: "text-blue-400",
  location: "text-red-400",
  ai: "text-purple-400",
  software: "text-amber-400",
  other: "text-zinc-400",
};

export function MetadataInspector({
  open,
  onOpenChange,
  metadataBefore,
  metadataAfter,
  fileName,
}: MetadataInspectorProps) {
  const exportReport = (format: "json" | "txt") => {
    const reportData = {
      filename: fileName || "media-file",
      generatedAt: new Date().toISOString(),
      tool: "ZeroMeta Privacy Toolkit",
      originalMetadata: metadataBefore,
      cleanedMetadata: metadataAfter,
      summary: {
        totalFieldsFound: metadataBefore.length,
        totalFieldsCleaned: metadataBefore.length - metadataAfter.length,
      },
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `${fileName || "file"}-metadata-report.json`);
    } else {
      let text = `ZeroMeta Privacy Report\nFile: ${fileName || "unknown"}\nDate: ${new Date().toLocaleString()}\n\n=== EXPOSED METADATA (BEFORE) ===\n`;
      metadataBefore.forEach((f) => {
        text += `[${f.category.toUpperCase()}] ${f.key}: ${f.value}\n`;
      });
      text += `\n=== CLEANED METADATA (AFTER) ===\n`;
      metadataAfter.forEach((f) => {
        text += `[${f.category.toUpperCase()}] ${f.key}: ${f.value} (Stripped: ${f.stripped})\n`;
      });
      const blob = new Blob([text], { type: "text/plain" });
      downloadBlob(blob, `${fileName || "file"}-metadata-report.txt`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-primary" />
              Metadata Inspector & Report
            </DialogTitle>
            {fileName && (
              <DialogDescription className="truncate mt-1">
                {fileName}
              </DialogDescription>
            )}
          </div>
          {metadataBefore.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport("json")}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport("txt")}
                className="h-8 text-xs gap-1.5"
              >
                Export TXT
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Before Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Before — Raw
              </h3>
            </div>
            <div className="space-y-1.5">
              {metadataBefore.length > 0 ? (
                metadataBefore.map((field, index) => (
                  <motion.div
                    key={`before-${field.key}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={categoryColors[field.category] || "text-zinc-400"}>
                        {categoryIcons[field.category]}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {field.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-zinc-200 font-mono">
                        {field.value}
                      </span>
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Exposed
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No metadata detected
                </p>
              )}
            </div>
          </div>

          {/* Divider (desktop) */}
          <Separator orientation="vertical" className="hidden md:block absolute left-1/2 top-24 bottom-6" />

          {/* After Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                After — Cleaned
              </h3>
            </div>
            <div className="space-y-1.5">
              {metadataAfter.length > 0 ? (
                metadataAfter.map((field, index) => (
                  <motion.div
                    key={`after-${field.key}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={categoryColors[field.category] || "text-zinc-400"}>
                        {categoryIcons[field.category]}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {field.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-zinc-200 font-mono">
                        {field.value}
                      </span>
                      {field.stripped ? (
                        <Badge
                          variant="success"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Stripped
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Clean
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Process image to see results
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
