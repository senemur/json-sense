# JSON Buddy Edge-Cases Matrix & Quality Checklist

This reference document defines the required test scenarios, inputs, and expected behaviors across all features of JSON Buddy.

---

## 1. JSON Formatter & Minifier

| Test Scenario | Sample Input | Expected Behavior |
| :--- | :--- | :--- |
| **Empty String** | `""` | Returns `{ success: true, output: "" }` without throwing. |
| **Whitespace Only** | `"   \n\t  "` | Returns `{ success: true, output: "" }`. |
| **JSON Null** | `"null"` | Formats and minifies to `"null"`. |
| **Top-Level Primitives** | `"42"`, `"true"`, `"\"hello\""` | Formats and minifies correctly. |
| **Unicode & Emojis** | `{"emoji": "🚀", "symbol": "© €"}` | Characters preserved verbatim without corruption. |
| **Scientific Notation** | `{"val": 1.25e-4}` | Valid number parsed correctly without losing value. |
| **Negative Zero** | `{"val": -0}` | Serialized safely as `0` or `-0`. |
| **Windows CRLF** | `"{\r\n  \"a\": 1\r\n}"` | Handled seamlessly without line count or parsing errors. |
| **Malformed JSON Failure** | `"{ invalid json"` | Returns `{ success: false, output: originalInput, error: ... }`. Original input is preserved. |

---

## 2. JSON Syntax Validator

| Test Scenario | Sample Input | Expected Behavior |
| :--- | :--- | :--- |
| **Unquoted Object Keys** | `{ name: "Buddy" }` | Invalid syntax; highlights line & column; clean message. |
| **Single Quotes** | `{'name': 'Buddy'}` | Invalid syntax (JSON requires double quotes). |
| **Trailing Comma in Object** | `{"a": 1,}` | Invalid syntax; indicates unexpected token `}`. |
| **Trailing Comma in Array** | `[1, 2,]` | Invalid syntax; indicates unexpected token `]`. |
| **JavaScript Comments** | `// comment\n{"a": 1}` | Invalid syntax (JSON specification forbids comments). |
| **Multiple Top-Level Roots** | `{"a": 1} {"b": 2}` | Invalid syntax; unexpected character after JSON. |
| **Unclosed String/Brackets** | `{"unclosed": "value` | Invalid syntax; indicates unexpected end of input. |
| **Privacy Check** | Any input | 100% processed locally; never transmitted to network. |
| **Stack Trace Hygiene** | Any error | No runtime paths (`.js:`, `node:internal`) leaked to UI. |

---

## 3. JSON Tree Viewer

| Test Scenario | Sample Input | Expected Behavior |
| :--- | :--- | :--- |
| **Deeply Nested Structure** | 15+ nested object levels | Recursively builds tree without call-stack overflow. |
| **Array of Arrays** | `[[[1, 2]], [[3, 4]]]` | Displays nested array badges and counts correctly. |
| **Empty Keys** | `{"": "empty key value"}` | Correctly displays `"":` key with preview value. |
| **Collapse All Action** | Click "Collapse All" | Every node, including root (depth 0) and depth 1, collapses. |
| **Expand All Action** | Click "Expand All" | Re-expands all levels of the tree. |
| **Search Filter Match** | Search query matching leaf | Shows matching node while preserving ancestor branch hierarchy. |
| **Search Filter No Match** | Search query with no match | Displays clean empty state ("No matching nodes found"). |

---

## 4. JSON to TypeScript Generator

| Test Scenario | Sample Input | Expected Behavior |
| :--- | :--- | :--- |
| **Spaces in Root Name** | `rootName: "user profile"` | Sanitized to `export interface UserProfile { ... }`. |
| **Dashes in Root Name** | `rootName: "api-data"` | Sanitized to `export interface ApiData { ... }`. |
| **Reserved TS Keywords** | `rootName: "class"` | Appends safe suffix: `export interface ClassData { ... }`. |
| **Special Property Keys** | `{"kebab-case": 1, "$schema": "x"}` | Escaped: `"kebab-case": number;`, `$schema: string;`. |
| **Arrays of Objects with Sub-Objects** | `[{ a: { name: 'A' } }, { a: { name: 'B', x: 1 } }]` | Recursively merged into a single `interface A` with optional fields. |
| **Nullable Properties in Arrays** | `[{ bio: 'Dev' }, { bio: null }]` | Generates `bio: string \| null;` without duplicate interfaces. |
| **Multi-Dimensional Arrays** | `[[1, 2], [3, 4]]` | Inferred as `type Root = number[][];`. |
| **Transpilation Verification** | Any generated code | Must transpile via `ts.transpileModule` with 0 errors. |

---

## 5. JSON Diff Engine

| Test Scenario | Sample Input | Expected Behavior |
| :--- | :--- | :--- |
| **Shuffled Key Ordering** | `{"a": 1, "b": 2}` vs `{"b": 2, "a": 1}` | Evaluates as `isEqual: true`. |
| **Both Inputs Invalid** | Left & Right both invalid | Both `errorLeft` and `errorRight` are populated simultaneously. |
| **Type Change (Primitive -> Object)** | `{"val": 1}` vs `{"val": {}}` | Recorded as `modified` with old & new values. |
| **Type Change (Null -> Object)** | `{"val": null}` vs `{"val": {}}` | Recorded as `modified`. |
| **Array Additions & Removals** | `[1, 2]` vs `[1, 2, 3]` | Recorded as `added` at path `[2]`. |
| **Array Element Swaps** | `["a", "b"]` vs `["b", "a"]` | Recorded as index modifications at `[0]` and `[1]`. |

---

## 6. Clipboard Operations

| Test Scenario | Conditions | Expected Behavior |
| :--- | :--- | :--- |
| **Standard Modern Copy** | `navigator.clipboard.writeText` succeeds | Resolves `true`, sets `copied = true`. |
| **Permission Denied / Iframe** | `navigator.clipboard.writeText` throws | Falls back to `document.execCommand('copy')` seamlessly. |
| **Empty Input** | Text is `""` | Returns `false` immediately without altering clipboard. |
| **Rapid Successive Clicks** | Clicked multiple times within 2s | Clears prior timeout; resets timer to full duration. |

---

## 7. LocalStorage & Theme Management

| Test Scenario | Conditions | Expected Behavior |
| :--- | :--- | :--- |
| **Saved Light/Dark State** | Key present in `localStorage` | Restores saved mode; applies/removes `.dark` class on root. |
| **First-Time Load (Empty Storage)**| No key in storage | Falls back to `window.matchMedia('(prefers-color-scheme: dark)')`. |
| **Private Browsing / Quota Error** | `localStorage.getItem` throws `SecurityError` | Caught in `try/catch`; falls back gracefully without crashing. |
| **Toggle Storage Write Error** | `localStorage.setItem` throws `SecurityError` | Updates in-memory theme and DOM class without uncaught error. |
