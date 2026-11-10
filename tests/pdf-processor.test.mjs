import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { extractPdfMetadata, sanitizePdfMetadata } from "../src/lib/pdf-processor.ts";

function asFile(bytes, name = "fixture.pdf") {
  return new File([bytes], name, {
    type: "application/pdf",
    lastModified: new Date("2024-01-01T00:00:00.000Z").getTime(),
  });
}

async function createPdfWithInfoMetadata() {
  const pdf = await PDFDocument.create();
  pdf.addPage([300, 400]);
  pdf.setTitle("Private document title");
  pdf.setAuthor("Private author");
  pdf.setSubject("Private subject");
  pdf.setKeywords(["private", "test"]);
  pdf.setCreator("Private creator");
  pdf.setProducer("Private producer");
  pdf.setCreationDate(new Date("2020-01-01T00:00:00.000Z"));
  pdf.setModificationDate(new Date("2021-01-01T00:00:00.000Z"));
  return pdf.save();
}

test("PDF inspection reads standard document information fields", async () => {
  const file = asFile(await createPdfWithInfoMetadata());
  const fields = await extractPdfMetadata(file);

  assert.ok(fields.some((field) => field.key === "Title" && field.value === "Private document title"));
  assert.ok(fields.some((field) => field.key === "Author / Creator" && field.value === "Private author"));
  assert.ok(fields.some((field) => field.key === "Pages" && field.value === "1"));
});

test("PDF sanitization removes Info metadata and preserves readable pages", async () => {
  const file = asFile(await createPdfWithInfoMetadata());
  const result = await sanitizePdfMetadata(file);
  const output = await PDFDocument.load(await result.blob.arrayBuffer(), {
    updateMetadata: false,
    throwOnInvalidObject: true,
  });

  assert.equal(output.getPageCount(), 1);
  assert.equal(output.getTitle(), undefined);
  assert.equal(output.getAuthor(), undefined);
  assert.equal(output.getSubject(), undefined);
  assert.equal(output.getKeywords(), undefined);
  assert.equal(output.getCreator(), undefined);
  assert.equal(output.getProducer(), undefined);
  assert.equal(output.getCreationDate(), undefined);
  assert.equal(output.getModificationDate(), undefined);
  assert.ok(result.cleanedKeys.includes("Title"));
  assert.ok(result.metadataAfter.some((field) => field.key === "Document Info Dictionary" && field.stripped));
});

test("PDF sanitizer rejects invalid input instead of returning a false success", async () => {
  const invalid = asFile(new TextEncoder().encode("not a PDF"));
  await assert.rejects(() => sanitizePdfMetadata(invalid));
});
