# Contributing to ZeroMeta

Thank you for your interest in contributing to ZeroMeta! ZeroMeta is an open-source, privacy-first media metadata toolkit built to help individuals protect their digital footprint by inspecting and removing sensitive metadata from files.

We welcome contributions from the community, whether you are fixing a bug, adding format support, improving accessibility, or enhancing documentation.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat fellow community members with respect, patience, and kindness.

---

## Core Architectural Principles

When contributing code to ZeroMeta, please keep our core tenets in mind:

1. **Client-Side Privacy First**: Wherever technically feasible, media inspection and metadata sanitization must run directly in the user's browser using HTML5 Canvas, WebAssembly, or pure client-side binary parsers.
2. **Zero Telemetry & Zero Retention**: ZeroMeta does not track users, log file payloads, or store uploaded media. Any serverless fallback routes must remain strictly ephemeral and in-memory.
3. **Truth in Privacy**: We do not make misleading claims. Clearly distinguish between stripped EXIF/XMP/IPTC file headers and intrinsic pixel contents (such as visible logos or statistical AI watermarks like SynthID).
4. **Performance & Accessibility**: Respect user device resources, provide responsive layouts, and ensure all controls are accessible via keyboard and screen readers.

---

## Development Setup

### Prerequisites

- **Node.js**: Version 20.x or higher (Node.js 22+ or 24 LTS recommended)
- **Package Manager**: [pnpm](https://pnpm.io/) (version 9 or higher)
- **Git**

### Installation

1. Fork the repository on GitHub: [github.com/mrashed21/zerometa](https://github.com/mrashed21/zerometa)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/zerometa.git
   cd zerometa
   ```
3. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```
4. Copy the environment configuration:
   ```bash
   cp .env.example .env.local
   ```
5. Start the local development server:
   ```bash
   pnpm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Development Workflow & Verification

Before submitting a Pull Request, verify that your changes pass all quality checks:

```bash
# 1. Run ESLint checks
pnpm run lint

# 2. Run TypeScript compiler type-check
pnpm exec tsc --noEmit

# 3. Run automated unit test suite
pnpm test

# 4. Verify production build
pnpm run build
```

---

## Branching & Commit Conventions

- **Branch Naming**:
  - `feat/feature-name` for new capabilities or tools
  - `fix/bug-description` for bug fixes
  - `docs/topic-name` for documentation improvements
  - `refactor/component-name` for code refactoring without behavior changes
  - `test/test-description` for test additions

- **Commit Messages**: Follow standard Conventional Commits:
  - `feat: add batch download progress indicator`
  - `fix: prevent memory leak during large video inspection`
  - `docs: update installation instructions for Windows`
  - `test: add unit test for TIFF tag validation`

---

## Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Follow existing code styling and component architecture.
3. Ensure no API keys, credentials, or private test files are committed.
4. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) with details about what your PR accomplishes and how you verified it.
5. Link relevant GitHub issue numbers (e.g., `Fixes #12`).

---

## Questions or Assistance

If you have questions about implementing a feature or need architecture guidance, feel free to open a discussion or issue on GitHub.

