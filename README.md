# `@Okra-Development/okra-node-sign-engine`

> A robust, production-ready Node.js engine for visual field stamping, PKCS#7 / PAdES cryptographic PDF sealing, RFC 3161 timestamping, and Long-Term Validation (LTV).

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

* 🎨 **Visual Field Stamping:** Automatically converts Web top-left coordinates `(X, Y)` to native PDF bottom-left coordinates.
* 🔐 **Cryptographic Sealing:** Generates standards-compliant PAdES / PKCS#7 digital signatures using `.p12` / `.pfx` certificates.
* ⏰ **RFC 3161 Timestamping:** Supports integration with external Time Stamping Authorities (TSA) via HTTP POST.
* 🛡️ **Long-Term Validation (LTV):** Injects Document Security Store (`/DSS`) structures to preserve legal validity after certificate expiration.
* ⚡ **Pure Node.js Runtime:** Zero external system runtime requirements (no Java JRE or C++ native modules required).

---

## Installation

```bash
# Via npm
npm install @Okra-Development/okra-node-sign-engine

# Via GitHub Packages / Private Registry
npm install @Okra-Development/okra-node-sign-engine --registry=[https://npm.pkg.github.com](https://npm.pkg.github.com)

Copyright © 2026 Your Organization. All rights reserved. Proprietary / MIT License.