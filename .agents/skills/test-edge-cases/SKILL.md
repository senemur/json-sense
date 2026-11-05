---
name: test-edge-cases
description: >-
  Systematic edge-case testing, validation, and quality verification skill for JSON Buddy.
  Use this skill whenever verifying, adding, or modifying JSON processing features,
  running comprehensive edge-case test suites, checking TypeScript inference correctness,
  or testing error handling, clipboard operations, and theme/storage management.
metadata:
  author: JSON Buddy Team
  version: 1.0.0
---

# JSON Buddy Edge-Case Testing & Verification Skill

This skill provides a standardized, repeatable procedure for testing, validating, and verifying edge-case behaviors across all JSON Buddy core modules and UI features.

## When to Use This Skill

Activate this skill when:
- Adding a new JSON transformation, formatting, or generation feature.
- Refactoring core parsing, diffing, or validation logic.
- Verifying application stability against malformed, adversarial, or extreme inputs.
- Ensuring that generated TypeScript code remains 100% syntactically valid.
- Verifying browser APIs like Clipboard and LocalStorage across restricted environments.

---

## Edge-Case Verification Workflow

Follow this systematic 5-step process:

### Step 1: Review the Feature Matrix
Consult the comprehensive [Edge Cases Matrix](./references/edge-cases-matrix.md) to identify which categories apply to your changes:
1. **JSON Formatter & Minifier**: Empty input, whitespaces, Unicode/emojis, scientific notation, `-0`, Windows CRLF.
2. **JSON Validator**: Syntax error diagnostics, line/column tracking, no stack trace leaks.
3. **JSON Tree Viewer**: Deep nesting (15+ levels), empty keys, search filter hierarchy preservation, Collapse/Expand All state.
4. **JSON to TypeScript**: Interface name sanitization, reserved keyword escaping, multi-dimensional arrays, object array merging, nullable properties.
5. **JSON Diff**: Dual invalid inputs, key order independence, type transitions (primitive to object, null to object).
6. **Clipboard Operations**: `navigator.clipboard` rejection, `execCommand` fallback, empty text rejection, rapid click debouncing.
7. **LocalStorage & Theme**: Storage quota/security exceptions (incognito mode), system preference fallback.

### Step 2: Use Standard Edge Payloads
Reference implementations and payloads are available in [examples/payloads.json](./examples/payloads.json). Use these exact payloads to test edge conditions.

### Step 3: Run the Verification Suite
Execute the automated test and build pipeline:
```bash
# In PowerShell:
./.agents/skills/test-edge-cases/scripts/verify-all.ps1

# Or via npm directly:
npm run lint
npx tsc -b
npm test
npm run build
```

### Step 4: Validate TypeScript Syntactic Correctness
When testing the JSON-to-TypeScript engine, always verify that the generated output compiles cleanly using the official TypeScript transpile API:
```typescript
import ts from 'typescript';

const result = ts.transpileModule(generatedCode, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
expect(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length).toBe(0);
```

### Step 5: Report Results
Verify and document:
1. Test suite status (`npm test` — all passing).
2. TypeScript compilation status (`npx tsc -b` — 0 errors).
3. ESLint check (`npm run lint` — 0 warnings/errors).
4. Production bundle build (`npm run build`).
