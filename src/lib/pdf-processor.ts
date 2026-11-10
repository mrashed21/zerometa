/**
 * Client-Side PDF Metadata Inspector & Sanitizer
 * Safely inspects and neutralizes standard PDF Document Information Dictionaries
 * and XMP metadata streams without altering page streams or visual layout.
 */

import type { MetadataField } from "./types";

export interface PdfInspectionResult {
  fields: MetadataField[];
  hasXmp: boolean;
  hasInfoDict: boolean;
  pageCountEstimate?: number;
}

/**
 * Extracts metadata fields from a PDF file buffer.
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

  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("latin1");
    const content = decoder.decode(buffer);

    // 1. Estimate page count from /Type /Page (excluding Pages)
    const pageMatches = content.match(/\/Type\s*\/Page\b/g);
    if (pageMatches) {
      fields.push({
        key: "Estimated Pages",
        value: String(pageMatches.length),
        category: "other",
        stripped: false,
      });
    }

    // 2. Extract Document Info Dictionary entries
    const infoKeys = [
      { pdfKey: "Title", label: "Title", category: "other" as const },
      { pdfKey: "Author", label: "Author / Creator", category: "camera" as const },
      { pdfKey: "Subject", label: "Subject", category: "other" as const },
      { pdfKey: "Keywords", label: "Keywords", category: "other" as const },
      { pdfKey: "Creator", label: "Creating Application", category: "software" as const },
      { pdfKey: "Producer", label: "PDF Producer", category: "software" as const },
      { pdfKey: "CreationDate", label: "Creation Date", category: "location" as const },
      { pdfKey: "ModDate", label: "Modification Date", category: "location" as const },
    ];

    for (const item of infoKeys) {
      // Matches /Key (value) or /Key <hex>
      const regex = new RegExp(`\\/${item.pdfKey}\\s*\\(([^)]*)\\)`, "i");
      const match = content.match(regex);
      if (match && match[1]?.trim()) {
        fields.push({
          key: item.label,
          value: sanitizePdfString(match[1].trim()),
          category: item.category,
          stripped: false,
        });
      }
    }

    // 3. Inspect XMP packet
    if (content.includes("<x:xmpmeta") || content.includes("<?xpacket")) {
      fields.push({
        key: "XMP Metadata Stream",
        value: "Embedded XML Package Detected",
        category: "ai",
        stripped: false,
      });

      // Quick XMP regex extractors for common fields
      const xmpAuthor = content.match(/<dc:creator>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/i);
      if (xmpAuthor && xmpAuthor[1] && !fields.some((f) => f.key === "Author / Creator")) {
        fields.push({
          key: "Author (XMP)",
          value: xmpAuthor[1].trim(),
          category: "camera",
          stripped: false,
        });
      }

      const xmpProducer = content.match(/<pdf:Producer>([^<]+)<\/pdf:Producer>/i);
      if (xmpProducer && xmpProducer[1] && !fields.some((f) => f.key === "PDF Producer")) {
        fields.push({
          key: "Producer (XMP)",
          value: xmpProducer[1].trim(),
          category: "software",
          stripped: false,
        });
      }
    }
  } catch (err) {
    console.error("PDF metadata extraction error:", err);
  }

  return fields;
}

/**
 * Removes standard Document Info and XMP metadata from a PDF file.
 * Preserves page tree, streams, fonts, and visual content.
 */
export async function sanitizePdfMetadata(file: File): Promise<{
  blob: Blob;
  metadataAfter: MetadataField[];
  cleanedKeys: string[];
}> {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder("latin1");
  let content = decoder.decode(buffer);
  const cleanedKeys: string[] = [];

  // 1. Strip or blank standard Info Dictionary keys
  const infoKeys = [
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
  ];

  for (const key of infoKeys) {
    const keyRegex = new RegExp(`(\\/${key}\\s*\\()[^)]*(\\))`, "gi");
    if (keyRegex.test(content)) {
      cleanedKeys.push(key);
      content = content.replace(keyRegex, "$1$2");
    }
  }

  // 2. Neutralize XMP metadata streams: replace xmp packet contents with spaces of identical length
  // so offsets stay safe
  const xmpRegex = /(<\?xpacket begin=[\s\S]*?\?>)([\s\S]*?)(<\?xpacket end=['"][wr]['"]\?>)/gi;
  if (xmpRegex.test(content)) {
    cleanedKeys.push("XMP Stream");
    content = content.replace(xmpRegex, (match, p1, p2, p3) => {
      const padding = " ".repeat(p2.length);
      return `${p1}${padding}${p3}`;
    });
  }

  // 3. Strip /Metadata object references in catalog if present
  content = content.replace(/\/Metadata\s+\d+\s+\d+\s+R/g, "");

  // Convert back to ArrayBuffer
  const encoder = new Uint8Array(content.length);
  for (let i = 0; i < content.length; i++) {
    encoder[i] = content.charCodeAt(i) & 0xff;
  }

  const cleanedBlob = new Blob([encoder], { type: "application/pdf" });

  const metadataAfter: MetadataField[] = [
    { key: "File Name", value: file.name, category: "other", stripped: false },
    {
      key: "File Size",
      value: `${(cleanedBlob.size / 1024).toFixed(1)} KB`,
      category: "other",
      stripped: false,
    },
    { key: "Format", value: "PDF Document (Cleaned)", category: "other", stripped: false },
    { key: "Document Properties", value: "Sanitized", category: "other", stripped: true },
    { key: "XMP Metadata", value: "Neutralized", category: "other", stripped: true },
  ];

  return {
    blob: cleanedBlob,
    metadataAfter,
    cleanedKeys,
  };
}

function sanitizePdfString(str: string): string {
  // Unescape standard PDF octal or backslash escapes
  return str
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

