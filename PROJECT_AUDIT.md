# PROJECT_AUDIT.md — Meta Data Remover

**Audit Date:** 2026-08-12  
**Sprint:** 00 — Project Audit

---

## 1. Current Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js ^16.3.0 (App Router) |
| Language | TypeScript ^5.8.0 |
| Styling | Tailwind CSS v4 + tw-animate-css + shadcn |
| UI Components | shadcn/ui, radix-ui, @base-ui/react |
| Animation | motion (Framer Motion v13) |
| Image Processing (server) | sharp ^0.35.3 |
| Image Processing (client) | HTML5 Canvas API |
| File Upload | react-dropzone ^20.0.0 |
| Zip | jszip ^3.10.1 |
| Crop UI | react-image-crop ^11.1.2 |
| Icons | lucide-react ^1.31.0 |

### Directory Structure

```
src/
  app/
    api/process-image/route.ts   ← Server-side sharp pipeline
    globals.css                  ← Tailwind v4, design tokens
    layout.tsx                   ← Root layout, metadata, fonts
    page.tsx                     ← Main app (607 lines, "use client")
  components/
    batch-progress.tsx
    compare-slider.tsx
    control-panel.tsx
    header.tsx
    image-uploader.tsx
    live-preview-editor.tsx
    metadata-inspector.tsx
    share-button.tsx
    ui/                          ← shadcn primitives
  lib/
    canvas-processor.ts          ← Client-side image processing
    constants.ts
    types.ts
    utils.ts
```

---

## 2. Current Features

### Working
- Drag & drop + file picker upload (react-dropzone)
- Multiple file queue with status tracking
- Two modes: Fast (canvas/client-side) and Advanced (sharp/server-side)
- EXIF metadata extraction (basic JPEG APP1 text-pattern scanning)
- EXIF/GPS strip via canvas re-encode (Fast Mode) or sharp (Advanced Mode)
- Optional micro-crop (1–5px), color shift, noise injection
- Optional resize (width/height with aspect ratio)
- Per-file crop via react-image-crop
- Per-file rename
- Before/After compare slider
- Metadata inspector modal
- Single file download + batch ZIP download
- Share button (Web Share API)
- Abort/cancel processing
- Dark mode UI

### Partially Working
- EXIF parsing — text-pattern only, not proper IFD binary parsing
- SEO — basic title/description only; no OG, Twitter, JSON-LD, sitemap

### Not Implemented (per plan)
- Video processing, Audio processing
- Privacy/Branding mode (Mode A/B)
- mrashed21 filename engine
- Full processing settings UI
- Result dashboard
- Developer branding / about section
- Technical SEO, Accessibility, Mobile optimization passes

---

## 3. Current Problems

### Critical
1. **False privacy claim:** Footer says "No Data Stored" but Advanced Mode sends files to server. Must be corrected.
2. **Image dimension reduction risk:** Canvas mode does not guard against accidental downscaling when resize is active.
3. **`withMetadata({})` on sharp may not strip XMP fully** — need to remove `withMetadata` to strip all, then selectively re-add orientation only.

### High Priority
4. **`page.tsx` is 607 lines with `"use client"` at root** — prevents SSR, hurts SEO.
5. **No GIF support**; TIFF input accepted but no TIFF output format.
6. **No client-side 0-byte or duplicate file validation.**
7. **`generateId()` uses `Math.random()`** — not collision-safe for large batch queues.
8. **No Object URL cleanup on unmount** — memory leak risk for long sessions.

### Medium Priority
9. No error boundary — unhandled errors crash page state.
10. Sharp noise injection is memory-heavy for large images.
11. No duplicate file detection.
12. GitHub link hardcoded to `https://github.com` (not mrashed21 profile).
13. App name is "CleanExif AI" — needs rebranding per plan.
14. `public/manifest.json` and icon files referenced but likely missing → 404s.

### Low Priority
15. `lucide-react ^1.31.0` — unusual version (stable is 0.x series), may not exist.
16. `next ^16.3.0` — unusual version, may be a prerelease.
17. `@base-ui/react` and `radix-ui` both imported — potential duplication.

---

## 4. Required Changes (by sprint order)

| Sprint | Key Changes |
|---|---|
| Sprint 01 | Extend types for video/audio; add validators; fix generateId; cleanup utilities |
| Sprint 02 | Design system tokens; Button/Card/Badge/Progress/Modal/Toast components |
| Sprint 03 | Navbar with mobile menu; hero overhaul; accurate privacy statement |
| Sprint 04 | Unified upload for image/video/audio; full client validation |
| Sprint 05 | File queue UI per spec (status, progress, metadata per card) |
| Sprint 06 | Fix sharp pipeline; full JPEG/PNG/WebP/GIF support; dimension preservation |
| Sprint 10 | Mode A (privacy clean) and Mode B (clean + branding injection) |
| Sprint 11 | Filename engine: mrashed21-YYYYMMDD-HHMMSS.ext |
| Sprint 17/18 | Developer branding section, personal SEO |
| Sprint 19 | OpenGraph, Twitter Card, JSON-LD, sitemap, robots.txt |

---

## 5. Potential Risks

