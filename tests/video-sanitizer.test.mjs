import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeMp4Mov, sanitizeMp3, sanitizeWav } from "../src/lib/ffmpeg-processor.ts";

test("sanitizeMp4Mov neutralizes udta atom into free padding", () => {
  // Construct sample MP4 buffer with ftyp and moov containing udta
  const ftyp = Buffer.from([
    0x00, 0x00, 0x00, 0x14, // 20 bytes
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x69, 0x73, 0x6f, 0x6d, // 'isom'
    0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d,
  ]);

  const udtaPayload = Buffer.from("GPS Coordinates +23.8103+90.4125/ Camera Model");
  const udta = Buffer.alloc(8 + udtaPayload.length);
  udta.writeUInt32BE(8 + udtaPayload.length, 0);
  udta.write("udta", 4, 4, "ascii");
  udtaPayload.copy(udta, 8);

  const mvhd = Buffer.alloc(24);
  mvhd.writeUInt32BE(24, 0);
  mvhd.write("mvhd", 4, 4, "ascii");
  mvhd.writeUInt8(0, 8); // version 0
  mvhd.writeUInt32BE(3500000000, 12); // creation timestamp

  const moov = Buffer.alloc(8 + mvhd.length + udta.length);
  moov.writeUInt32BE(8 + mvhd.length + udta.length, 0);
  moov.write("moov", 4, 4, "ascii");
  mvhd.copy(moov, 8);
  udta.copy(moov, 8 + mvhd.length);

  const sampleMp4 = Buffer.concat([ftyp, moov]);
  const arrayBuffer = sampleMp4.buffer.slice(sampleMp4.byteOffset, sampleMp4.byteOffset + sampleMp4.byteLength);

  const result = sanitizeMp4Mov(arrayBuffer);
  const outBuf = Buffer.from(result.buffer);

  assert.equal(outBuf.includes(Buffer.from("udta")), false, "udta atom must be neutralized");
  assert.equal(outBuf.includes(Buffer.from("free")), true, "free atom must replace udta");
  assert.equal(outBuf.includes(Buffer.from("GPS Coordinates")), false, "GPS coordinates must be purged");
  assert.ok(result.fieldsRemoved >= 3, "Metadata fields must be counted as removed");
});

test("sanitizeMp3 strips ID3v2 header and ID3v1 trailer", () => {
  const id3v2Header = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04]); // 4 bytes payload
  const id3v2Payload = Buffer.from("TAGS");
  const audioPayload = Buffer.from([0xff, 0xfb, 0x90, 0x44, 0x55, 0x66]); // MP3 sync frame
  const id3v1Trailer = Buffer.alloc(128);
  id3v1Trailer.write("TAG", 0, 3, "ascii");

  const mp3Data = Buffer.concat([id3v2Header, id3v2Payload, audioPayload, id3v1Trailer]);
  const arrayBuffer = mp3Data.buffer.slice(mp3Data.byteOffset, mp3Data.byteOffset + mp3Data.byteLength);

  const result = sanitizeMp3(arrayBuffer);
  const outBuf = Buffer.from(result.buffer);

  assert.equal(outBuf.length, audioPayload.length, "Only raw audio frames should remain");
  assert.equal(outBuf[0], 0xff);
  assert.equal(outBuf[1], 0xfb);
  assert.ok(result.fieldsRemoved >= 4);
});

test("sanitizeWav neutralizes LIST metadata chunk into JUNK", () => {
  const riffHeader = Buffer.from("RIFF\x2c\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00", "binary");
  const listChunk = Buffer.from("LIST\x0c\x00\x00\x00INFOIART\x04\x00\x00\x00User", "binary");
  const dataChunk = Buffer.from("data\x04\x00\x00\x00\x00\x00\x00\x00", "binary");

  const wavData = Buffer.concat([riffHeader, listChunk, dataChunk]);
  const arrayBuffer = wavData.buffer.slice(wavData.byteOffset, wavData.byteOffset + wavData.byteLength);

  const result = sanitizeWav(arrayBuffer);
  const outBuf = Buffer.from(result.buffer);

  assert.equal(outBuf.includes(Buffer.from("LIST")), false, "LIST chunk must be wiped");
  assert.equal(outBuf.includes(Buffer.from("JUNK")), true, "JUNK padding must replace LIST");
  assert.equal(outBuf.includes(Buffer.from("data")), true, "Audio data chunk must remain intact");
  assert.ok(result.fieldsRemoved >= 2);
});
