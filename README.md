# JsonSense — The Privacy-First Developer Studio for JSON

<p align="center">
  <img src="./public/logo.png" alt="JsonSense Logo" width="160" />
</p>

<p align="center">
  <strong>An offline-capable, high-performance developer toolkit to format, repair, inspect, infer schemas, and validate JSON payloads entirely in your browser.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Vitest-176%20Passed-green?style=flat-square&logo=vitest" alt="Vitest 176 Tests" />
  <img src="https://img.shields.io/badge/Playwright-32%20E2E%20Passed-green?style=flat-square&logo=playwright" alt="Playwright E2E" />
  <img src="https://img.shields.io/badge/Telemetry-0%25%20Client--Side-crimson?style=flat-square" alt="Zero Telemetry" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="MIT License" />
</p>

---

## The Problem

Every day, software engineers handle JSON payloads containing confidential data: API credentials, production stack traces, customer records, and internal schema structures. 

Yet, most online JSON formatters and validators:
1. **Compromise Confidentiality:** Send raw payloads to third-party servers, risking data leakage, logging, or third-party tracking.
2. **Fail on Minor Syntax Defects:** Immediately reject malformed logs (unquoted keys, trailing commas, Python literals like `True` or `None`) without actionable repair diagnostics.
3. **Lack Structural Telemetry:** Offer only pretty-printing rather than inspecting array type inconsistencies, missing schema keys, or nesting depth.
4. **Require Manual Schema Authoring:** Force developers to write verbose JSON Schema Draft-07 specifications by hand instead of inferring them deterministically from diverse API sample responses.

**JsonSense** solves these issues by delivering a cohesive, privacy-guaranteed developer suite running **100% in-browser** with microsecond execution speeds.

---

## Core Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                               JsonSense                                │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│  Smart Repair   │ JSON Inspector  │  Schema Studio   │  TypeScript Gen │
│  AST Scanner    │ Quality Telemetry│ Inference & Test │  Interface Gen  │
├─────────────────┼─────────────────┼──────────────────┼─────────────────┤
│   Tree Viewer   │    JSON Diff    │ Format & Minify  │ Syntax Validate │
│  DOM Explorer   │ Semantic Engine │ 2-Sp/4-Sp/Tabs   │ Point & Snippet │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

- **🛠️ Smart JSON Repair:** AST-style scanner that safely resolves unquoted keys, single quotes, trailing commas, comments, and Python/JS literals (`True`, `False`, `None`, `undefined`) without mutating user strings.
- **🔍 Structure & Quality Inspector:** Computes object/array counts, max depth, longest arrays, and flags empty strings, nulls, and type inconsistencies with exact JSONPath notation (`$.users[1].id`).
- **📐 Schema Studio:** Infers unified JSON Schema from single or multi-sample batches (distinguishing integers from floats, computing `required` field intersections, and generating union types) paired with a live Draft-07 Validation Workbench.
- **💻 JSON to TypeScript:** Automatically converts nested payloads into clean, idiomatic TypeScript interfaces with configurable root naming and export controls.
- **± JSON Comparison Diff:** Structural comparison engine identifying added, removed, and modified values independent of object key insertion order.
- **🌲 Interactive Tree Viewer:** Collapsible hierarchical tree navigation with instant substring filtering across keys and values.
- **{ } Format & Minify:** Instant 2-space, 4-space, and tab indentation with live byte, character, and line telemetry.
- **🎨 Custom Design System:** Built with the JsonSense signature palette: Crimson (`#8d2f43`), Orange Gold (`#e6c76e`), and Light Red (`#f7f3f3`), supporting persistent light and dark themes.

---

## Live 5-Step Demo Workflow

JsonSense is built for seamless end-to-end developer workflows:

```
[1. Malformed JSON] ➔ [2. Smart Repair] ➔ [3. Structural Audit] ➔ [4. Schema Studio] ➔ [5. Live Validation]
```

