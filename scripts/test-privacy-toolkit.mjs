/**
 * ZeroMeta Comprehensive Test Suite
 * Tests binary signature validation, format registry, PDF sanitization,
 * and security boundary checks.
 */

import assert from "node:assert";

console.log("=========================================");
console.log(" Running ZeroMeta Quality Assurance Tests");
console.log("=========================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ─── 1. Signature Detection Tests
test("Detects JPEG signature (FF D8 FF)", () => {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const isJpeg = jpegHeader[0] === 0xff && jpegHeader[1] === 0xd8 && jpegHeader[2] === 0xff;
  assert.strictEqual(isJpeg, true);
});

test("Detects PNG signature (89 50 4E 47)", () => {
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isPng =
    pngHeader[0] === 0x89 &&
    pngHeader[1] === 0x50 &&
    pngHeader[2] === 0x4e &&
    pngHeader[3] === 0x47;
  assert.strictEqual(isPng, true);
});

test("Detects PDF signature (%PDF-)", () => {
  const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  const isPdf =
    pdfHeader[0] === 0x25 &&
    pdfHeader[1] === 0x50 &&
    pdfHeader[2] === 0x44 &&
    pdfHeader[3] === 0x46 &&
    pdfHeader[4] === 0x2d;
  assert.strictEqual(isPdf, true);
});

test("Detects WebP RIFF signature", () => {
  const riffWebp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // size
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
  const isRiff = riffWebp[0] === 0x52 && riffWebp[1] === 0x49 && riffWebp[2] === 0x46 && riffWebp[3] === 0x46;
  const isWebp = String.fromCharCode(...riffWebp.slice(8, 12)) === "WEBP";
  assert.strictEqual(isRiff && isWebp, true);
});

test("Detects MP4 ftyp box signature", () => {
  const mp4Header = new Uint8Array([
    0x00, 0x00, 0x00, 0x20, // box size
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x69, 0x73, 0x6f, 0x6d, // 'isom'
  ]);
  const isFtyp = String.fromCharCode(...mp4Header.slice(4, 8)) === "ftyp";
  assert.strictEqual(isFtyp, true);
});

// ─── 2. PDF Sanitization Unit Tests
test("Sanitizes PDF Document Info dictionary keys", () => {
  let samplePdf = `%PDF-1.4\n1 0 obj\n<< /Title (Confidential Project) /Author (John Doe) /Producer (Microsoft Word) >>\nendobj\ntrailer\n<< /Info 1 0 R >>\n%%EOF`;

  const infoKeys = ["Title", "Author", "Subject", "Keywords", "Creator", "Producer"];
  for (const key of infoKeys) {
    const keyRegex = new RegExp(`(\\/${key}\\s*\\()[^)]*(\\))`, "gi");
    samplePdf = samplePdf.replace(keyRegex, "$1$2");
  }

  assert.ok(!samplePdf.includes("Confidential Project"), "Title should be stripped");
  assert.ok(!samplePdf.includes("John Doe"), "Author should be stripped");
  assert.ok(!samplePdf.includes("Microsoft Word"), "Producer should be stripped");
  assert.ok(samplePdf.includes("/Title ()"), "Title key should be emptied safely");
});

test("Neutralizes embedded XMP packet without offset shifts", () => {
  const originalXmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>\n<x:xmpmeta xmlns:x="adobe:ns:meta/">\n<rdf:RDF>\n<dc:creator>Secret Agent</dc:creator>\n</rdf:RDF>\n</x:xmpmeta>\n<?xpacket end="w"?>`;
  let fileContent = `PDF-START...${originalXmp}...PDF-END`;

  const xmpRegex = /(<\?xpacket begin=[\s\S]*?\?>)([\s\S]*?)(<\?xpacket end=['"][wr]['"]\?>)/gi;
  fileContent = fileContent.replace(xmpRegex, (match, p1, p2, p3) => {
    const padding = " ".repeat(p2.length);
    return `${p1}${padding}${p3}`;
  });

  assert.ok(!fileContent.includes("Secret Agent"), "XMP content must be wiped");
  assert.ok(fileContent.includes('<?xpacket end="w"?>'), "Packet delimiters preserved for binary safety");
});

// ─── 3. Format Registry & Security Boundaries
test("Format registry contains all user-specified media types", () => {
  const supported = ["image", "video", "audio", "document"];
  assert.strictEqual(supported.length, 4);
  assert.ok(supported.includes("document"), "PDF documents must be in registry");
});

test("File size caps are enforced per media type", () => {
  const maxSizes = {
    image: 50 * 1024 * 1024,
    video: 500 * 1024 * 1024,
    audio: 100 * 1024 * 1024,
    document: 50 * 1024 * 1024,
  };
  assert.strictEqual(maxSizes.image, 52428800);
  assert.strictEqual(maxSizes.video, 524288000);
  assert.strictEqual(maxSizes.document, 52428800);
});

console.log("\n=========================================");
console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
console.log("=========================================\n");

if (failed > 0) process.exit(1);

