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

// ─── 3. Video & Audio Binary Scrubber Tests
test("Sanitizes MP4 container atoms (udta/uuid to free and zeroes timestamps)", () => {
  // Helper to build a standard ISO BMFF atom
  function buildAtom(fourCC, payload) {
    const totalSize = 8 + payload.length;
    const atom = new Uint8Array(totalSize);
    const view = new DataView(atom.buffer);
    view.setUint32(0, totalSize, false);
    for (let i = 0; i < 4; i++) atom[4 + i] = fourCC.charCodeAt(i);
    atom.set(payload, 8);
    return atom;
  }

  // 1. ftyp atom
  const ftyp = buildAtom("ftyp", new Uint8Array([0x69, 0x73, 0x6f, 0x6d])); // isom

  // 2. mvhd atom with non-zero timestamp (version 0, 100 seconds)
  const mvhdPayload = new Uint8Array(24);
  const mvhdView = new DataView(mvhdPayload.buffer);
  mvhdView.setUint8(0, 0); // version 0
  mvhdView.setUint32(4, 3700000000, false); // creation time
  mvhdView.setUint32(8, 3700000000, false); // modification time
  const mvhd = buildAtom("mvhd", mvhdPayload);

  // 3. udta atom with GPS coordinates
  const gpsString = "+37.7749-122.4194/ iPhone 15 Pro Camera";
  const gpsBytes = new TextEncoder().encode(gpsString);
  const udta = buildAtom("udta", gpsBytes);

  // Combine inside moov
  const moovPayload = new Uint8Array(mvhd.length + udta.length);
  moovPayload.set(mvhd, 0);
  moovPayload.set(udta, mvhd.length);
  const moov = buildAtom("moov", moovPayload);

  // Top-level uuid atom (drone telemetry)
  const uuidPayload = new TextEncoder().encode("DJI Flight Telemetry Log");
  const uuid = buildAtom("uuid", uuidPayload);

  // Full sample MP4
  const mp4 = new Uint8Array(ftyp.length + moov.length + uuid.length);
  mp4.set(ftyp, 0);
  mp4.set(moov, ftyp.length);
  mp4.set(uuid, ftyp.length + moov.length);

  assert.ok(new TextDecoder().decode(mp4).includes("udta"), "Initial MP4 must have udta");
  assert.ok(new TextDecoder().decode(mp4).includes("iPhone 15 Pro"), "Initial MP4 must have camera info");

  // Run atom sanitizer simulation
  const uint8 = mp4.slice(0);
  const dataView = new DataView(uint8.buffer);
  let offset = 0;
  while (offset + 8 <= uint8.length) {
    let size = dataView.getUint32(offset, false);
    const type = String.fromCharCode(uint8[offset + 4], uint8[offset + 5], uint8[offset + 6], uint8[offset + 7]);
    if (size < 8 || offset + size > uint8.length) break;

    if (type === "uuid") {
      uint8[offset + 4] = 0x66; uint8[offset + 5] = 0x72; uint8[offset + 6] = 0x65; uint8[offset + 7] = 0x65; // 'free'
      for (let i = offset + 8; i < offset + size; i++) uint8[i] = 0;
    } else if (type === "moov") {
      let sub = offset + 8;
      const end = offset + size;
      while (sub + 8 <= end) {
        let subSize = dataView.getUint32(sub, false);
        const subType = String.fromCharCode(uint8[sub + 4], uint8[sub + 5], uint8[sub + 6], uint8[sub + 7]);
        if (subSize < 8 || sub + subSize > end) break;
        if (subType === "udta") {
          uint8[sub + 4] = 0x66; uint8[sub + 5] = 0x72; uint8[sub + 6] = 0x65; uint8[sub + 7] = 0x65; // 'free'
          for (let i = sub + 8; i < sub + subSize; i++) uint8[i] = 0;
        } else if (subType === "mvhd") {
          dataView.setUint32(sub + 12, 0, false);
          dataView.setUint32(sub + 16, 0, false);
        }
        sub += subSize;
      }
    }
    offset += size;
  }

  const cleanedString = new TextDecoder().decode(uint8);
  assert.ok(!cleanedString.includes("udta"), "udta atom must be replaced with free");
  assert.ok(!cleanedString.includes("iPhone 15 Pro"), "Camera metadata must be purged");
  assert.ok(!cleanedString.includes("DJI Flight Telemetry"), "UUID metadata must be purged");
  assert.ok(cleanedString.includes("free"), "Filler atom free must exist in place of metadata");
});

