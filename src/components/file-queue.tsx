"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  FileText,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, calculateAspectRatio } from "@/lib/utils";
import type { MediaFile, MetadataField } from "@/lib/types";

// =============================================================================
// FileCard Component
// =============================================================================

interface FileCardProps {
  file: MediaFile;
  onRemove: (id: string) => void;
  onInspect: (id: string) => void;
  onDownload: (id: string) => void;
}

const statusConfig = {
  queued: {
    icon: Clock,
    badgeClass: "badge-neutral",
    label: "Waiting",
  },
  processing: {
    icon: Loader2,
    badgeClass: "badge-brand",
    label: "Processing",
  },
  done: {
    icon: CheckCircle2,
    badgeClass: "badge-success",
    label: "Completed",
  },
  error: {
    icon: AlertCircle,
    badgeClass: "badge-danger",
    label: "Failed",
  },
};

function FileCard({ file, onRemove, onInspect, onDownload }: FileCardProps) {
  const isDone = file.status === "done";
  const isProcessing = file.status === "processing";
  const isError = file.status === "error";
  const config = statusConfig[file.status];
  const StatusIcon = config.icon;

  const getMediaIcon = () => {
    switch (file.mediaType) {
      case "video": return <FileVideo className="w-8 h-8 text-muted-foreground/60" />;
      case "audio": return <FileAudio className="w-8 h-8 text-muted-foreground/60" />;
      case "document": return <FileText className="w-8 h-8 text-primary/70" />;
      default: return <FileImage className="w-8 h-8 text-muted-foreground/60" />;
    }
  };

  // The 'result' field belongs to MediaFile in Sprint 06+.
  // Meanwhile, we support 'processedBlob' for backward compatibility with ImageFile.
  const processedSize = file.result?.blob.size ?? (file as any).processedBlob?.size;
  const processedBlobExists = !!file.result?.blob || !!(file as any).processedBlob;
  // metadataAfter lives on ImageFile (legacy) or MediaFile.result
  const metadataAfter: MetadataField[] | undefined = file.result?.metadataAfter ?? (file as any).metadataAfter;

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 file-card overflow-hidden group`}>
      {/* ─── Progress Bar (Background) ─── */}
      {isProcessing && (
        <div 
          className="absolute inset-y-0 left-0 bg-[rgba(0,200,255,0.05)] transition-all duration-300 ease-out z-0" 
          style={{ width: `${file.progress}%` }} 
        />
      )}

      {/* ─── Thumbnail / Icon ─── */}
      <div className="relative z-10 w-16 h-16 rounded-lg bg-card border border-border shrink-0 flex items-center justify-center overflow-hidden">
        {file.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
        ) : (
          getMediaIcon()
        )}
      </div>

      {/* ─── Details ─── */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-1.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate" title={file.file.name}>
              {file.file.name}
            </h4>
            <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="uppercase tracking-wider">{file.mediaType || "IMAGE"}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formatFileSize(file.file.size)}</span>
              
              {file.width && file.height && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                  <span className="flex items-center gap-1">
                    {file.width} &times; {file.height}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-mono text-[10px] tracking-widest bg-muted px-1.5 py-0.5 rounded-sm">
                    {calculateAspectRatio(file.width, file.height)}
                  </span>
                </>
              )}

              {/* Show size reduction if completed */}
              {isDone && processedSize && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-semibold text-primary">
                    {(file as any).customName?.split('.').pop()?.toUpperCase() || "BIN"}
                  </span>

                  {metadataAfter?.find((m) => m.key === "Dimensions")?.value && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-muted-foreground">
                        {metadataAfter.find((m) => m.key === "Dimensions")?.value}
                      </span>
                    </>
                  )}

                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className={`font-medium flex items-center gap-1 ${processedSize < file.file.size ? "status-success" : "text-amber-500"}`}>
                    {formatFileSize(processedSize)}
                    <span className="text-[10px] ml-1">
                      ({processedSize < file.file.size ? "-" : "+"}
                      {Math.abs(Math.round(((file.file.size - processedSize) / file.file.size) * 100))}%)
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge className={`shrink-0 gap-1.5 ${config.badgeClass}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            {config.label}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 w-full max-w-xs">
            {isProcessing ? (
              <>
                <Progress value={file.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums w-8">
                  {Math.round(file.progress)}%
                </span>
              </>
            ) : isError ? (
              <span className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="assertive">
                {file.error || "Processing failed"}
              </span>
            ) : isDone ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-dashed bg-transparent border-primary/30">
                  Metadata: Stripped
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Ready to process</span>
            )}
          </div>

          {/* ─── Actions ─── */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isDone && processedBlobExists && (
              <>
                <Button variant="outline" size="sm" onClick={() => onInspect(file.id)} className="gap-1.5 h-8 text-xs">
                  <FileText className="w-3.5 h-3.5" /> Inspect
                </Button>
                <Button size="sm" onClick={() => onDownload(file.id)} className="gap-1.5 h-8 text-xs btn-primary shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Save
                </Button>
              </>
            )}
            
            {/* Remove Button (disabled during processing to prevent errors) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(file.id)}
              disabled={isProcessing}
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FileQueue Component
// =============================================================================

interface FileQueueProps {
  files: MediaFile[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  onInspect: (id: string) => void;
  onDownload: (id: string) => void;
  onDownloadAll?: () => void;
  isZipping?: boolean;
}

export function FileQueue({
  files,
  onRemove,
  onClearAll,
  onInspect,
  onDownload,
  onDownloadAll,
  isZipping,
}: FileQueueProps) {
  if (files.length === 0) return null;

  const totalFiles = files.length;
  const completedCount = files.filter((f) => f.status === "done").length;
  const failedCount = files.filter((f) => f.status === "error").length;
  const processingCount = files.filter((f) => f.status === "processing").length;
  const remainingCount = totalFiles - (completedCount + failedCount);
  const globalProgress = totalFiles > 0 ? Math.round(((completedCount + failedCount) / totalFiles) * 100) : 0;
  
  const hasCompleted = completedCount > 0;
  const isProcessing = processingCount > 0;

  return (
    <div className="space-y-4">
      {/* Global Progress Header */}
      <div className="surface p-4 sm:p-5 shadow-sm overflow-hidden relative">
        {/* Subtle background progress fill */}
        <div 
          className="absolute inset-y-0 left-0 bg-[rgba(0,200,255,0.05)] transition-all duration-300 ease-out z-0" 
          style={{ width: `${globalProgress}%` }} 
        />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isProcessing ? "bg-primary/10" : hasCompleted && remainingCount === 0 && failedCount === 0 ? "bg-success/10" : "bg-muted"}`}>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : hasCompleted && remainingCount === 0 && failedCount === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Layers className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                {isProcessing ? "Processing..." : hasCompleted && remainingCount === 0 ? "Processing Complete" : "Ready to Process"}
                <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider h-5">
                  {completedCount + failedCount} / {totalFiles}
                </Badge>
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                {completedCount > 0 && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3.5 h-3.5" /> {completedCount} Success</span>}
                {failedCount > 0 && <span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-3.5 h-3.5" /> {failedCount} Failed</span>}
                {remainingCount > 0 && <span className="flex items-center gap-1 opacity-70"><Clock className="w-3.5 h-3.5" /> {remainingCount} Remaining</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
            <div className="flex-1 sm:w-32 hidden sm:block">
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1.5 font-medium uppercase tracking-wider">
                <span>Progress</span>
                <span>{globalProgress}%</span>
              </div>
              <Progress value={globalProgress} className="h-1.5 w-full progress-track progress-value" />
            </div>

            {hasCompleted && onDownloadAll && (
              <Button
                size="sm"
                onClick={onDownloadAll}
                disabled={isZipping}
                className="gap-1.5 shrink-0 btn-primary h-9"
              >
                {isZipping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isZipping ? "Zipping..." : "Save All ZIP"}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={isProcessing}
              className="h-9 text-xs text-muted-foreground hover:text-destructive hidden sm:flex"
            >
              Clear
            </Button>
          </div>
        </div>
        
        {/* Mobile progress bar */}
        <div className="sm:hidden mt-4 relative z-10">
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1 font-medium uppercase tracking-wider">
             <span>Progress</span>
             <span>{globalProgress}%</span>
          </div>
          <Progress value={globalProgress} className="h-1 w-full bg-muted" />
        </div>

        {/* ─── Result Dashboard (Sprint 15) ─── */}
        <AnimatePresence>
          {hasCompleted && remainingCount === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 border-t border-border/50 bg-muted/10 p-4 sm:p-5"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Original Size</p>
                  <p className="text-xl font-mono text-foreground">
                    {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Final Size</p>
                  <p className="text-xl font-mono text-foreground">
                    {formatFileSize(files.reduce((acc, f) => {
                      const processedSize = f.result?.blob.size ?? (f as any).processedBlob?.size;
                      return acc + (processedSize || f.file.size);
                    }, 0))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Saved</p>
                  <p className="text-xl font-mono text-success">
                    {(() => {
                      const orig = files.reduce((acc, f) => acc + f.file.size, 0);
                      const final = files.reduce((acc, f) => {
                        const processedSize = f.result?.blob.size ?? (f as any).processedBlob?.size;
                        return acc + (processedSize || f.file.size);
                      }, 0);
                      if (orig === 0) return "0%";
                      const pct = ((orig - final) / orig) * 100;
                      return pct > 0 ? `${pct.toFixed(1)}%` : "0%";
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Metadata Removed</p>
                  <p className="text-xl font-mono text-foreground">100%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <motion.div
              key={file.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FileCard 
                file={file} 
                onRemove={onRemove} 
                onInspect={onInspect} 
                onDownload={onDownload} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
