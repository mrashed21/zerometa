/**
 * PDF metadata inspection and sanitization.
 *
 * Rewrites PDFs through pdf-lib instead of editing raw PDF bytes with regular
 * expressions. Rewriting regenerates cross-reference data and avoids shifting
 * existing byte offsets when metadata references are removed.
 */

import { PDFDocument, PDFName } from "pdf-lib";
import type { MetadataField } from "./types";

const INFO_FIELDS = [
  { key: "Title", label: "Title", category: "other" as const },
  { key: "Author", label: "Author / Creator", category: "camera" as const },
  { key: "Subject", label: "Subject", category: "other" as const },
  { key: "Keywords", label: "Keywords", category: "other" as const },
  { key: "Creator", label: "Creating Application", category: "software" as const },
  { key: "Producer", label: "PDF Producer", category: "software" as const },
  { key: "CreationDate", label: "Creation Date", category: "location" as const },
  { key: "ModDate", label: "Modification Date", category: "location" as const },
];

/**
 * Read the standard document information dictionary and catalog XMP marker.
 * This is a parser-backed inspection, not a byte-string search.
 */
export async function extractPdfMetadata(file: File): Promise<MetadataField[]> {
  const fields: MetadataField[] = [
    { key: "File Name", value: file.name, category: "other", stripped: false },
    {
      key: "File Size",
      value: `${(file.size / 1024).toFixed(1)} KB`,
      category: "other",
      stripped: false,
    },
    { key: "Format", value: "PDF Document", category: "other", stripped: false },
    {
      key: "Last Modified",
      value: new Date(file.lastModified).toLocaleString(),
      category: "other",
      stripped: false,
    },
  ];

  const pdf = await PDFDocument.load(await file.arrayBuffer(), {
    updateMetadata: false,
    throwOnInvalidObject: true,
  });

  for (const item of INFO_FIELDS) {
    const value = readInfoField(pdf, item.key);
    if (value) {
      fields.push({
        key: item.label,
        value,
        category: item.category,
        stripped: false,
      });
    }
  }

  if (pdf.catalog.has(PDFName.of("Metadata"))) {
    fields.push({
      key: "XMP Metadata Stream",
      value: "Catalog metadata stream detected",
      category: "ai",
      stripped: false,
    });
  }

  fields.push({
    key: "Pages",
    value: String(pdf.getPageCount()),
    category: "other",
    stripped: false,
  });

  return fields;
}

/**
 * Remove the document Info dictionary and catalog-level XMP metadata, then
 * serialize a fresh PDF so xref offsets are generated for the rewritten file.
 *
 * The result deliberately reports only these two metadata locations as
 * removed. It does not claim that every possible metadata-bearing structure
 * (for example annotations, attachments, embedded files, or custom streams)
 * has been removed.
 */
export async function sanitizePdfMetadata(file: File): Promise<{
  blob: Blob;
  metadataAfter: MetadataField[];
  cleanedKeys: string[];
}> {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), {
    updateMetadata: false,
    throwOnInvalidObject: true,
  });

  const cleanedKeys = INFO_FIELDS
    .filter((item) => Boolean(readInfoField(pdf, item.key)))
    .map((item) => item.key);

  const hasXmp = pdf.catalog.has(PDFName.of("Metadata"));
  if (hasXmp) cleanedKeys.push("XMP Metadata");

  // pdf-lib exposes the Info dictionary as a context trailer entry.
  // Removing the trailer reference is safer than editing the serialized bytes.
  pdf.context.trailerInfo.Info = undefined;

  // XMP is attached through the document catalog's /Metadata entry.
  pdf.catalog.delete(PDFName.of("Metadata"));

  // Prevent pdf-lib from adding a new Producer or ModificationDate on save.
  const bytes = await pdf.save({ useObjectStreams: true });
  const output = await PDFDocument.load(bytes, {
    updateMetadata: false,
    throwOnInvalidObject: true,
  });

  // Independently verify the two metadata locations we promised to strip.
  const remainingInfo = INFO_FIELDS.filter((item) => readInfoField(output, item.key));
  const remainingXmp = output.catalog.has(PDFName.of("Metadata"));
  if (remainingInfo.length > 0 || remainingXmp) {
    throw new Error("PDF metadata verification failed; the output was not marked as sanitized.");
  }

  const cleanedBlob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  const metadataAfter: MetadataField[] = [
    {
      key: "File Name",
      value: file.name,
      category: "other",
      stripped: false,
    },
    {
      key: "File Size",
      value: `${(cleanedBlob.size / 1024).toFixed(1)} KB`,
      category: "other",
      stripped: false,
    },
    {
      key: "Format",
      value: "PDF Document (Rewritten)",
      category: "other",
      stripped: false,
    },
    {
      key: "Document Info Dictionary",
      value: "Removed and verified",
      category: "other",
      stripped: true,
    },
    {
      key: "Catalog XMP Metadata",
      value: hasXmp ? "Removed and verified" : "Not present",
      category: "other",
      stripped: hasXmp,
    },
  ];

  return {
    blob: cleanedBlob,
    metadataAfter,
    cleanedKeys,
  };
}

function readInfoField(
  pdf: PDFDocument,
  key: string,
): string | undefined {
  try {
    switch (key) {
      case "Title":
        return pdf.getTitle();
      case "Author":
        return pdf.getAuthor();
      case "Subject":
        return pdf.getSubject();
      case "Keywords": {
        const value = pdf.getKeywords();
        return value?.length ? value : undefined;
      }
      case "Creator":
        return pdf.getCreator();
      case "Producer":
        return pdf.getProducer();
      case "CreationDate":
        return pdf.getCreationDate()?.toISOString();
      case "ModDate":
        return pdf.getModificationDate()?.toISOString();
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}
