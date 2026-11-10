# Security Policy

ZeroMeta is built on a privacy-first foundation. The security of our users' files, devices, and personal information is our highest priority.

---

## Supported Versions

Only the latest release running on the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x / `main` | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability or privacy leak within ZeroMeta, please notify us responsibly through coordinated disclosure.

**Please DO NOT open a public GitHub issue for security or privacy vulnerabilities.**

Instead, report the issue via:
- **Email**: Send detailed disclosure to `mrashed21@gmail.com`
- **Subject**: `[ZeroMeta Security] Vulnerability Report: <Brief Description>`

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
1. A description of the vulnerability and its potential impact.
2. Step-by-step reproduction instructions or a minimal proof of concept (PoC).
3. The affected environment (e.g., browser engine, operating system, file format).
4. Any proposed remediation or mitigation if available.

### Response Timeline

- **Initial acknowledgment**: Within 48 hours.
- **Triage & validation**: Within 5 business days.
- **Patch release & public advisory**: Coordinated once a fix is verified and deployed.

---

## Security & Privacy Architecture Disclosures

ZeroMeta is engineered to minimize attack surface and data exposure:

1. **Client-Side Isolation**: By default, image metadata inspection and stripping run entirely within the user's browser sandbox using the HTML5 Canvas API and WebAssembly. File bytes never traverse the network in client-side mode.
2. **Stateless Fallback Processing**: If a fallback serverless route is utilized for complex formats, operations are strictly executed in ephemeral memory without persistent storage, database logging, or third-party analytical telemetry.
3. **No Credential Requirements**: ZeroMeta does not require accounts, cookies, or external authentication tokens to function.
4. **Third-Party Dependencies**: Dependencies are regularly audited for known CVEs via automated dependency scanning.

