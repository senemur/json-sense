import type {
  JsonValue,
  InspectorResult,
  InspectorStats,
  InspectorFinding,
  InspectorCategory,
  InspectorSeverity,
} from '../types/json';
import { validateJson } from './validator';

/**
 * Builds standard JSONPath notation for a property or array index.
 * Example outputs:
 * - root: '$'
 * - property: '$.users'
 * - array index: '$.users[0]'
 * - nested property: '$.users[0].id'
 * - special keys with spaces/dashes: '$["special key"]' or '$.users[0]["role-name"]'
 */
export function formatJsonPath(parentPath: string, keyOrIndex: string | number): string {
  if (typeof keyOrIndex === 'number') {
    return `${parentPath}[${keyOrIndex}]`;
  }

  const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyOrIndex);
  if (parentPath === '$') {
    return isValidIdentifier ? `$.${keyOrIndex}` : `$["${keyOrIndex.replace(/"/g, '\\"')}"]`;
  }

  return isValidIdentifier
    ? `${parentPath}.${keyOrIndex}`
    : `${parentPath}["${keyOrIndex.replace(/"/g, '\\"')}"]`;
}

/**
 * Resolves the precise JSON type of a value.
 */
export function getJsonType(val: JsonValue): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

/**
 * Pure inspection function that analyzes JSON structure and data quality.
 * Deterministic, non-mutating, and operates completely in-memory.
 */