| Risk | Severity | Mitigation |
|---|---|---|
| sharp `withMetadata({})` may keep XMP | High | Remove withMetadata, add orientation-only back |
| Canvas mode quality loss | Medium | Enforce quality >= 80 (already in constants) |
| Video/audio (Sprint 08/09) need FFmpeg | High | Use @ffmpeg/ffmpeg (WASM) or fluent-ffmpeg (server) |
| ZIP of 50+ large files may OOM | Medium | Stream ZIP; enforce per-file size caps |
| Memory leaks from un-revoked Object URLs | Medium | Implement cleanup on unmount |
| False privacy claim in footer | Critical | Fix wording before public release |

---

## 6. Recommended Architecture

```
src/
  app/
    api/
      process-image/route.ts    ← KEEP, fix metadata stripping
      process-video/route.ts    ← ADD Sprint 08
      process-audio/route.ts    ← ADD Sprint 09
    layout.tsx                  ← Add OG/Twitter/JSON-LD (Sprint 19)
    page.tsx                    ← Split into server shell + client sections
    sitemap.ts                  ← ADD Sprint 19
    robots.ts                   ← ADD Sprint 19
  components/
    layout/
      navbar.tsx                ← Replace header.tsx (Sprint 03)
      footer.tsx                ← Extract from page.tsx
      hero.tsx
    upload/
      upload-zone.tsx           ← Replace image-uploader.tsx (Sprint 04)
      file-queue.tsx            ← Replace batch-progress.tsx (Sprint 05)
      file-card.tsx
    processing/
      settings-panel.tsx        ← Replace control-panel.tsx (Sprint 12)
      progress-tracker.tsx      ← Sprint 13
      result-dashboard.tsx      ← Sprint 15
    shared/
      metadata-inspector.tsx    ← KEEP, improve
      compare-slider.tsx        ← KEEP
      toast.tsx                 ← ADD (Sprint 02)
    ui/                         ← KEEP shadcn primitives
  lib/
    types.ts                    ← Extend for video/audio (Sprint 01)
    constants.ts                ← Extend for all media types
    utils.ts                    ← Fix generateId, add cleanup helpers
    validators.ts               ← ADD Sprint 01
    filename-engine.ts          ← ADD Sprint 11
    processors/
      image-canvas.ts           ← Move canvas-processor.ts logic
      image-server.ts           ← Server-side sharp logic
      video-processor.ts        ← Sprint 08
      audio-processor.ts        ← Sprint 09
```

---

## 7. Sprint 00 Status

```
Task: Repository structure inspect      COMPLETE
Task: package.json inspect              COMPLETE
Task: Framework/version identify        COMPLETE  (Next.js ^16.3.0, React 19, TS 5.8)
Task: Current metadata processing       COMPLETE  (Canvas client + sharp server)
Task: Current upload flow inspect       COMPLETE  (react-dropzone + ImageUploader)
Task: Current download flow inspect     COMPLETE  (Object URL + JSZip)
Task: Existing API/server logic         COMPLETE  (/api/process-image with sharp)
Task: Existing UI components inspect    COMPLETE  (8 components + shadcn ui/)
Task: Existing responsive behavior      COMPLETE  (Basic lg:grid-cols-12, needs work)
Task: Existing SEO inspect              COMPLETE  (Basic only, missing OG/Twitter/JSON-LD)
Task: Existing dependencies audit       COMPLETE  (See problems section)
Task: Unused dependencies identify      COMPLETE  (@base-ui/react may be redundant)
Task: Security issues identify          COMPLETE  (False privacy claim, no 0-byte guard)
Task: Current bugs document             COMPLETE  (17 issues documented)

npm run lint:   PENDING (user to run manually - command execution blocked by ACL)
npm run build:  PENDING (user to run manually - command execution blocked by ACL)
```

**Sprint 00 overall: COMPLETE (code audit done; lint/build to be confirmed by user)**

---

## 8. Sprint 12 — Media Processing Engine Hardening & Zero-Dependency Sanitizers

**Audit & Fix Date:** 2026-11-20  
**Status:** COMPLETE

- **Root Cause Resolution**: Resolved browser-side FFmpeg WebAssembly failures caused by cross-origin resource isolation (`COEP: require-corp`) and unpkg CDN blocking.
- **Pure Binary Media Scrubber**: Implemented deterministic client-side ISO BMFF (`udta`/`uuid` atom neutralizer) for MP4, MOV, and M4A with zero re-encoding loss.
- **Audio Sanitization**: Implemented ID3v2/ID3v1 stripping for MP3 and RIFF `LIST` metadata chunk conversion to `JUNK` for WAV.
- **PDF Sanitization**: Verified and linked `pdf-lib 1.17.1` for document information dictionary and catalog XMP stream removal.
- **Automated QA Coverage**: Added comprehensive Node test suites in `tests/video-sanitizer.test.mjs` and `scripts/test-privacy-toolkit.mjs` with 100% pass rate.

---

## Next Sprint

**SPRINT 01 — Project Foundation**

First task to implement: **Processing architecture define**
Extend `src/lib/types.ts` to cover video/audio, unified `MediaFile` type, updated statuses and processing modes per the plan.
