import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, getJsonStats } from '../lib/formatter';

describe('formatJson', () => {
  it('formats valid JSON with default 2 spaces', () => {
    const raw = '{"a":1,"b":[2,3]}';
    const result = formatJson(raw);
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('formats valid JSON with 4 spaces', () => {
    const raw = '{"a":1}';
    const result = formatJson(raw, { indent: 4 });
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n    "a": 1\n}');
  });

  it('formats valid JSON with tab indentation', () => {
    const raw = '{"a":1}';
    const result = formatJson(raw, { indent: '\t' });
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n\t"a": 1\n}');
  });

  it('handles empty input gracefully', () => {
    const result = formatJson('');
    expect(result.success).toBe(true);
    expect(result.output).toBe('');
  });

  it('preserves original input when JSON is invalid', () => {
    const invalid = '{ broken: json';
    const result = formatJson(invalid);
    expect(result.success).toBe(false);
    expect(result.output).toBe(invalid);
    expect(result.error).toBeDefined();
  });
});

describe('minifyJson', () => {
  it('minifies multiline formatted JSON', () => {
    const formatted = '{\n  "name": "JsonSense",\n  "version": 1\n}';
    const result = minifyJson(formatted);
    expect(result.success).toBe(true);
    expect(result.output).toBe('{"name":"JsonSense","version":1}');
  });

  it('handles empty input gracefully', () => {
    const result = minifyJson('   ');
    expect(result.success).toBe(true);
    expect(result.output).toBe('');
  });

  it('preserves original input when minifying invalid JSON', () => {
    const invalid = '{"unclosed": "string}';
    const result = minifyJson(invalid);
    expect(result.success).toBe(false);
    expect(result.output).toBe(invalid);
    expect(result.error).toBeDefined();
  });
});

describe('getJsonStats', () => {
  it('calculates characters, lines, and bytes', () => {
    const text = '{\n  "hello": "world"\n}';
    const stats = getJsonStats(text);
    expect(stats.chars).toBe(text.length);
    expect(stats.lines).toBe(3);
    expect(stats.bytes).toBeGreaterThan(0);
  });
});
