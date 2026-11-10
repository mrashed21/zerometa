<div align="center">

# ZeroMeta 🛡️

**Open-Source Digital Media Privacy & Metadata Toolkit**

Inspect, scrub, and sanitize hidden EXIF, XMP, IPTC, and location metadata directly in your browser. Built with a client-first privacy architecture, Next.js, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/mrashed21/zerometa/actions/workflows/ci.yml/badge.svg)](https://github.com/mrashed21/zerometa/actions)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-Zero_Telemetry-success)](https://www.zerometa.tech/privacy)

[**Live Application**](https://www.zerometa.tech/) • [**Documentation & Guides**](https://www.zerometa.tech/guides) • [**Report an Issue**](https://github.com/mrashed21/zerometa/issues) • [**Contributing**](CONTRIBUTING.md)

</div>

---

## 📖 Overview

Every digital photo, recorded audio note, and exported document carries invisible embedded information: GPS geographic coordinates, camera make and model, camera serial numbers, lens IDs, capture timestamps, software versions, and editing histories.

When files are shared online via messaging platforms, public marketplaces, or cloud storage, this invisible metadata can expose sensitive personal routines, residential locations, and physical hardware identities.

**ZeroMeta** is an all-in-one privacy toolkit engineered to inspect, neutralize, and strip this sensitive metadata. Processing location depends on the selected tool and mode: browser-based image and media workflows run locally, while Advanced image processing uploads the selected image to the application's processing endpoint. The application is designed not to retain uploaded files in persistent storage; review the privacy policy for current data-handling details.

---

## ✨ Key Features

- **Multiple Processing Modes**: Fast image sanitization and supported FFmpeg media workflows run in the browser. Advanced image processing uses the application's server-side Sharp endpoint, so the selected image is transmitted to that endpoint for processing.
- **Metadata Inspection**: Inspect available EXIF, XMP, IPTC, GPS coordinates, device models, and maker notes before choosing to scrub.
- **Multi-Format Support**: Comprehensive tools for Images (`JPEG`, `PNG`, `WebP`, `GIF`, `TIFF`, `SVG`), Documents (`PDF`), Video (`MP4`, `MOV`, `WebM`), and Audio (`MP3`, `WAV`, `OGG`, `M4A`).
- **Interactive Before/After Comparison**: Side-by-side visual difference slider and metadata comparison table verifying header removal.
- **Interactive Visual Redaction**: Blur, pixelate, or black-out sensitive areas (faces, license plates, documents) directly in the browser.
- **Batch Processing**: Clean and process dozens of files simultaneously with real-time progress indicators.
- **Universal ZIP Archiving**: Download all cleaned files together in an uncompressed or compressed `.zip` archive.
- **Truth in Privacy Architecture**: Transparent disclosures that clearly distinguish between stripped header metadata and intrinsic pixel contents (such as visible logos or statistical AI watermarks like Google DeepMind SynthID).
- **Zero Telemetry & No Tracking**: No cookies, no session trackers, no database logging, and no analytics beacons.

---

## 🛠️ Supported Tools & File Formats

| Category | Formats | Processing Engine | Capabilities |
| :--- | :--- | :--- | :--- |
| **Images** | `JPEG`, `JPG`, `PNG`, `WebP`, `GIF`, `TIFF`, `SVG` | HTML5 Canvas / Sharp | Metadata stripping, selected EXIF writing, visual metadata inspection, pixel redaction |
| **Documents** | `PDF` | `pdf-lib` parser and rewrite | Removes standard document Info fields and the catalog-level XMP reference; other PDF metadata structures are outside the verified scope |
| **Video** | `MP4`, `MOV`, `WebM`, `MKV` | Client-side FFmpeg WASM | Disables global/stream metadata mapping and chapter mapping; attached artwork and container-specific tags are not independently verified |
| **Audio** | `MP3`, `WAV`, `OGG`, `M4A`, `AAC`, `FLAC` | Client-side FFmpeg WASM | Disables global/stream metadata mapping and chapter mapping; attached artwork and container-specific tags are not independently verified |

---

## 🏗️ Architecture Overview

ZeroMeta employs a dual-tier processing pipeline designed around privacy, performance, and reliability:

```
┌────────────────────────────────────────────────────────┐
│                   User Web Browser                     │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │ Dropzone & Uploader  │───>│ Binary File Detector │  │
│  └──────────────────────┘    └──────────┬───────────┘  │
│                                         │              │
│       ┌─────────────────────────────────┴────────┐     │
│       ▼                                          ▼     │
│  ┌─────────────────────────┐        ┌────────────────┐ │
│  │ HTML5 Canvas & Web Worker│        │ ExifReader.js  │ │
│  │ (Direct Pixel Re-encode)│        │ (Tag Inspector)│ │
│  └────────────┬────────────┘        └────────────────┘ │
│               │                                        │
│               ▼                                        │
│  ┌─────────────────────────┐                           │
│  │ Clean Blob Output       │                           │
│  │ (GPS & EXIF Eliminated) │                           │
│  └─────────────────────────┘                           │
└────────────────────────────────────────────────────────┘
```

1. **Client-Side Engine (Primary)**:
   - Utilizes `OffscreenCanvas` and HTML5 Canvas 2D rasterization to strip all ancillary metadata chunks while preserving exact image fidelity.
   - Parses EXIF, IPTC, and XMP structures in real-time via `ExifReader` without sending bytes over the network.
   - Video and audio streams are processed using client-side `@ffmpeg/ffmpeg` WebAssembly compilation.

2. **Advanced Image Processing (Optional)**:
   - The server-side image endpoint backed by `sharp` validates image signatures, limits decoded pixel counts and processing parameters, and processes the image in memory.
   - The route processes the request in memory and does not intentionally write uploaded files to disk or persistent databases. The Advanced endpoint accepts images up to 4 MB because Vercel Functions limit request bodies to 4.5 MB; use Fast mode for larger images.

---

## 🧰 Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/) & [Base UI](https://base-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Motion & Animations**: [Motion](https://motion.dev/)
- **Image Processing**: HTML5 Canvas API, [Sharp](https://sharp.pixelplumbing.com/)
- **Metadata Parsing**: [ExifReader](https://github.com/mattiasw/ExifReader)
- **Media Transcoding**: [@ffmpeg/ffmpeg WebAssembly](https://ffmpegwasm.netlify.app/)
- **Archive Generation**: [JSZip](https://stuk.github.io/jszip/)
- **Crop & Redaction**: [React Image Crop](https://github.com/DominicTobias/react-image-crop)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (`v22+` recommended)
- **pnpm**: `v9` or higher (`v10+` recommended)
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrashed21/zerometa.git
   cd zerometa
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   *(All default environment settings work out of the box for local development. No external API keys or credentials are required.)*

4. **Start the local development server**:
   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

The project includes a `.env.example` template with configurable public variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.zerometa.tech` | Canonical deployment URL used for Open Graph and metadata |
| `NEXT_PUBLIC_APP_NAME` | `ZeroMeta` | Brand application title |
| `NEXT_PUBLIC_CREATOR_NAME` | `Muhammad Rashed` | Founder and author attribution |
| `NEXT_PUBLIC_SOFTWARE_NAME` | `ZeroMeta — Digital Media Privacy Toolkit` | Full software suite title |
| `NEXT_PUBLIC_GITHUB_URL` | `https://github.com/mrashed21/zerometa` | Repository reference link |

---

## 🧪 Build & Verification Commands

```bash
# Start local development server with Turbopack
pnpm run dev

# Run ESLint validation
pnpm run lint

# Run TypeScript static type checking
pnpm exec tsc --noEmit

# Run automated unit test suite
pnpm test

# Build production bundle
pnpm run build

# Start production server
pnpm start
```

---

## 🔒 Truth in Privacy & Limitations

At ZeroMeta, we prioritize engineering accuracy over marketing hype:

1. **Metadata vs. Pixel Content**:
   - Stripping metadata removes file header tags (EXIF, IPTC, XMP, GPS timestamps, camera serial numbers).
   - Metadata cleaning does **not** erase visual text, printed timestamps, or logo watermarks drawn directly into the visible image pixels. Use ZeroMeta's built-in **Redaction Tool** to obscure visible pixel regions.

2. **Statistical AI Watermarks (e.g., SynthID)**:
   - Invisible AI watermarks (such as Google DeepMind SynthID) are mathematically embedded in the pixel distribution / frequency domain, not in EXIF headers.
   - Header stripping will **not** remove SynthID. ZeroMeta does not make fraudulent claims about erasing mathematical AI model signatures.

3. **Browser Memory Caps**:
   - Processing extremely large video files (> 500 MB) client-side can exceed available browser tab memory limits. For ultra-large video files, native desktop tools like FFmpeg CLI are recommended.


4. **PDF Sanitization Scope**:
   - PDF processing removes the standard document Info dictionary and the catalog-level XMP reference, then verifies those two locations.
   - Metadata in annotations, attachments, embedded files, custom streams, and other nonstandard structures is not covered by this verification.

5. **Video and Audio Sanitization Scope**:
   - FFmpeg disables global and stream metadata mapping and disables chapter mapping while stream-copying audio/video.
   - Attached pictures, artwork, and container-specific tags are not independently probed, so ZeroMeta does not claim that every metadata location is removed.

6. **Advanced Image Upload Limit**:
   - The server-side Advanced image endpoint accepts files up to 4 MB to stay below [Vercel Functions' 4.5 MB request-body limit](https://vercel.com/docs/errors/function_payload_too_large), including multipart overhead. Use Fast mode for larger images; it processes locally in the browser.

7. **Metadata Editor Support**:
   - The Metadata Editor currently accepts raster images only. PDF and audio metadata editing are not implemented in that tool.

---

## 🗺️ Roadmap

- [x] Complete white/light premium SaaS UI overhaul
- [x] Modular tools for JPEG, PNG, WebP, GIF, TIFF, SVG, PDF, MP4, Audio
- [x] Side-by-side visual and metadata comparison viewer
- [x] Canvas-based interactive pixel redaction (blur/pixelate/blackout)
- [x] Document info and XMP stream sanitizer for PDF
- [x] Comprehensive technical guides on EXIF, GPS privacy, and metadata
- [x] Automated QA testing suite and GitHub Actions CI workflow
- [ ] Direct AVIF and HEIC client-side decoding via WebAssembly
- [ ] Offline Progressive Web App (PWA) caching for zero-network operation
- [ ] Command-line interface (`@zerometa/cli`) for local batch directory stripping

---

## 🤝 Contributing

Contributions from the open-source community are warmly welcomed! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

To report bugs or suggest enhancements, please use our structured [GitHub Issue Templates](https://github.com/mrashed21/zerometa/issues).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Founder & Author

<div align="left">

<img src="https://www.zerometa.tech/muhammad_rashed.webp" alt="Muhammad Rashed - Founder of ZeroMeta" width="96" height="96" style="border-radius: 50%;" />

**Muhammad Rashed**  
*Founder of ZeroMeta & Full Stack Developer*

ZeroMeta is built by **Muhammad Rashed**, a Full Stack Developer passionate about building privacy-focused digital tools, high-performance web applications, and practical open-source software.

- 🌐 **Personal Website & Portfolio**: [mrashed21.me](https://www.mrashed21.me/)
- 💻 **Developer Website**: [muhammadrashed.dev](https://muhammadrashed.dev/)
- 📝 **Tech Blog & Insights**: [muhammadrashed.tech](https://muhammadrashed.tech/)
- 💼 **LinkedIn Profile**: [linkedin.com/in/mrashed21](https://www.linkedin.com/in/mrashed21/)
- ✉️ **Contact Email**: [rashedjaman768@gmail.com](mailto:rashedjaman768@gmail.com)
- 🐙 **GitHub Profile**: [@mrashed21](https://github.com/mrashed21)
- 🛡️ **ZeroMeta Official Site**: [zerometa.tech](https://www.zerometa.tech/)

</div>
