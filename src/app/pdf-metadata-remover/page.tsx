"use client";

import { useState, useCallback } from "react";
import { ToolShell } from "@/components/tool-shell";
import { UniversalUploader } from "@/components/universal-uploader";
import { FileQueue } from "@/components/file-queue";
import { extractPdfMetadata, sanitizePdfMetadata } from "@/lib/pdf-processor";
import { generateId } from "@/lib/utils";
import { downloadAsZip, downloadBlob } from "@/lib/download";
import type { MediaFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Download, Play, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function PdfMetadataRemoverPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((f) => f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf");

    if (pdfFiles.length < newFiles.length) {
      toast({
        title: "Non-PDF Files Ignored",
        description: "Please upload PDF documents to this specialized cleaner.",
        variant: "error",
      });
    }

    const mediaFiles = await Promise.all(
      pdfFiles.map(async (file) => {
        const metadata = await extractPdfMetadata(file);

        return {
          id: generateId(),
          file,
          mediaType: "document" as const,
          preview: null,
          status: "queued" as const,
          progress: 0,
          result: null,
          metadataBefore: metadata,
        };
      })
    );

    setFiles((prev) => [...prev, ...mediaFiles]);
  }, [toast]);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDownloadSingle = useCallback((id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.result?.blob) {
      downloadBlob(target.result.blob, target.result.filename);
    }
  }, [files]);

  const handleProcessAll = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued" || f.status === "error");
    if (queuedFiles.length === 0) return;

    setIsProcessing(true);

    for (const item of queuedFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing", progress: 30 } : f))
      );

      try {
        const { blob, metadataAfter } = await sanitizePdfMetadata(item.file);
        const filename = item.file.name.replace(/\.[^.]+$/, "_cleaned.pdf");

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "done",
                  progress: 100,
                  result: {
                    blob,
                    mimeType: "application/pdf",
                    filename,
                    metadataAfter,
                    stats: {
                      fieldsFound: item.metadataBefore.length,
                      fieldsRemoved: Math.max(0, item.metadataBefore.length - metadataAfter.length),
                      originalSize: item.file.size,
                      processedSize: blob.size,
                      savedBytes: Math.max(0, item.file.size - blob.size),
                      savedPercent: Math.round(((item.file.size - blob.size) / item.file.size) * 100),
                    },
                  },
                }
              : f
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error",
                  error: "Failed to sanitize PDF",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    toast({
      title: "PDF Sanitized",
      description: "Document properties have been cleared.",
      variant: "success",
    });
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    const result = await downloadAsZip(files, "zerometa-sanitized-pdfs");
    setIsZipping(false);
    if (result.success) {
      toast({
        title: "Archive Ready",
        description: `Exported ${result.fileCount} clean PDFs.`,
        variant: "success",
      });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const queuedCount = files.filter((f) => f.status === "queued" || f.status === "error").length;

  return (
    <ToolShell
      title="PDF Metadata Cleaner & Sanitizer"
      badge="Client-Side PDF Clean"
      description="Inspect and sanitize PDF Document Information Dictionaries (/Title, /Author, /Subject, /Keywords, /Creator, /Producer) and embedded XMP metadata streams."
      breadcrumbs={[{ label: "PDF Metadata Cleaner" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select PDF Document",
          desc: "Upload contracts, invoices, resumes, or reports directly in your browser.",
        },
        {
          step: "02",
          title: "Dictionary Sanitization",
          desc: "Our client-side parser identifies the Info Dictionary and XMP packets, purging author names and modification dates.",
        },
        {
          step: "03",
          title: "Save Clean Document",
          desc: "Download sanitized PDFs with text, vectors, layouts, and embedded images intact.",
        },
      ]}
      supportedFormats={[
        {
          format: "PDF (All Versions 1.0 – 2.0)",
          extension: ".pdf",
          capabilities: "Standard Document Info dictionary (/Title, /Author, /Creator, /Producer, /CreationDate), XMP package",
          notes: "Safely preserves vector paths, embedded fonts, and page layouts.",
        },
      ]}
      privacyNotes={[
        "Runs 100% inside your browser memory.",
        "Your sensitive business contracts, financial reports, or personal resumes are NEVER transmitted to external servers.",
      ]}
      limitations={[
        "Important PDF Security Note: Metadata removal sanitizes document properties and XMP streams only.",
        "It does NOT guarantee removal of all hidden PDF content, visual redactions covered with black boxes, embedded attachment files, digital form fields, or deep incremental revision history.",
      ]}
      faqs={[
        {
          q: "What metadata is typically embedded in PDFs?",
          a: "PDFs frequently store the full name of the author, computer username, original software used (Microsoft Word, Canva, InDesign, Google Docs), operating system, and exact creation and modification timestamps.",
        },
        {
          q: "Will this affect my PDF text formatting or signatures?",
          a: "No. The document's visual layout, fonts, and page contents are preserved intact. Note that if a PDF contains cryptographic digital signatures, modifying headers will invalidate the signature hash, requiring re-signing.",
        },
      ]}
    >
      <div className="space-y-6">
        {/* Important Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              Document Privacy Disclaimer
            </span>
            <p className="text-muted-foreground leading-relaxed">
              This tool sanitizes standard document properties (/Title, /Author, /Subject, /Keywords, /Creator, /Producer, /CreationDate, /ModDate) and embedded XMP metadata streams.
              <strong> Removing metadata does not guarantee removal of hidden PDF content, annotations, embedded attachment files, or underlying incremental revision history.</strong>
            </p>
          </div>
        </div>

        <UniversalUploader
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemove={handleRemove}
          onClearAll={handleClearAll}
          disabled={isProcessing}
          allowedType="document"
        />

        {files.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{files.length}</span> PDF document{files.length > 1 ? "s" : ""} •{" "}
                <span className="font-semibold text-emerald-400">{doneCount}</span> sanitized
              </div>

              <div className="flex items-center gap-3">
                {queuedCount > 0 && (
                  <Button
                    onClick={handleProcessAll}
                    disabled={isProcessing}
                    className="btn-primary gap-2 h-9 text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sanitizing PDF...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Clean All Documents ({queuedCount})
                      </>
                    )}
                  </Button>
                )}

                {doneCount > 0 && (
                  <Button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    variant="outline"
                    className="gap-2 h-9 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    {isZipping ? "Packaging..." : `Download Clean PDFs (${doneCount})`}
                  </Button>
                )}
              </div>
            </div>

            <FileQueue
              files={files as any}
              onRemove={handleRemove}
              onInspect={() => {}}
              onDownload={handleDownloadSingle}
            />
          </div>
        )}
      </div>
    </ToolShell>
  );
}

