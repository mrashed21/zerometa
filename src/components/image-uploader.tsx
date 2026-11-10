/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from "@/lib/constants";
import type { ImageFile } from "@/lib/types";
import { cn, formatFileSize } from "@/lib/utils";
import { Edit2, FileImage, ImagePlus, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  files: ImageFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  onFileEdit?: (id: string) => void;
  disabled?: boolean;
}

export function ImageUploader({
  files,
  onFilesAdded,
  onFileRemove,
  onFileEdit,
  disabled = false,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: SUPPORTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      disabled,
      multiple: true,
    });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        whileHover={!disabled ? { scale: 1.005 } : undefined}
        whileTap={!disabled ? { scale: 0.995 } : undefined}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 group overflow-hidden",
            isDragActive &&
              !isDragReject &&
              "border-foreground bg-muted scale-[1.01]",
            isDragReject && "border-destructive bg-destructive/10",
            !isDragActive &&
              !isDragReject &&
              "border-border hover:border-zinc-500 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />

          {/* Background glow effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500",
              isDragActive && "opacity-100",
            )}
          >
            <div className="absolute inset-0 bg-muted/20" />
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isDragActive && !isDragReject ? (
                <motion.div
                  key="drag-active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Drop to upload
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
                  <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
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
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">
                      Drop images here or{" "}
                      <span className="text-zinc-500 font-semibold cursor-pointer underline">
                        browse
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      JPG, PNG, WebP, TIFF • Max 50MB per file
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* File Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {files.map((imageFile, index) => (
              <motion.div
                key={imageFile.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 aspect-square"
              >
                <img
                  src={imageFile.preview}
                  alt={imageFile.file.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white truncate">
                      {imageFile.file.name}
                    </p>
                    <p className="text-[10px] text-neutral-300">
                      {formatFileSize(imageFile.file.size)}
                    </p>
                  </div>
                </div>

                {/* Edit & Remove buttons */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-white text-neutral-700 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFileEdit) onFileEdit(imageFile.id);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-red-600 hover:text-white text-neutral-700 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(imageFile.id);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Status indicator */}
                {imageFile.status === "processing" && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {imageFile.status === "done" && (
                  <div className="absolute top-1 left-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <FileImage className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