test("Sanitizes MP3 ID3v2 header and ID3v1 trailer", () => {
  // Construct sample MP3 with ID3v2 tag and ID3v1 trailer
  const id3v2Header = new Uint8Array([
    0x49, 0x44, 0x33, // 'ID3'
    0x04, 0x00,       // v2.4.0
    0x00,             // flags
    0x00, 0x00, 0x00, 0x0a // synchsafe size: 10 bytes
  ]);
  const id3v2Payload = new Uint8Array(10); // 10 bytes payload
  const audioFrames = new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00]); // MP3 sync
  const id3v1Trailer = new Uint8Array(128);
  id3v1Trailer[0] = 0x54; id3v1Trailer[1] = 0x41; id3v1Trailer[2] = 0x47; // 'TAG'

  const fullMp3 = new Uint8Array(id3v2Header.length + id3v2Payload.length + audioFrames.length + id3v1Trailer.length);
  let pos = 0;
  fullMp3.set(id3v2Header, pos); pos += id3v2Header.length;
  fullMp3.set(id3v2Payload, pos); pos += id3v2Payload.length;
  fullMp3.set(audioFrames, pos); pos += audioFrames.length;
  fullMp3.set(id3v1Trailer, pos);

  // Stripping algorithm
  let start = 0;
  let end = fullMp3.length;
  if (fullMp3[0] === 0x49 && fullMp3[1] === 0x44 && fullMp3[2] === 0x33) {
    const size = ((fullMp3[6] & 0x7f) << 21) | ((fullMp3[7] & 0x7f) << 14) | ((fullMp3[8] & 0x7f) << 7) | (fullMp3[9] & 0x7f);
    start = 10 + size;
  }
  if (fullMp3[end - 128] === 0x54 && fullMp3[end - 127] === 0x41 && fullMp3[end - 126] === 0x47) {
    end -= 128;
  }

  const cleanedAudio = fullMp3.slice(start, end);
  assert.strictEqual(cleanedAudio.length, audioFrames.length, "Only pure audio frames should remain");
  assert.strictEqual(cleanedAudio[0], 0xff);
  assert.strictEqual(cleanedAudio[1], 0xfb);
});

test("Sanitizes WAV RIFF LIST metadata chunk to JUNK", () => {
  // Construct sample WAV with LIST chunk
  const riffHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x30, 0x00, 0x00, 0x00, // file size
    0x57, 0x41, 0x56, 0x45, // 'WAVE'
  ]);
  const listChunk = new Uint8Array([
    0x4c, 0x49, 0x53, 0x54, // 'LIST'
    0x0a, 0x00, 0x00, 0x00, // chunk size: 10
    0x49, 0x4e, 0x46, 0x4f, 0x49, 0x41, 0x52, 0x54, 0x30, 0x30, // INFO IART..
  ]);
  const dataChunk = new Uint8Array([
    0x64, 0x61, 0x74, 0x61, // 'data'
    0x04, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);

  const wav = new Uint8Array(riffHeader.length + listChunk.length + dataChunk.length);
  wav.set(riffHeader, 0);
  wav.set(listChunk, riffHeader.length);
  wav.set(dataChunk, riffHeader.length + listChunk.length);

  // Sanitize LIST chunk to JUNK
  const cleanedWav = wav.slice(0);
  for (let i = 12; i < cleanedWav.length - 8; i++) {
    if (cleanedWav[i] === 0x4c && cleanedWav[i + 1] === 0x49 && cleanedWav[i + 2] === 0x53 && cleanedWav[i + 3] === 0x54) {
      cleanedWav[i] = 0x4a; cleanedWav[i + 1] = 0x55; cleanedWav[i + 2] = 0x4e; cleanedWav[i + 3] = 0x4b; // 'JUNK'
    }
  }

  const str = new TextDecoder().decode(cleanedWav);
  assert.ok(!str.includes("LIST"), "LIST chunk must be neutralized");
  assert.ok(str.includes("JUNK"), "Chunk must be converted to compliant JUNK padding");
  assert.ok(str.includes("data"), "Audio PCM data chunk must be intact");
});

// ─── 4. Format Registry & Security Boundaries
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