1. **Paste Malformed Input:** Input raw log data containing single quotes, trailing commas, and unquoted keys.
2. **Execute Smart Repair:** Click `Repair JSON ➔` to review diagnosed fixes and apply clean JSON to the editor.
3. **Inspect Telemetry:** Switch to `JSON Inspector` to inspect nesting depth, quality score, and JSONPath anomalies.
4. **Infer JSON Schema:** Switch to `Schema Studio`, input multiple sample variations, and infer a unified schema.
5. **Validate Target Data:** Switch to `Validation Workbench` to validate incoming payloads and inspect structured error tables with JSONPath coordinates.

---

## Architecture & Codebase Organization

JsonSense adheres to strict decoupling: pure algorithmic engines are kept independent of React UI rendering.

```
src/
├── components/            # Shared UI components (Header, StatusAlert, Theme toggles)
├── features/              # Feature modules
│   ├── overview/          # Product landing page & 5-step demo showcase
│   ├── formatter/         # Formatter, syntax diagnostic & Smart Repair UI
│   ├── inspector/         # Structure & quality telemetry dashboard
│   ├── schema-studio/     # Multi-sample schema inferrer & Validation Workbench UI
│   ├── typescript-generator/ # TypeScript interface generator UI
│   ├── json-diff/         # Side-by-side JSON comparison viewer
│   └── tree-view/         # Collapsible hierarchical tree explorer
├── hooks/                 # Custom hooks (useTheme, useClipboard)
├── lib/                   # Pure TypeScript engines (Zero UI, 100% testable)
│   ├── formatter.ts       # Indentation & minification logic
│   ├── validator.ts       # Syntax scanner with line/column diagnostic
│   ├── repair.ts          # AST-style resilient repair scanner
│   ├── inspector.ts       # Deep structural telemetry & JSONPath calculator
│   ├── schema-inferrer.ts # Multi-sample schema inference engine
│   ├── schema-validator.ts# Specification validation engine
│   ├── diff.ts            # Recursive structural diff comparator
│   └── typescript-generator.ts # TypeScript interface generator
├── test/                  # Vitest & Testing Library unit/component test suite
└── types/                 # Shared domain types (JsonValue, Schema, Inspector)
```

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 | Declarative UI and state management |
| **Language** | TypeScript 5.9 | Static typing and interfaces |
| **Build Tool** | Vite 8.3 | Lightning-fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS v4 | Clean developer-tool styling with dark mode support |
| **Unit Testing** | Vitest 4.1 | Fast in-memory unit and property-based invariance testing |
| **DOM Testing** | React Testing Library | Accessible user-flow component verification |
| **E2E Testing** | Playwright 1.58 | Real Chromium browser automation across all user workflows |

---

## Screenshots & UI Previews

<!-- SCREENSHOT_PLACEHOLDER: Overview Landing Page and Feature Showcase -->
> *Placeholder: Overview Landing Page showcasing the developer studio capabilities and 5-step guided walkthrough.*

<!-- SCREENSHOT_PLACEHOLDER: Smart JSON Repair in Action -->
> *Placeholder: Smart JSON Repair diagnosing unquoted keys, trailing commas, and Python literals with confidence ratings.*

<!-- SCREENSHOT_PLACEHOLDER: JSON Structure & Quality Inspector -->
> *Placeholder: JSON Inspector displaying structural telemetry, nesting depth, and JSONPath anomaly tracking.*

<!-- SCREENSHOT_PLACEHOLDER: Schema Studio Multi-Sample Inference & Validation Workbench -->
> *Placeholder: Schema Studio inferring schema from multiple samples and validating target payload with error table.*

---

## Privacy & Client-Side Execution Guarantee

JsonSense is built upon a fundamental privacy premise:

- **Zero Network Telemetry:** No user payloads, schema structures, or queries are ever transmitted to any external backend or third-party service.
- **Local Memory Processing:** All parsing, AST traversal, schema inference, and validation execute strictly inside the browser JavaScript runtime.
- **No Third-Party Analytics:** No trackers, fingerprinting scripts, or advertising cookies are integrated.
- **Isolated Local Storage:** Browser `localStorage` is exclusively utilized for persisting user theme preference (`light` / `dark`).

---

## JSON Schema Specification Conformance

Schema Studio supports a robust, browser-native subset of the JSON Schema (Draft-07) standard:

