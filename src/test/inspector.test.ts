import { describe, it, expect } from 'vitest';
import { inspectJson, formatJsonPath, getJsonType } from '../lib/inspector';
import type { JsonValue } from '../types/json';

describe('JSON Inspector Engine', () => {
  it('analyzes the prompt user example accurately', () => {
    const input = JSON.stringify(
      {
        users: [
          {
            id: 1,
            name: 'Senem',
            email: 'senem@example.com',
          },
          {
            id: '2',
            name: '',
            email: null,
          },
        ],
      },
      null,
      2
    );

    const result = inspectJson(input);

    expect(result.isValid).toBe(true);
    expect(result.stats.totalObjects).toBe(3); // root, users[0], users[1]
    expect(result.stats.totalArrays).toBe(1);
    expect(result.stats.totalProperties).toBe(7); // users + 3 + 3
    expect(result.stats.stringCount).toBe(4);
    expect(result.stats.numberCount).toBe(1);
    expect(result.stats.nullCount).toBe(1);
    expect(result.stats.booleanCount).toBe(0);
    expect(result.stats.longestArray?.path).toBe('$.users');
    expect(result.stats.longestArray?.length).toBe(2);

    // Verify findings
    const typeInconsistencies = result.findings.filter((f) => f.category === 'type-inconsistency');
    expect(typeInconsistencies.length).toBeGreaterThanOrEqual(1);
    expect(typeInconsistencies.some((f) => f.path === '$.users[1].id')).toBe(true);

    const emptyValues = result.findings.filter((f) => f.category === 'empty-value');
    expect(emptyValues.some((f) => f.path === '$.users[1].name')).toBe(true);

    const nullValues = result.findings.filter((f) => f.category === 'null-value');
    expect(nullValues.some((f) => f.path === '$.users[1].email')).toBe(true);

    expect(result.summary.warningCount).toBeGreaterThanOrEqual(1);
    expect(result.summary.infoCount).toBeGreaterThanOrEqual(2);
  });

  it('handles primitive root values gracefully', () => {
    const strResult = inspectJson('"Hello world"');
    expect(strResult.isValid).toBe(true);
    expect(strResult.stats.stringCount).toBe(1);
    expect(strResult.stats.totalObjects).toBe(0);
    expect(strResult.stats.totalArrays).toBe(0);
    expect(strResult.stats.maxDepth).toBe(1);

    const numResult = inspectJson('12345');
    expect(numResult.isValid).toBe(true);
    expect(numResult.stats.numberCount).toBe(1);

    const boolResult = inspectJson('true');
    expect(boolResult.isValid).toBe(true);
    expect(boolResult.stats.booleanCount).toBe(1);

    const nullResult = inspectJson('null');
    expect(nullResult.isValid).toBe(true);
    expect(nullResult.stats.nullCount).toBe(1);
    expect(nullResult.findings.some((f) => f.category === 'null-value')).toBe(true);
  });

  it('handles empty object and empty array', () => {
    const emptyObj = inspectJson('{}');
    expect(emptyObj.isValid).toBe(true);
    expect(emptyObj.stats.totalObjects).toBe(1);
    expect(emptyObj.stats.totalProperties).toBe(0);
    expect(emptyObj.findings.some((f) => f.category === 'empty-container' && f.path === '$')).toBe(true);

    const emptyArr = inspectJson('[]');
    expect(emptyArr.isValid).toBe(true);
    expect(emptyArr.stats.totalArrays).toBe(1);
    expect(emptyArr.findings.some((f) => f.category === 'empty-container' && f.path === '$')).toBe(true);
  });

  it('detects mixed primitive types in arrays', () => {
    const input = JSON.stringify([1, 'two', 3, true]);
    const result = inspectJson(input);

    expect(result.isValid).toBe(true);
    const mixed = result.findings.find((f) => f.category === 'type-inconsistency' && f.path === '$');
    expect(mixed).toBeDefined();
    expect(mixed?.severity).toBe('warning');
  });

  it('detects duplicate values in primitive arrays', () => {
    const input = JSON.stringify(['apple', 'banana', 'apple', 'orange', 'banana']);
    const result = inspectJson(input);

    expect(result.isValid).toBe(true);
    const dupes = result.findings.filter((f) => f.category === 'duplicate-value');
    expect(dupes.length).toBe(2);
    expect(dupes.some((f) => f.path === '$[2]')).toBe(true); // second apple
    expect(dupes.some((f) => f.path === '$[4]')).toBe(true); // second banana
  });

  it('detects schema inconsistencies (missing properties) across objects in array', () => {
    const input = JSON.stringify({
      records: [
        { id: 1, title: 'Item 1', active: true, extra: 'bonus' },
        { id: 2, title: 'Item 2', active: false },
        { id: 3, title: 'Item 3' },
      ],
    });

    const result = inspectJson(input);
    expect(result.isValid).toBe(true);

    const schemaFindings = result.findings.filter((f) => f.category === 'schema-inconsistency');
    expect(schemaFindings.length).toBeGreaterThanOrEqual(2);
    expect(schemaFindings.some((f) => f.path === '$.records[1]' && f.message.includes('extra'))).toBe(true);
    expect(schemaFindings.some((f) => f.path === '$.records[2]' && f.message.includes('active'))).toBe(true);
  });

  it('detects duplicate identifier keys across objects in array', () => {
    const input = JSON.stringify({
      items: [
        { id: 101, name: 'First' },
        { id: 102, name: 'Second' },
        { id: 101, name: 'Third' }, // Duplicate ID!
      ],
    });

    const result = inspectJson(input);
    expect(result.isValid).toBe(true);

    const idDupe = result.findings.find(
      (f) => f.category === 'duplicate-value' && f.path === '$.items[2].id'
    );
    expect(idDupe).toBeDefined();
    expect(idDupe?.severity).toBe('warning');
    expect(idDupe?.message).toContain('Duplicate identifier');
  });

  it('accurately calculates max nesting depth', () => {
    // 5 levels: root -> a -> b -> c -> d
    const input = JSON.stringify({
      a: {
        b: {
          c: {
            d: 'deep value',
          },
        },
      },
    });

    const result = inspectJson(input);
    expect(result.isValid).toBe(true);
    expect(result.stats.maxDepth).toBe(5);
  });

  it('supports deeply nested structures without crashing', () => {
    let deep: JsonValue = { leaf: 'bottom' };
    for (let i = 0; i < 20; i++) {
      deep = { level: deep };
    }

    const result = inspectJson(deep);
    expect(result.isValid).toBe(true);
    expect(result.stats.maxDepth).toBe(22);
  });

  it('handles large JSON datasets efficiently', () => {
    const largeList = Array.from({ length: 1500 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      score: i * 10,
      active: i % 2 === 0,
    }));

    const start = performance.now();
    const result = inspectJson({ data: largeList });
    const duration = performance.now() - start;

    expect(result.isValid).toBe(true);
    expect(result.stats.totalObjects).toBe(1501);
    expect(result.stats.totalValues).toBeGreaterThan(6000);
    expect(duration).toBeLessThan(500); // Must be fast
  });

  it('is completely deterministic: identical input yields identical result', () => {
    const input = JSON.stringify({
      users: [
        { id: 1, name: 'Senem', tags: ['a', 'b', 'a'] },
        { id: '2', name: '', tags: [] },
      ],
    });

    const run1 = inspectJson(input);
    const run2 = inspectJson(input);

    expect(run1).toEqual(run2);
  });

  it('does not mutate the original input object', () => {
    const original = {
      nested: {
        array: [1, 2, { a: 'b' }],
      },
    };
    const cloned = JSON.parse(JSON.stringify(original));

    inspectJson(original);

    expect(original).toEqual(cloned);
  });

  it('rejects invalid JSON string safely with error', () => {
    const result = inspectJson('{ invalid json,');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.stats.totalObjects).toBe(0);
    expect(result.findings).toHaveLength(0);
  });

  it('rejects empty input safely', () => {
    const result = inspectJson('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('empty');
  });

  describe('formatJsonPath helper', () => {
    it('formats identifiers and array indices cleanly', () => {
      expect(formatJsonPath('$', 'users')).toBe('$.users');
      expect(formatJsonPath('$.users', 0)).toBe('$.users[0]');
      expect(formatJsonPath('$.users[0]', 'id')).toBe('$.users[0].id');
    });

    it('brackets keys with special characters (spaces, dashes, quotes)', () => {
      expect(formatJsonPath('$', 'first name')).toBe('$["first name"]');
      expect(formatJsonPath('$.data', 'user-id')).toBe('$.data["user-id"]');
      expect(formatJsonPath('$.data', 'a.b')).toBe('$.data["a.b"]');
    });
  });

  describe('getJsonType helper', () => {
    it('identifies types accurately', () => {
      expect(getJsonType(null)).toBe('null');
      expect(getJsonType([])).toBe('array');
      expect(getJsonType({})).toBe('object');
      expect(getJsonType('text')).toBe('string');
      expect(getJsonType(42)).toBe('number');
      expect(getJsonType(true)).toBe('boolean');
    });
  });
});
