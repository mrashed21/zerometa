import assert from "node:assert/strict";
import test from "node:test";

import { detectImageMime, safeOutputFilename } from "../src/app/api/process-image/route.ts";
import { buildMetadataRemovalArgs } from "../src/lib/ffmpeg-processor.ts";

test("image signature detection rejects MIME spoofing", () => {
  assert.equal(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
  assert.equal(
    detectImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "image/png",
  );
  assert.equal(
    detectImageMime(Buffer.from("RIFF0000WEBP", "ascii")),
    "image/webp",
  );
  assert.equal(detectImageMime(Buffer.from([0x49, 0x49, 0x2a, 0x00])), "image/tiff");
  assert.equal(detectImageMime(Buffer.from("GIF89a", "ascii")), "image/gif");
  assert.equal(detectImageMime(Buffer.from("not an image")), null);
});

test("download filenames cannot inject headers or path separators", () => {
  const filename = safeOutputFilename('..\\evil"\r\nX-Test: yes/photo.png', "webp");
  assert.equal(filename, "evil_X-Test_yes_photo_cleaned.webp");
  assert.equal(filename.includes("\r"), false);
  assert.equal(filename.includes("\n"), false);
  assert.equal(filename.includes("/"), false);
});

test("FFmpeg disables global, stream, and chapter metadata mapping", () => {
  const args = buildMetadataRemovalArgs("input.mp4", "output.mp4", false);
  assert.deepEqual(args.slice(2, 8), [
    "-map_metadata", "-1",
    "-map_metadata:s", "-1",
    "-map_chapters", "-1",
  ]);
  assert.equal(args.includes("-c:v"), true);
  assert.equal(args.includes("-c:a"), true);
});

test("audio FFmpeg processing disables video streams", () => {
  const args = buildMetadataRemovalArgs("input.mp3", "output.mp3", true);
  assert.equal(args.includes("-vn"), true);
  assert.equal(args.includes("-c:a"), true);
  assert.equal(args.includes("-c:v"), false);
});
