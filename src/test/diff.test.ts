import { describe, it, expect } from 'vitest';
import { compareJson } from '../lib/diff';

describe('compareJson', () => {
  it('returns isEqual: true for identical objects', () => {
    const left = '{"name": "JSON Buddy", "v": 1}';
    const right = '{"name": "JSON Buddy", "v": 1}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(true);
    expect(result.summary.added).toBe(0);
    expect(result.summary.removed).toBe(0);
    expect(result.summary.modified).toBe(0);
  });

  it('detects added keys in right object', () => {
    const left = '{"name": "JSON Buddy"}';
    const right = '{"name": "JSON Buddy", "isNew": true}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.summary.added).toBe(1);
    const added = result.changes.find((c) => c.type === 'added');
    expect(added?.path).toBe('isNew');
    expect(added?.newValue).toBe(true);
  });

  it('detects removed keys in right object', () => {
    const left = '{"name": "JSON Buddy", "deprecated": true}';
    const right = '{"name": "JSON Buddy"}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.summary.removed).toBe(1);
    const removed = result.changes.find((c) => c.type === 'removed');
    expect(removed?.path).toBe('deprecated');
    expect(removed?.oldValue).toBe(true);
  });

  it('detects modified values', () => {
    const left = '{"count": 5}';
    const right = '{"count": 10}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.summary.modified).toBe(1);
    const modified = result.changes.find((c) => c.type === 'modified');
    expect(modified?.path).toBe('count');
    expect(modified?.oldValue).toBe(5);
    expect(modified?.newValue).toBe(10);
  });

  it('detects changes in nested arrays', () => {
    const left = '{"items": [1, 2, 3]}';
    const right = '{"items": [1, 99, 3, 4]}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.summary.modified).toBe(1); // items[1] 2 -> 99
    expect(result.summary.added).toBe(1); // items[3] -> 4
  });

  it('handles invalid left input gracefully', () => {
    const left = '{ bad: json';
    const right = '{"ok": true}';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.errorLeft).toBeDefined();
    expect(result.errorRight).toBeUndefined();
  });

  it('handles invalid right input gracefully', () => {
    const left = '{"ok": true}';
    const right = 'invalid';
    const result = compareJson(left, right);
    expect(result.isEqual).toBe(false);
    expect(result.errorRight).toBeDefined();
    expect(result.errorLeft).toBeUndefined();
  });

  it('handles empty inputs', () => {
    const result = compareJson('', '');
    expect(result.isEqual).toBe(true);
  });
});
