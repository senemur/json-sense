import type { JsonValue, DiffResult, DiffEntry } from '../types/json';
import { validateJson } from './validator';

/**
 * Deeply compares two JSON strings, computing granular differences for objects, arrays, and primitives.
 */
export function compareJson(leftInput: string, rightInput: string): DiffResult {
  const leftTrimmed = leftInput.trim();
  const rightTrimmed = rightInput.trim();

  const emptySummary = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  if (!leftTrimmed && !rightTrimmed) {
    return {
      isEqual: true,
      changes: [],
      summary: emptySummary,
    };
  }

  const leftVal = validateJson(leftInput);
  const rightVal = validateJson(rightInput);

  if (!leftVal.isValid || leftVal.parsed === undefined) {
    return {
      isEqual: false,
      changes: [],
      summary: emptySummary,
      errorLeft: leftVal.error || 'Left JSON is invalid',
    };
  }

  if (!rightVal.isValid || rightVal.parsed === undefined) {
    return {
      isEqual: false,
      changes: [],
      summary: emptySummary,
      errorRight: rightVal.error || 'Right JSON is invalid',
    };
  }

  const changes: DiffEntry[] = [];
  diffValues(leftVal.parsed, rightVal.parsed, '', changes);

  const summary = {
    added: changes.filter((c) => c.type === 'added').length,
    removed: changes.filter((c) => c.type === 'removed').length,
    modified: changes.filter((c) => c.type === 'modified').length,
    unchanged: changes.filter((c) => c.type === 'unchanged').length,
  };

  const isEqual = summary.added === 0 && summary.removed === 0 && summary.modified === 0;

  return {
    isEqual,
    changes,
    summary,
  };
}

function diffValues(
  left: JsonValue | undefined,
  right: JsonValue | undefined,
  path: string,
  changes: DiffEntry[]
): void {
  // Case 1: Left undefined -> added
  if (left === undefined && right !== undefined) {
    changes.push({
      path: path || 'root',
      type: 'added',
      newValue: right,
    });
    return;
  }

  // Case 2: Right undefined -> removed
  if (left !== undefined && right === undefined) {
    changes.push({
      path: path || 'root',
      type: 'removed',
      oldValue: left,
    });
    return;
  }

  // Both defined:
  // Case 3: Both null
  if (left === null && right === null) {
    changes.push({ path: path || 'root', type: 'unchanged', oldValue: left, newValue: right });
    return;
  }

  // Case 4: Either null or different types
  if (left === null || right === null || typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
    changes.push({
      path: path || 'root',
      type: 'modified',
      oldValue: left,
      newValue: right,
    });
    return;
  }

  // Case 5: Both arrays
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      diffValues(left[i], right[i], itemPath, changes);
    }
    return;
  }

  // Case 6: Both objects
  if (typeof left === 'object' && typeof right === 'object') {
    const leftObj = left as { [key: string]: JsonValue };
    const rightObj = right as { [key: string]: JsonValue };

    const allKeys = Array.from(new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]));

    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key;
      diffValues(leftObj[key], rightObj[key], keyPath, changes);
    }
    return;
  }

  // Case 7: Primitives
  if (left === right) {
    changes.push({
      path: path || 'root',
      type: 'unchanged',
      oldValue: left,
      newValue: right,
    });
  } else {
    changes.push({
      path: path || 'root',
      type: 'modified',
      oldValue: left,
      newValue: right,
    });
  }
}
