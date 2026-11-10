"use client";

import { Button } from "@/components/ui/button";
import { EmptyQueue } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { ALL_SUPPORTED_TYPES } from "@/lib/media-types";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateBatch } from "@/lib/validators";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UniversalUploaderProps {
  files: MediaFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  onClearAll: () => void;
  onFileEdit?: (id: string) => void;
  disabled?: boolean;
  allowedType?: "image" | "video" | "audio" | "document" | "all";
}

export function UniversalUploader({
  files,
  onFilesAdded,
  onFileRemove,
  onClearAll,
  onFileEdit,
  disabled = false,
  allowedType = "all",
}: UniversalUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: "Invalid files detected",
          description: `Some files could not be accepted. Supported: JPG, PNG, WebP, GIF, TIFF, MP4, MOV, WebM, MKV, MP3, WAV, FLAC, M4A, OGG, PDF.`,
          variant: "error",
        });
      }

      if (acceptedFiles.length === 0) return;

      const { valid, errors } = validateBatch(acceptedFiles, files);

      errors.forEach(({ file, error }) => {
        toast({
          title:
            error.code === "UNSUPPORTED_FILE" &&
            error.message.includes("already in the queue")
              ? "Duplicate file"
              : "Upload failed",
          description: error.message,
          variant: "error",
        });
      });

      if (valid.length > 0) {
        onFilesAdded(valid);
        toast({
          title: "Files added",
          description: `Successfully queued ${valid.length} file${valid.length > 1 ? "s" : ""}.`,
          variant: "success",
        });
      }
    },
    [files, onFilesAdded, toast],
  );

  const filteredTypes =
    allowedType === "all"
      ? ALL_SUPPORTED_TYPES
      : ALL_SUPPORTED_TYPES.filter((type) => type.mediaType === allowedType);

  const acceptRegistry = filteredTypes.reduce(
    (acc, curr) => {
      if (!acc[curr.mime]) {
        acc[curr.mime] = [];
      }
      acc[curr.mime].push(...curr.extensions);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: acceptRegistry,
      disabled,
      multiple: true,
      noClick: files.length > 0,
    });

  return (
    <div className="space-y-6">
      {/* ─── Dropzone Area  */}
      <motion.div
        whileHover={
          !disabled && files.length === 0 ? { scale: 1.005 } : undefined
        }
        whileTap={
          !disabled && files.length === 0 ? { scale: 0.995 } : undefined
        }
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative transition-all duration-300 group overflow-hidden",
            files.length === 0
              ? "p-8 sm:p-16 text-center cursor-pointer"
              : "p-4 sm:p-6 rounded-2xl",
            isDragActive && !isDragReject && "dropzone-active scale-[1.01]",
            isDragReject &&
              "border-destructive border-dashed bg-destructive/10 rounded-2xl",
            !isDragActive && !isDragReject && "dropzone",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />

          {/* Background effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500",
              isDragActive && "opacity-100",
            )}
          >
            <div className="absolute inset-0 bg-[rgba(228,199,170,0.02)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {files.length === 0 ? (
              <AnimatePresence mode="wait">
                {isDragActive && !isDragReject ? (
                  <motion.div
                    key="drag-active"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shadow-lg">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-brand">
                      Drop to queue files
                    </p>
                  </motion.div>
                ) : isDragReject ? (
                  <motion.div
                    key="drag-reject"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive">
                      <X className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-destructive">
                      Unsupported file type
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="drag-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <EmptyQueue />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {isDragActive ? "Drop files here" : "Add more files"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images (50MB), Videos (500MB), Audio (100MB), PDFs (50MB)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={open}
                    disabled={disabled}
                  >
                    Browse Files
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={disabled || files.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
