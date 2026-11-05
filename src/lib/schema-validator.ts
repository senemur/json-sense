import type { JsonValue, SchemaValidationError, SchemaValidationResult } from '../types/json';
import { formatJsonPath } from './inspector';

function getExactJsonType(val: JsonValue): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'integer' : 'number';
  }
  return typeof val;
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, k)) return false;
    if (!isDeepEqual(objA[k], objB[k])) return false;
  }
  return true;
}

function checkTypeMatch(val: JsonValue, expectedType: string): boolean {
  if (expectedType === 'null') return val === null;
  if (expectedType === 'string') return typeof val === 'string';
  if (expectedType === 'boolean') return typeof val === 'boolean';
  if (expectedType === 'array') return Array.isArray(val);
  if (expectedType === 'object') {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }
  if (expectedType === 'integer') {
    return typeof val === 'number' && Number.isInteger(val);
  }
  if (expectedType === 'number') {
    return typeof val === 'number' && !Number.isNaN(val);
  }
  return true;
}

/**
 * Validates a single JSON value node against a subschema.
 */
function validateNode(
  data: JsonValue,
  schema: unknown,
  path: string,
  errors: SchemaValidationError[]
): void {
  // Boolean schemas (Draft-07 specification)
  if (typeof schema === 'boolean') {
    if (!schema) {
      errors.push({
        path,
        keyword: 'false',
        message: 'Schema is false; all values are rejected at this path.',
        expected: 'valid schema',
        received: 'false schema',
      });
    }
    return;
  }

  if (typeof schema !== 'object' || schema === null) {
    return;
  }

  const s = schema as Record<string, unknown>;

  // 1. Validate `type`
  if (s.type) {
    if (typeof s.type === 'string') {
      if (!checkTypeMatch(data, s.type)) {
        const actualType = getExactJsonType(data);
        errors.push({
          path,
          keyword: 'type',
          message: `Expected type "${s.type}", but received "${actualType}".`,
          expected: s.type,
          received: actualType,
        });
        return; // Stop deeper validation for mismatched type
      }
    } else if (Array.isArray(s.type)) {
      const allowedTypes = s.type as string[];
      const matched = allowedTypes.some((t) => checkTypeMatch(data, t));
      if (!matched) {
        const actualType = getExactJsonType(data);
        errors.push({
          path,
          keyword: 'type',
          message: `Expected one of types [${allowedTypes.join(', ')}], but received "${actualType}".`,
          expected: allowedTypes.join(' | '),
          received: actualType,
        });
        return;
      }
    }
  }

  // 2. Validate `enum`
  if (Array.isArray(s.enum)) {
    const matched = s.enum.some((item) => isDeepEqual(item, data));
    if (!matched) {
      errors.push({
        path,
        keyword: 'enum',
        message: `Value does not match any of the allowed enum values: ${s.enum.map((v) => JSON.stringify(v)).join(', ')}.`,
        expected: s.enum.map((v) => JSON.stringify(v)).join(', '),
        received: JSON.stringify(data),
      });
    }
  }

  // 3. Validate `const`
  if ('const' in s) {
    if (!isDeepEqual(s.const, data)) {
      errors.push({
        path,
        keyword: 'const',
        message: `Value must equal const ${JSON.stringify(s.const)}.`,
        expected: JSON.stringify(s.const),
        received: JSON.stringify(data),
      });
    }
  }

  // 4. String constraints
  if (typeof data === 'string') {
    if (typeof s.minLength === 'number' && data.length < s.minLength) {
      errors.push({
        path,
        keyword: 'minLength',
        message: `String length (${data.length}) is shorter than minimum allowed length (${s.minLength}).`,
        expected: `>= ${s.minLength}`,
        received: `${data.length}`,
      });
    }
    if (typeof s.maxLength === 'number' && data.length > s.maxLength) {
      errors.push({
        path,
        keyword: 'maxLength',
        message: `String length (${data.length}) exceeds maximum allowed length (${s.maxLength}).`,
        expected: `<= ${s.maxLength}`,
        received: `${data.length}`,
      });
    }
    if (typeof s.pattern === 'string') {
      try {
        const regex = new RegExp(s.pattern);
        if (!regex.test(data)) {
          errors.push({
            path,
            keyword: 'pattern',
            message: `String does not match pattern "${s.pattern}".`,
            expected: s.pattern,
            received: data,
          });
        }
      } catch {
        // Ignore invalid regex patterns in user schema
      }
    }
  }

  // 5. Number constraints
  if (typeof data === 'number') {
    if (typeof s.minimum === 'number' && data < s.minimum) {
      errors.push({
        path,
        keyword: 'minimum',
        message: `Number ${data} is less than minimum ${s.minimum}.`,
        expected: `>= ${s.minimum}`,
        received: `${data}`,
      });
    }
    if (typeof s.maximum === 'number' && data > s.maximum) {
      errors.push({
        path,
        keyword: 'maximum',
        message: `Number ${data} is greater than maximum ${s.maximum}.`,
        expected: `<= ${s.maximum}`,
        received: `${data}`,
      });
    }
  }

  // 6. Array constraints & items
  if (Array.isArray(data)) {
    if (typeof s.minItems === 'number' && data.length < s.minItems) {
      errors.push({
        path,
        keyword: 'minItems',
        message: `Array has ${data.length} items, but minimum required is ${s.minItems}.`,
        expected: `>= ${s.minItems}`,
        received: `${data.length}`,
      });
    }
    if (typeof s.maxItems === 'number' && data.length > s.maxItems) {
      errors.push({
        path,
        keyword: 'maxItems',
        message: `Array has ${data.length} items, exceeding maximum allowed of ${s.maxItems}.`,
        expected: `<= ${s.maxItems}`,
        received: `${data.length}`,
      });
    }

    if (s.items) {
      if (typeof s.items === 'object' && !Array.isArray(s.items)) {
        data.forEach((item, idx) => {
          validateNode(item, s.items, formatJsonPath(path, idx), errors);
        });
      } else if (Array.isArray(s.items)) {
        // Tuple validation
        const tupleSchemas = s.items as unknown[];
        data.forEach((item, idx) => {
          if (idx < tupleSchemas.length) {
            validateNode(item, tupleSchemas[idx], formatJsonPath(path, idx), errors);
          } else if (s.additionalItems === false) {
            errors.push({
              path: formatJsonPath(path, idx),
              keyword: 'additionalItems',
              message: `Additional array item at index ${idx} is not allowed.`,
              expected: `length <= ${tupleSchemas.length}`,
              received: `item at index ${idx}`,
            });
          } else if (typeof s.additionalItems === 'object' && s.additionalItems !== null) {
            validateNode(item, s.additionalItems, formatJsonPath(path, idx), errors);
          }
        });
      }
    }
  }

  // 7. Object constraints & properties
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, JsonValue>;

    // Required fields check
    if (Array.isArray(s.required)) {
      const requiredKeys = s.required as string[];
      requiredKeys.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] === undefined) {
          errors.push({
            path: formatJsonPath(path, key),
            keyword: 'required',
            message: `Missing required property "${key}".`,
            expected: 'property to be defined',
            received: 'missing',
          });
        }
      });
    }

    // Properties check
    const propSchemas =
      typeof s.properties === 'object' && s.properties !== null
        ? (s.properties as Record<string, unknown>)
        : {};

    Object.keys(obj).forEach((propKey) => {
      const propValue = obj[propKey];
      const propPath = formatJsonPath(path, propKey);

      if (Object.prototype.hasOwnProperty.call(propSchemas, propKey)) {
        validateNode(propValue, propSchemas[propKey], propPath, errors);
      } else if (s.additionalProperties === false) {
        errors.push({
          path: propPath,
          keyword: 'additionalProperties',
          message: `Additional property "${propKey}" is not allowed.`,
          expected: 'no additional properties',
          received: propKey,
        });
      } else if (typeof s.additionalProperties === 'object' && s.additionalProperties !== null) {
        validateNode(propValue, s.additionalProperties, propPath, errors);
      }
    });
  }

  // 8. Logical combinators
  if (Array.isArray(s.anyOf)) {
    const branches = s.anyOf as unknown[];
    const anyMatches = branches.some((branchSchema) => {
      const branchErrors: SchemaValidationError[] = [];
      validateNode(data, branchSchema, path, branchErrors);
      return branchErrors.length === 0;
    });

    if (!anyMatches) {
      errors.push({
        path,
        keyword: 'anyOf',
        message: 'Value does not match any of the allowed schemas defined in anyOf.',
        expected: 'match at least one branch',
        received: 'no branches matched',
      });
    }
  }

  if (Array.isArray(s.oneOf)) {
    const branches = s.oneOf as unknown[];
    const matchCount = branches.filter((branchSchema) => {
      const branchErrors: SchemaValidationError[] = [];
      validateNode(data, branchSchema, path, branchErrors);
      return branchErrors.length === 0;
    }).length;

    if (matchCount !== 1) {
      errors.push({
        path,
        keyword: 'oneOf',
        message: `Value must match exactly one schema in oneOf, but matched ${matchCount}.`,
        expected: 'exactly 1 branch match',
        received: `${matchCount} matches`,
      });
    }
  }

  if (Array.isArray(s.allOf)) {
    const branches = s.allOf as unknown[];
    branches.forEach((branchSchema) => {
      validateNode(data, branchSchema, path, errors);
    });
  }
}

