import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { validateJson } from '../lib/validator';
import { formatJson, minifyJson } from '../lib/formatter';
import { buildTree, filterTree } from '../lib/tree';
import { generateTypeScript } from '../lib/typescript-generator';
import { compareJson } from '../lib/diff';

import type { JsonValue } from '../types/json';

/**
 * Utility to verify that generated TypeScript code is syntactically valid
 * using the official TypeScript compiler compiler/parser.
 */
function assertValidTypeScript(code: string) {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: true,
  });

  const syntaxErrors = (result.diagnostics || []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error
  );

  expect(syntaxErrors.length).toBe(0);
}

describe('Comprehensive Edge Cases & Correctness', () => {
  describe('Primitives, Null, and Empty Inputs', () => {
    it('handles JSON null as valid across all utilities', () => {
      // Validator
      const val = validateJson('null');
      expect(val.isValid).toBe(true);
      expect(val.parsed).toBeNull();

      // Formatter & Minifier
      expect(formatJson('null').output).toBe('null');
      expect(minifyJson('null').output).toBe('null');

      // Tree View
      const tree = buildTree(null);
      expect(tree.type).toBe('null');
      expect(tree.value).toBeNull();

      // TypeScript Generator
      const tsGen = generateTypeScript('null');
      expect(tsGen.success).toBe(true);
      expect(tsGen.code).toContain('type Root = null;');
      assertValidTypeScript(tsGen.code);

      // Diff
      const diff = compareJson('null', 'null');
      expect(diff.isEqual).toBe(true);
      const diffDiff = compareJson('null', '42');
      expect(diffDiff.isEqual).toBe(false);
      expect(diffDiff.summary.modified).toBe(1);
    });

    it('handles JSON primitive numbers, booleans, and strings', () => {
      const primitives = ['42', '-3.14', 'true', 'false', '"hello world"'];

      for (const prim of primitives) {
        expect(validateJson(prim).isValid).toBe(true);
        expect(formatJson(prim).success).toBe(true);
        expect(minifyJson(prim).output).toBe(prim);

        const parsed = JSON.parse(prim);
        const tree = buildTree(parsed);
        expect(tree.value).toBe(parsed);

        const tsResult = generateTypeScript(prim);
        expect(tsResult.success).toBe(true);
        assertValidTypeScript(tsResult.code);
      }
    });

    it('handles empty objects {} and empty arrays []', () => {
      // Empty object
      expect(validateJson('{}').isValid).toBe(true);
      expect(formatJson('{}').output).toBe('{}');
      expect(minifyJson('{}').output).toBe('{}');
      const objTree = buildTree({});
      expect(objTree.type).toBe('object');
      expect(objTree.itemCount).toBe(0);
      const objTs = generateTypeScript('{}');
      expect(objTs.success).toBe(true);
      assertValidTypeScript(objTs.code);

      // Empty array
      expect(validateJson('[]').isValid).toBe(true);
      expect(formatJson('[]').output).toBe('[]');
      expect(minifyJson('[]').output).toBe('[]');
      const arrTree = buildTree([]);
      expect(arrTree.type).toBe('array');
      expect(arrTree.itemCount).toBe(0);
      const arrTs = generateTypeScript('[]');
      expect(arrTs.success).toBe(true);
      expect(arrTs.code).toContain('type Root = unknown[];');
      assertValidTypeScript(arrTs.code);

      // Diff empty vs empty
      expect(compareJson('{}', '{}').isEqual).toBe(true);
      expect(compareJson('[]', '[]').isEqual).toBe(true);
      expect(compareJson('{}', '[]').isEqual).toBe(false);
    });

    it('handles whitespace-only and blank inputs properly', () => {
      const blankInputs = ['', '   ', '\n\t  \r\n'];
      for (const blank of blankInputs) {
        expect(validateJson(blank).isValid).toBe(false);
        expect(formatJson(blank).output).toBe('');
        expect(minifyJson(blank).output).toBe('');
        expect(generateTypeScript(blank).success).toBe(false);
      }
    });
  });

  describe('Deep Nesting and Large Payloads', () => {
    it('handles deeply nested structures (15+ levels)', () => {
      let nested: JsonValue = { leaf: 'deep value' };
      for (let i = 0; i < 15; i++) {
        nested = { [`level_${i}`]: nested };
      }
      const jsonStr = JSON.stringify(nested);

      expect(validateJson(jsonStr).isValid).toBe(true);
      expect(formatJson(jsonStr).success).toBe(true);
      expect(minifyJson(jsonStr).success).toBe(true);

      const tree = buildTree(nested);
      expect(tree.type).toBe('object');

      const tsGen = generateTypeScript(jsonStr);
      expect(tsGen.success).toBe(true);
      assertValidTypeScript(tsGen.code);

      // Diff identical deep structures
      expect(compareJson(jsonStr, jsonStr).isEqual).toBe(true);
    });

    it('handles large payloads (500 array items)', () => {
      const items = Array.from({ length: 500 }, (_, i) => ({
        id: i,
        uuid: `item-${i}-${Math.random()}`,
        active: i % 2 === 0,
        tags: [`tag-${i % 5}`, 'generic'],
        metadata: {
          score: i * 1.5,
          notes: i % 10 === 0 ? null : `note ${i}`,
        },
      }));
      const largeJson = JSON.stringify(items);

      expect(validateJson(largeJson).isValid).toBe(true);
      expect(formatJson(largeJson).success).toBe(true);
      expect(minifyJson(largeJson).success).toBe(true);

      const tsGen = generateTypeScript(largeJson);
      expect(tsGen.success).toBe(true);
      assertValidTypeScript(tsGen.code);
    });
  });

  describe('TypeScript Generation Edge Cases', () => {
    it('sanitizes user-provided root names containing spaces, dashes, or reserved words', () => {
      const json = JSON.stringify({ name: 'test' });

      const nameWithSpaces = generateTypeScript(json, { rootName: 'my custom response' });
      expect(nameWithSpaces.code).toContain('interface MyCustomResponse {');
      assertValidTypeScript(nameWithSpaces.code);

      const nameWithDashes = generateTypeScript(json, { rootName: 'api-data-payload' });
      expect(nameWithDashes.code).toContain('interface ApiDataPayload {');
      assertValidTypeScript(nameWithDashes.code);

      const reservedName = generateTypeScript(json, { rootName: 'class' });
      expect(reservedName.code).toContain('interface ClassData {');
      assertValidTypeScript(reservedName.code);
    });

    it('escapes properties with spaces, dashes, quotes, and symbols', () => {
      const json = JSON.stringify({
        'kebab-case-prop': 1,
        'prop with spaces': 'hello',
        'prop"with"quotes': true,
        '$schema': 'https://example.com',
        '123startsWithNum': null,
      });

      const res = generateTypeScript(json);
      expect(res.success).toBe(true);
      expect(res.code).toContain('"kebab-case-prop": number;');
      expect(res.code).toContain('"prop with spaces": string;');
      expect(res.code).toContain('"prop\\"with\\"quotes": boolean;');
      expect(res.code).toContain('$schema: string;');
      expect(res.code).toContain('"123startsWithNum": null;');
      assertValidTypeScript(res.code);
    });

    it('merges object arrays with nested objects into a single clean interface', () => {
      const json = JSON.stringify([
        {
          id: 1,
          author: { name: 'Alice', email: 'alice@test.com' },
        },
        {
          id: 2,
          author: { name: 'Bob', twitter: '@bob' },
        },
      ]);

      const res = generateTypeScript(json);
      expect(res.success).toBe(true);
      // Ensures Author is not duplicated into Author, Author2, Author3
      expect(res.code).toContain('interface Author {');
      expect(res.code).not.toContain('interface Author2 {');
      expect(res.code).toContain('name: string;');
      expect(res.code).toContain('email?: string;');
      expect(res.code).toContain('twitter?: string;');
      assertValidTypeScript(res.code);
    });

    it('handles nullable and optional properties in object arrays', () => {
      const json = JSON.stringify([
        { id: 1, bio: 'Dev', avatar: 'http://img.png' },
        { id: 2, bio: null, avatar: null },
        { id: 3 }, // bio and avatar omitted
      ]);

      const res = generateTypeScript(json);
      expect(res.success).toBe(true);
      expect(res.code).toContain('id: number;');
      expect(res.code).toContain('bio?: string | null;');
      expect(res.code).toContain('avatar?: string | null;');
      assertValidTypeScript(res.code);
    });

    it('handles arrays with mixed primitive and object types', () => {
      const json = JSON.stringify(['string', 123, true, null]);
      const res = generateTypeScript(json);
      expect(res.success).toBe(true);
      expect(res.code).toContain('(string | number | boolean | null)[]');
      assertValidTypeScript(res.code);
    });
  });

  describe('JSON Diff Edge Cases', () => {
    it('considers objects equal even with different key order', () => {
      const left = JSON.stringify({ a: 1, b: 2, c: { x: 'foo', y: 'bar' } });
      const right = JSON.stringify({ c: { y: 'bar', x: 'foo' }, b: 2, a: 1 });

      const res = compareJson(left, right);
      expect(res.isEqual).toBe(true);
      expect(res.summary.added).toBe(0);
      expect(res.summary.removed).toBe(0);
      expect(res.summary.modified).toBe(0);
    });

    it('reports errors on BOTH sides when both inputs are invalid', () => {
      const left = '{ invalid: left, ';
      const right = '{ invalid: right, ';

      const res = compareJson(left, right);
      expect(res.isEqual).toBe(false);
      expect(res.errorLeft).toBeDefined();
      expect(res.errorRight).toBeDefined();
    });

    it('handles array additions, removals, and modifications at specific indices', () => {
      const left = JSON.stringify([10, 20, 30]);
      const right = JSON.stringify([10, 99, 30, 40]);

      const res = compareJson(left, right);
      expect(res.isEqual).toBe(false);
      expect(res.summary.modified).toBe(1); // 20 -> 99 at index [1]
      expect(res.summary.added).toBe(1); // 40 added at index [3]

      const mod = res.changes.find((c) => c.path === '[1]');
      expect(mod?.type).toBe('modified');
      expect(mod?.oldValue).toBe(20);
      expect(mod?.newValue).toBe(99);

      const added = res.changes.find((c) => c.path === '[3]');
      expect(added?.type).toBe('added');
      expect(added?.newValue).toBe(40);
    });
  });

  describe('Tree Viewer Usability & Filtering', () => {
    it('filters nested tree and preserves ancestor hierarchy', () => {
      const data = {
        level1: {
          level2: {
            deepTarget: 'FoundMe',
            other: 'IgnoreMe',
          },
        },
        sibling: {
          skip: true,
        },
      };

      const tree = buildTree(data);
      const filtered = filterTree(tree, 'foundme');
      expect(filtered).not.toBeNull();
      expect(filtered?.key).toBe('root');
      expect(filtered?.children?.length).toBe(1); // level1
      expect(filtered?.children?.[0].key).toBe('level1');
    });
  });
});
