# JsonSense — Best Buddy for JSON

![JsonSense Logo](./public/logo.png)

**JsonSense** is a fast, reliable, and 100% private developer tool for inspecting, formatting, validating, comparing, repairing, and transforming JSON data directly in your browser.

> **Zero Network Requests &bull; 100% Client-Side &bull; Data Never Leaves Your Browser**

---

## Features

- **Format & Minify:** 2-space, 4-space, and tab indentation with instant byte, character, and line counters.
- **Syntax Validator:** Friendly syntax error diagnostic with line, column, and error pointer snippet.
- **Smart JSON Repair:** Safely fixes unquoted keys, trailing commas, single quotes, comments, Python/JS literals, and unclosed containers without mutating string contents.
- **JSON Inspector:** Structure & quality analyzer computing nesting depth, object/array counts, type inconsistencies, missing schema fields, empty values, and duplicate IDs with exact JSONPath tracking.
- **Schema Studio:** Infers standard JSON Schema (Draft-07) from single or multiple diverse payloads with union types, integer detection, required property intersections, and a full Validation Workbench.
- **Tree Viewer:** Interactive, collapsible hierarchical explorer with instant keyword filtering.
- **JSON to TypeScript:** Generates clean, idiomatic TypeScript interfaces with configurable root names and `export` toggles.
- **JSON Diff:** Side-by-side comparison engine highlighting added, removed, and modified values.
- **Light & Dark Mode:** Built with the signature JsonSense Crimson (`#8d2f43`), Orange Gold (`#e6c76e`), and Light Red (`#f7f3f3`) palette.

---

## JSON Schema Draft-07 Conformance & Specification Coverage

Schema Studio executes **100% in-browser** with zero external dependencies and zero network resolution to preserve complete data privacy.

### Supported Draft-07 Specification Subset:
- **Type System:** `type` (`string`, `number`, `integer`, `boolean`, `null`, `object`, `array`, and union type arrays e.g. `["integer", "string"]`). Mathematical integer precision verified.
- **Object Keywords:** `properties`, `required`, `additionalProperties` (boolean and schema), `minProperties`, `maxProperties`, `propertyNames`.
- **Array Keywords:** `items` (single schema, boolean, and tuple form), `additionalItems`, `contains`, `minItems`, `maxItems`, `uniqueItems` (deep equality check for primitives, nested objects, and arrays).
- **Numeric Limits:** `minimum`, `maximum`, `exclusiveMinimum` (Draft-07 numeric limit), `exclusiveMaximum` (Draft-07 numeric limit), `multipleOf`.
- **String Constraints:** `minLength`, `maxLength`, `pattern` (safe execution avoiding crash on invalid regex).
- **Value Matching:** `enum`, `const` (deep structural equality).
- **Logical Combinators:** `anyOf` (at least 1 match), `oneOf` (strictly 1 match), `allOf` (all branches match), `not` (fails if subschema matches).
- **Boolean Schemas:** Full Draft-07 support for `true` (unconditional pass) and `false` (unconditional fail).
- **JSONPath & Determinism:** Exact JSONPath generation on all failure diagnostics, with deterministic error ordering independent of object property insertion order.

### Unsupported Draft-07 Features (Client-Side Privacy Boundaries):
- **`$ref` and `$id`:** Remote and local JSON pointer dereferencing is omitted to ensure zero network requests and prevent SSRF/loop hazards.
- **`definitions` / `$defs`:** Anchor dictionaries for `$ref` resolution are not evaluated.
- **`dependencies`:** Property and schema dependencies are not evaluated.
- **`format`:** Semantic format strings (e.g. `date-time`, `email`, `ipv4`) are treated as Draft-07 annotations, not assertions.
- **Recursive Schemas:** Self-referencing schemas requiring `$ref` traversal are not supported.

---

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Vitest & React Testing Library**
- **Playwright**

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit & component tests
npm test

# Run Playwright E2E tests
npm run test:e2e

# Run production build
npm run build
```

---

## License

MIT &copy; 2026 JsonSense Team