export function inspectJson(input: string | JsonValue): InspectorResult {
  let parsed: JsonValue;
  let byteSize: number;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        isValid: false,
        error: 'JSON input is empty. Enter valid JSON to inspect structure and quality.',
        stats: createEmptyStats(0),
        findings: [],
        summary: { totalFindings: 0, warningCount: 0, infoCount: 0, qualityScore: 100 },
      };
    }

    const validation = validateJson(input);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error || 'Invalid JSON syntax. Inspector requires valid JSON.',
        stats: createEmptyStats(0),
        findings: [],
        summary: { totalFindings: 0, warningCount: 0, infoCount: 0, qualityScore: 100 },
      };
    }

    try {
      parsed = JSON.parse(input);
      byteSize = new TextEncoder().encode(input).length;
    } catch (e) {
      return {
        isValid: false,
        error: e instanceof Error ? e.message : 'Failed to parse JSON.',
        stats: createEmptyStats(0),
        findings: [],
        summary: { totalFindings: 0, warningCount: 0, infoCount: 0, qualityScore: 100 },
      };
    }
  } else {
    parsed = input;
    try {
      byteSize = new TextEncoder().encode(JSON.stringify(input)).length;
    } catch {
      byteSize = 0;
    }
  }

  // Structural statistics collectors
  let totalObjects = 0;
  let totalArrays = 0;
  let totalProperties = 0;
  const distinctKeys = new Set<string>();
  let stringCount = 0;
  let numberCount = 0;
  let booleanCount = 0;
  let nullCount = 0;
  let totalValues = 0;
  let maxDepth = 0;
  let longestArray: { path: string; length: number } | null = null;
  let largestObject: { path: string; propertyCount: number } | null = null;

  // Findings collector
  const findings: InspectorFinding[] = [];
  let findingCounter = 0;

  const addFinding = (
    category: InspectorCategory,
    severity: InspectorSeverity,
    path: string,
    message: string,
    details?: string,
    valueSummary?: string
  ) => {
    findingCounter++;
    findings.push({
      id: `finding-${findingCounter}-${category}`,
      category,
      severity,
      path,
      message,
      details,
      valueSummary,
    });
  };

  // Traversal & Analysis
  const traverse = (val: JsonValue, path: string, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    totalValues++;

    // 1. Primitive Values
    if (val === null) {
      nullCount++;
      addFinding('null-value', 'info', path, `Property has null value`, 'null values may be intentional or indicate unpopulated fields.', 'null');
      return;
    }

    if (typeof val === 'string') {
      stringCount++;
      if (val === '') {
        addFinding('empty-value', 'info', path, `String property is empty ""`, 'Empty strings may represent missing data.', '""');
      }
      return;
    }

    if (typeof val === 'number') {
      numberCount++;
      return;
    }

    if (typeof val === 'boolean') {
      booleanCount++;
      return;
    }

    // 2. Arrays
    if (Array.isArray(val)) {
      totalArrays++;
      if (longestArray === null || val.length > longestArray.length) {
        longestArray = { path, length: val.length };
      }

      if (val.length === 0) {
        addFinding('empty-container', 'info', path, `Array is empty []`, 'Empty array contains no elements.', '[]');
        return;
      }

      // Check for duplicate primitive elements in array
      const seenPrimitives = new Map<string, number>();
      val.forEach((item, idx) => {
        if (item === null || typeof item !== 'object') {
          const key = `${typeof item}:${String(item)}`;
          if (seenPrimitives.has(key)) {
            const firstIdx = seenPrimitives.get(key)!;
            addFinding(
              'duplicate-value',
              'info',
              formatJsonPath(path, idx),
              `Duplicate value ${JSON.stringify(item)} in array`,
              `Identical value was first seen at index [${firstIdx}].`,
              JSON.stringify(item)
            );
          } else {
            seenPrimitives.set(key, idx);
          }
        }
      });

      // Check for mixed primitive types in array
      const primitiveTypes = new Set(
        val
          .filter((item) => item !== null && typeof item !== 'object')
          .map((item) => typeof item)
      );
      if (primitiveTypes.size > 1) {
        const typesList = Array.from(primitiveTypes).join(', ');
        addFinding(
          'type-inconsistency',
          'warning',
          path,
          `Array contains mixed primitive types: [${typesList}]`,
          `Homogeneous arrays are typically expected for API collections.`
        );
      }

      // Check for object collections: schema and type consistency across rows/records
      const objectElements: Array<{ obj: Record<string, JsonValue>; index: number; path: string }> = [];
      val.forEach((item, idx) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          objectElements.push({
            obj: item as Record<string, JsonValue>,
            index: idx,
            path: formatJsonPath(path, idx),
          });
        }
      });

      if (objectElements.length > 1) {
        // Collect property sets and types across all objects in this array
        const propTypesMap = new Map<
          string,
          Map<string, Array<{ index: number; path: string; val: JsonValue }>>
        >();
        const allKeysSet = new Set<string>();

        objectElements.forEach(({ obj, index, path: objPath }) => {
          Object.keys(obj).forEach((key) => {
            allKeysSet.add(key);
            const valType = getJsonType(obj[key]);
            if (!propTypesMap.has(key)) {
              propTypesMap.set(key, new Map());
            }
            const typeGroup = propTypesMap.get(key)!;
            if (!typeGroup.has(valType)) {
              typeGroup.set(valType, []);
            }
            typeGroup.get(valType)!.push({ index, path: formatJsonPath(objPath, key), val: obj[key] });
          });
        });

        // 1. Detect type inconsistencies across objects for the same property
        propTypesMap.forEach((typeGroup, propKey) => {
          // Consider non-null distinct types (e.g. number vs string)
          const nonNullTypes = Array.from(typeGroup.keys()).filter((t) => t !== 'null');
          if (nonNullTypes.length > 1) {
            // Determine primary type (the most frequent non-null type)
            let primaryType = nonNullTypes[0];
            let maxCount = -1;
            nonNullTypes.forEach((t) => {
              const count = typeGroup.get(t)!.length;
              if (count > maxCount) {
                maxCount = count;
                primaryType = t;
              }
            });

            // Report warnings on the deviating items
            nonNullTypes.forEach((t) => {
              if (t !== primaryType) {
                const deviations = typeGroup.get(t)!;
                deviations.forEach((item) => {
                  addFinding(
                    'type-inconsistency',
                    'warning',
                    item.path,
                    `Type inconsistency for property '${propKey}': found '${t}', but expected '${primaryType}'`,
                    `Earlier or majority records in this array have type '${primaryType}'.`,
                    String(item.val)
                  );
                });
              }
            });
          }
        });

        // 2. Detect schema inconsistency (missing properties across records)
        objectElements.forEach(({ obj, index, path: objPath }) => {
          const currentKeys = new Set(Object.keys(obj));
          allKeysSet.forEach((key) => {
            if (!currentKeys.has(key)) {
              addFinding(
                'schema-inconsistency',
                'info',
                objPath,
                `Record at index [${index}] is missing property '${key}'`,
                `Property '${key}' is present in other records within the same array collection.`
              );
            }
          });
        });

        // 3. Detect duplicate identifiers (id, uuid, key, code) across object records
        const identifierKeys = ['id', 'uuid', 'key', 'code', 'userId', 'itemId'];
        identifierKeys.forEach((idKey) => {
          const seenIds = new Map<string, { path: string; index: number }>();
          objectElements.forEach(({ obj, index, path: objPath }) => {
            if (idKey in obj) {
              const idVal = obj[idKey];
              if (idVal !== null && typeof idVal !== 'object') {
                const idStr = String(idVal);
                const fieldPath = formatJsonPath(objPath, idKey);
                if (seenIds.has(idStr)) {
                  const firstSeen = seenIds.get(idStr)!;
                  addFinding(
                    'duplicate-value',
                    'warning',
                    fieldPath,
                    `Duplicate identifier '${idKey}=${idStr}'`,
                    `Same identifier was first observed at ${firstSeen.path} (index [${firstSeen.index}]).`,
                    idStr
                  );
                } else {
                  seenIds.set(idStr, { path: fieldPath, index });
                }
              }
            }
          });
        });
      }

      // Recurse into array elements
      val.forEach((item, idx) => {
        traverse(item, formatJsonPath(path, idx), depth + 1);
      });
      return;
    }

    // 3. Objects
    if (typeof val === 'object') {
      totalObjects++;
      const keys = Object.keys(val);
      totalProperties += keys.length;
      keys.forEach((k) => distinctKeys.add(k));

      if (largestObject === null || keys.length > largestObject.propertyCount) {
        largestObject = { path, propertyCount: keys.length };
      }

      if (keys.length === 0) {
        addFinding('empty-container', 'info', path, `Object is empty {}`, 'Empty object contains no key-value pairs.', '{}');
        return;
      }

      // Recurse into object properties
      keys.forEach((k) => {
        traverse((val as Record<string, JsonValue>)[k], formatJsonPath(path, k), depth + 1);
      });
    }
  };

  // Begin traversal at root '$'
  traverse(parsed, '$', 1);

  // Summary and Quality Score calculation
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const infoCount = findings.filter((f) => f.severity === 'info').length;

  // Formula: start at 100, warnings deduct 8 pts, infos deduct 2 pts, floor at 0
  const qualityScore = Math.max(0, Math.min(100, 100 - (warningCount * 8 + infoCount * 2)));

  const stats: InspectorStats = {
    totalObjects,
    totalArrays,
    totalProperties,
    distinctKeysCount: distinctKeys.size,
    stringCount,
    numberCount,
    booleanCount,
    nullCount,
    totalValues,
    maxDepth,
    longestArray,
    largestObject,
    byteSize,
  };

  return {
    isValid: true,
    stats,
    findings,
    summary: {
      totalFindings: findings.length,
      warningCount,
      infoCount,
      qualityScore,
    },
  };
}

function createEmptyStats(byteSize = 0): InspectorStats {
  return {
    totalObjects: 0,
    totalArrays: 0,
    totalProperties: 0,
    distinctKeysCount: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
    totalValues: 0,
    maxDepth: 0,
    longestArray: null,
    largestObject: null,
    byteSize,
  };
}
