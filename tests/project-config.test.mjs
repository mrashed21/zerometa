import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("package scripts expose the commands used by CI", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts.lint, "eslint src");
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.test, "node --experimental-strip-types --test");
});

test("CI invokes linting, type-checking, tests, and production build", async () => {
  const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  for (const command of ["pnpm run lint", "pnpm exec tsc --noEmit", "pnpm test", "pnpm run build"]) {
    assert.ok(workflow.includes(command), `CI is missing: ${command}`);
  }
});

test("CI installs dependencies reproducibly from the lockfile", async () => {
  const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.match(workflow, /pnpm install --frozen-lockfile/);
});