/**
 * Validates a target JSON data value against a JSON Schema.
 * Pure function, zero dependencies, in-browser.
 */
export function validateAgainstSchema(
  data: JsonValue,
  schemaInput: unknown | string
): SchemaValidationResult {
  let schemaObj: unknown = schemaInput;

  if (typeof schemaInput === 'string') {
    const trimmed = schemaInput.trim();
    if (!trimmed) {
      return {
        isValid: false,
        errors: [
          {
            path: '$',
            keyword: 'schema',
            message: 'Schema input is empty. Provide a valid JSON Schema object.',
          },
        ],
      };
    }
    try {
      schemaObj = JSON.parse(trimmed);
    } catch (err) {
      return {
        isValid: false,
        errors: [
          {
            path: '$',
            keyword: 'syntax',
            message: `JSON Schema syntax error: ${err instanceof Error ? err.message : 'Invalid JSON'}`,
          },
        ],
      };
    }
  }

  if (typeof schemaObj !== 'object' && typeof schemaObj !== 'boolean') {
    return {
      isValid: false,
      errors: [
        {
          path: '$',
          keyword: 'schema',
          message: 'JSON Schema must be an object or a boolean.',
        },
      ],
    };
  }

  const errors: SchemaValidationError[] = [];
  validateNode(data, schemaObj, '$', errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