### Supported Keywords:
- **Type Checking:** `type` (`string`, `number`, `integer`, `boolean`, `null`, `object`, `array`, and union arrays). Mathematical integer precision is verified (`Number.isInteger`).
- **Object Constraints:** `properties`, `required`, `additionalProperties` (boolean or schema), `minProperties`, `maxProperties`, `propertyNames`.
- **Array Constraints:** `items` (single schema, boolean, or tuple array), `additionalItems`, `contains`, `minItems`, `maxItems`, `uniqueItems` (deep structural equality).
- **Numeric Limits:** `minimum`, `maximum`, `exclusiveMinimum` (numeric syntax), `exclusiveMaximum` (numeric syntax), `multipleOf`.
- **String Constraints:** `minLength`, `maxLength`, `pattern` (safely handled against invalid regex syntax).
- **Value Matching:** `enum`, `const` (deep structural equality).
- **Combinators:** `anyOf` (at least 1 match), `oneOf` (strictly 1 match), `allOf` (all branches match), `not` (fails if subschema passes).
- **Boolean Schemas:** Full Draft-07 compliance for boolean schemas (`true` and `false`).
- **Error Diagnostics:** Deterministic JSONPath generation independent of object property insertion order.

### Architectural Privacy Boundaries:
- **`$ref` and `$id`:** Remote and local pointer dereferencing is omitted to ensure zero network requests and eliminate SSRF/infinite loop vulnerabilities.
- **`definitions` / `$defs`:** Anchor dictionaries for `$ref` resolution are not evaluated.
- **`dependencies`:** Dependent schema rules are omitted.
- **`format`:** Semantic formats (`date-time`, `email`, `uri`) are treated as informative annotations rather than binding assertions.

---

## Getting Started

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/senemur/json-sense.git

# Navigate into project directory
cd json-sense

# Install dependencies from lockfile
npm ci
```

### Local Development

```bash
# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `vite` | Starts local development server with instant HMR |
| **`npm run build`** | `tsc -b && vite build` | Type-checks and creates production bundle in `dist/` |
| **`npm run preview`** | `vite preview` | Serves production build locally |
| **`npm run lint`** | `eslint .` | Runs ESLint analysis across TypeScript and React code |
| **`npm test`** | `vitest run` | Runs complete unit, component, and property-based test suite |
| **`npm run test:watch`** | `vitest` | Runs Vitest in interactive watch mode |
| **`npm run test:e2e`** | `playwright test` | Runs Chromium end-to-end browser tests |
| **`npm run test:e2e:ui`** | `playwright test --ui` | Runs Playwright interactive test runner |

---

## Testing Strategy & Quality Assurance

The codebase maintains rigorous quality gates across multiple testing layers:

```
┌────────────────────────────────────────────────────────┐
│             Playwright E2E Browser Tests               │
│          32 tests verifying user journeys              │
├────────────────────────────────────────────────────────┤
│           React Testing Library Components             │
│        Interactive UI, forms, clipboard & tabs         │
├────────────────────────────────────────────────────────┤
│          Vitest Unit & Property-Based Tests            │
│  176 tests covering algorithms, AST & Draft-07 schemas │
└────────────────────────────────────────────────────────┘
```

- **Unit & Invariance Tests:** Verifies pure functions (`repair.ts`, `schema-inferrer.ts`, `schema-validator.ts`, `inspector.ts`). Includes permutation invariance testing ensuring multi-sample schema inference is 100% order-independent.
- **Component Tests:** Validates UI state transitions, tab switching, and clipboard actions with simulated DOM events.
- **End-to-End Browser Tests:** Playwright drives headless Chromium across all 8 feature flows, including theme persistence, invalid syntax diagnostics, and multi-step repair workflows.

---

## Roadmap

- [ ] **Monaco Editor Integration:** In-browser code editing with gutter error indicators and code folding.
- [ ] **OpenAPI 3.0 / 3.1 Exporter:** Export inferred schemas directly into OpenAPI parameter and request body schemas.
- [ ] **JSON5 & JSONC Extended Parsing:** Native support for comments and unquoted keys directly in formatting pipelines.
- [ ] **JSON Schema to Mock Data Generator:** Generate synthetic test data adhering to inferred or custom schemas.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with precision by **Senem** &bull; Best Buddy for JSON
