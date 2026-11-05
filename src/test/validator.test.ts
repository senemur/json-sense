import { describe, it, expect } from 'vitest';
import { validateJson } from '../lib/validator';

describe('validateJson', () => {
  it('returns valid for valid JSON object', () => {
    const input = '{"name": "JsonSense", "stars": 100, "active": true}';
    const result = validateJson(input);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.parsed).toEqual({ name: 'JsonSense', stars: 100, active: true });
  });

  it('returns valid for valid arrays and primitives', () => {
    expect(validateJson('[1, 2, "three", null]').isValid).toBe(true);
    expect(validateJson('"a string"').isValid).toBe(true);
    expect(validateJson('42').isValid).toBe(true);
    expect(validateJson('true').isValid).toBe(true);
    expect(validateJson('null').isValid).toBe(true);
  });

  it('handles empty or whitespace-only input gracefully', () => {
    const emptyResult = validateJson('');
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.error).toContain('empty');

    const spacesResult = validateJson('   \n\t  ');
    expect(spacesResult.isValid).toBe(false);
    expect(spacesResult.error).toContain('empty');
  });

  it('detects syntax errors and extracts line and column', () => {
    const invalidJson = '{\n  "name": "Senem",\n  "invalid": ,\n}';
    const result = validateJson(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.line).toBeDefined();
    expect(result.column).toBeDefined();
    expect(result.snippet).toBeDefined();
  });

  it('does not leak raw stack traces', () => {
    const invalidJson = '{"broken": [1, 2, }';
    const result = validateJson(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.error).not.toContain('at JSON.parse');
    expect(result.error).not.toContain('.js:');
  });

  it('handles complex nested JSON properly', () => {
    const nested = JSON.stringify({
      user: {
        id: 1,
        profiles: [{ platform: 'github', username: 'senemur' }],
        preferences: { theme: 'dark', notifications: null },
      },
    });
    const result = validateJson(nested);
    expect(result.isValid).toBe(true);
    expect(result.parsed).toBeDefined();
  });
});
