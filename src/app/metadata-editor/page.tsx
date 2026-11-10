"use client";

import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { UniversalUploader } from "@/components/universal-uploader";
import { downloadBlob } from "@/lib/download";
import { MAX_SERVER_IMAGE_UPLOAD_BYTES } from "@/lib/constants";
import { getMediaType } from "@/lib/media-types";
import type { MediaFile } from "@/lib/types";
import { extractUnifiedMetadata } from "@/lib/unified-processor";
import { generateId } from "@/lib/utils";
import { RefreshCw, Save } from "lucide-react";
import { useCallback, useState } from "react";

export default function MetadataEditorPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [copyright, setCopyright] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const { toast } = useToast();

  const handleFilesAdded = useCallback(
    async (newFiles: File[]) => {
      const mediaFiles = await Promise.all(
        newFiles.map(async (file) => {
          const preview = file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null;
          const metadata = await extractUnifiedMetadata(file);

          return {
            id: generateId(),
            file,
            mediaType: getMediaType(file) || ("image" as const),
            preview,
            status: "done" as const,
            progress: 100,
            result: null,
            metadataBefore: metadata,
          };
        }),
      );

      setFiles((prev) => {
        const updated = [...prev, ...mediaFiles];
        if (!activeFileId && updated.length > 0) {
          setActiveFileId(updated[0].id);
          // Pre-fill fields from original if found
          const first = updated[0];
          const existingAuthor =
            first.metadataBefore.find(
              (f) =>
                f.key.toLowerCase().includes("author") ||
                f.key.toLowerCase().includes("artist"),
            )?.value || "";
          const existingTitle =
            first.metadataBefore.find((f) =>
              f.key.toLowerCase().includes("title"),
            )?.value || "";
          const existingCopy =
            first.metadataBefore.find((f) =>
              f.key.toLowerCase().includes("copyright"),
            )?.value || "";
          const existingDesc =
            first.metadataBefore.find((f) =>
              f.key.toLowerCase().includes("description"),
            )?.value || "";

          setAuthor(existingAuthor);
          setTitle(existingTitle);
          setCopyright(existingCopy);
          setDescription(existingDesc);
        }
        return updated;
      });
    },
    [activeFileId],
  );

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleRemove = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== id);
        if (activeFileId === id) {
          setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
    },
    [activeFileId],
  );

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setActiveFileId(null);
  }, []);

  const handleApplyAndDownload = async () => {
    if (!activeFile) return;

    setIsSaving(true);
    try {
      if (activeFile.mediaType !== "image") {
      throw new Error("Metadata editing is currently supported for images only.");
      }
      if (activeFile.file.size > MAX_SERVER_IMAGE_UPLOAD_BYTES) {
      throw new Error("Metadata editing supports images up to 4 MB on this deployment.");
      }
      // Send to server-side sharp with clean-branding and custom fields
        const formData = new FormData();
      formData.append("file", activeFile.file);
      formData.append("privacyMode", "clean-branding");
        const inputExtension = activeFile.file.name.split(".").pop()?.toLowerCase() || "";
        const outputFormat = ["png", "webp"].includes(inputExtension) ? inputExtension : "jpeg";
      formData.append("format", outputFormat);
      formData.append("author", author);
      formData.append("title", title);
      formData.append("keywords", keywords);
      formData.append("copyright", copyright);
      formData.append("description", description);
      formData.append("software", "ZeroMeta Privacy Studio");

        const resp = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
      });

        if (!resp.ok) {
          const error = await resp.json().catch(() => ({}));
          throw new Error(error.error || "Failed to process image metadata.");
      }

        const blob = await resp.blob();
        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
      downloadBlob(
          blob,
          `${activeFile.file.name.replace(/\.[^.]+$/, "")}_edited.${ext}`,
      );

      toast({
          title: "Metadata Updated",
          description: "Downloaded sanitized file with custom tags.",
          variant: "success",
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description:
          err instanceof Error ? err.message : "Failed to update metadata.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolShell
      title="Safe Metadata Editor"
      badge="Tag Customizer"
      description="Remove source image metadata and write selected authorship, copyright, title, and description fields to a new image."
      breadcrumbs={[{ label: "Metadata Editor" }]}
      howItWorks={[
        {
          step: "01",
          title: "Select File",
          desc: "Upload an image whose public copyright or authorship tags you wish to update.",
        },
        {
          step: "02",
          title: "Configure Safe Tags",
          desc: "Enter your desired Author, Creator, Copyright notice, and Title.",
        },
        {
          step: "03",
          title: "Export Sanitized File",
          desc: "ZeroMeta removes source metadata during re-encoding, then writes the selected EXIF fields and its software tag.",
        },
      ]}
      supportedFormats={[
        {
          format: "JPEG / PNG / WebP / GIF / TIFF",
          extension: ".jpg, .jpeg, .png, .webp, .gif, .tif, .tiff",
          capabilities: "EXIF Artist, Copyright, ImageDescription, Software, Title, and Keywords",
          notes: "Source metadata is stripped; selected EXIF fields are written to the output.",
        },
      ]}
      privacyNotes={[
        "Source EXIF, XMP, and IPTC metadata are not preserved; selected EXIF fields and the ZeroMeta software tag are written.",
        "GPS coordinates and camera serial numbers from the source are not copied to the output image.",
      ]}
      limitations={[
        "Metadata editing currently supports raster images only; PDF and audio metadata editing is not available in this tool.",
        "Some output formats do not support every EXIF tag, so tag availability varies by format.",
      ]}
      faqs={[
        {
          q: "Why edit metadata instead of just removing it?",
          a: "Photographers, artists, and creators often want to remove their physical location and home device serials while preserving their copyright and artist credit.",
        },
      ]}
    >
      <div className="space-y-6">
        <p className="text-xs text-muted-foreground">
          This editor accepts images up to 4 MB on this deployment. Use the main tool's Fast mode for larger images.
        </p>
        <UniversalUploader
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemove={handleRemove}
          onClearAll={handleClearAll}
          allowedType="image"
        />

        {files.length > 0 && activeFile && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* File Switcher */}
            {files.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {files.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFileId(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                      activeFile.id === f.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {f.file.name}
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-card border border-border">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-xs font-semibold">
                    Author / Creator Name
                  </Label>
                  <Input
                    id="author"
                    placeholder="e.g. Jane Doe"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Sets the EXIF Artist tag.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Work Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Sunset in Nature"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="copyright" className="text-xs font-semibold">
                    Copyright Notice
                  </Label>
                  <Input
                    id="copyright"
                    placeholder={`e.g. © ${new Date().getFullYear()} Jane Doe. All rights reserved.`}
                    value={copyright}
                    onChange={(e) => setCopyright(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-semibold"
                  >
                    Image Description / Caption
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g. Landscape photograph captured outdoors"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="keywords" className="text-xs font-semibold">
                    Keywords / Tags (Comma separated)
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="e.g. photography, landscape, nature"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button
                    onClick={handleApplyAndDownload}
                    disabled={isSaving}
                    className="btn-primary gap-2 h-10 px-5 text-xs font-semibold w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving Tags...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Apply Tags & Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
