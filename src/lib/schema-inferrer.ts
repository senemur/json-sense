import type { JsonValue, SchemaInferenceOptions } from '../types/json';
import { validateJson } from './validator';

export interface InferenceResult {
  success: boolean;
  schema: Record<string, unknown>;
  schemaString: string;
  sampleCount: number;
  error?: string;
}

/**
 * Determines the schema primitive type name for a value.
 * Differentiates 'integer' from 'number'.
 */
function getValueType(val: JsonValue): 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'array' | 'object' {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'integer' : 'number';
  }
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'string') return 'string';
  return 'object';
}

/**
 * Recursively infers a unified JSON Schema (Draft-07) from a collection of sample values.
 * Pure function, deterministic, sorted keys and types.
 */
function inferSubSchema(values: JsonValue[]): Record<string, unknown> {
  if (values.length === 0) {
    return {};
  }

  // 1. Group values by their broad category
  const typesSet = new Set<string>();
  let hasFloat = false;
  let hasInteger = false;

  values.forEach((v) => {
    const t = getValueType(v);
    if (t === 'integer') hasInteger = true;
    if (t === 'number') hasFloat = true;
    typesSet.add(t);
  });

  // If both float and integer numbers appear, unify them under 'number'
  if (hasFloat && hasInteger) {
    typesSet.delete('integer');
    typesSet.add('number');
  }

  const distinctTypes = Array.from(typesSet).sort();

  // 2. Single unified type across all samples
  if (distinctTypes.length === 1) {
    const t = distinctTypes[0];

    // Case A: Primitive types
    if (t === 'string' || t === 'number' || t === 'integer' || t === 'boolean' || t === 'null') {
      return { type: t };
    }

    // Case B: Array of items
    if (t === 'array') {
      const allArrayItems: JsonValue[] = [];
      values.forEach((arr) => {
        if (Array.isArray(arr)) {
          allArrayItems.push(...arr);
        }
      });

      if (allArrayItems.length === 0) {
        return {
          type: 'array',
          items: {},
        };
      }

      return {
        type: 'array',
        items: inferSubSchema(allArrayItems),
      };
    }

    // Case C: Object
    if (t === 'object') {
      const objectValues = values.filter(
        (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
      ) as Record<string, JsonValue>[];

      const keyFrequency = new Map<string, number>();
      const keyValues = new Map<string, JsonValue[]>();

      objectValues.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          keyFrequency.set(key, (keyFrequency.get(key) || 0) + 1);
          if (!keyValues.has(key)) {
            keyValues.set(key, []);
          }
          keyValues.get(key)!.push(obj[key]);
        });
      });

      const sortedKeys = Array.from(keyValues.keys()).sort();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      sortedKeys.forEach((key) => {
        properties[key] = inferSubSchema(keyValues.get(key)!);
        // Required only if present in 100% of the sample objects at this level
        if (keyFrequency.get(key) === objectValues.length) {
          required.push(key);
        }
      });

      const schema: Record<string, unknown> = {
        type: 'object',
        properties,
      };

      if (required.length > 0) {
        schema.required = required.sort();
      }

      return schema;
    }
  }

  // 3. Multiple distinct types: determine if union type array or anyOf is appropriate
  const isAllPrimitiveOrNull = distinctTypes.every(
    (t) => t !== 'object' && t !== 'array'
  );

  if (isAllPrimitiveOrNull) {
    // Standard Draft-07 union type array: e.g. ["integer", "string"] or ["null", "string"]
    return {
      type: distinctTypes.sort(),
    };
  }

  // Mixed complex types (e.g. object mixed with string, or array mixed with object):
  // Generate anyOf subschemas
  const anyOfSchemas: Record<string, unknown>[] = [];

  // Group objects
  const objects = values.filter((v) => v !== null && typeof v === 'object' && !Array.isArray(v));
  if (objects.length > 0) {
    anyOfSchemas.push(inferSubSchema(objects));
  }

  // Group arrays
  const arrays = values.filter((v) => Array.isArray(v));
  if (arrays.length > 0) {
    anyOfSchemas.push(inferSubSchema(arrays));
  }

  // Group primitives
  const primitives = values.filter((v) => v === null || typeof v !== 'object');
  if (primitives.length > 0) {
    const primTypes = Array.from(new Set(primitives.map(getValueType))).sort();
    if (primTypes.includes('integer') && primTypes.includes('number')) {
      const idx = primTypes.indexOf('integer');
      primTypes.splice(idx, 1);
    }
    if (primTypes.length === 1) {
      anyOfSchemas.push({ type: primTypes[0] });
    } else {
      anyOfSchemas.push({ type: primTypes });
    }
  }

  // Sort anyOf schemas deterministically by JSON representation
  anyOfSchemas.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  return {
    anyOf: anyOfSchemas,
  };
}

/**
 * Infers a clean, compliant JSON Schema (Draft-07) from one or more JSON samples.
 */
export function inferJsonSchema(
  samples: (string | JsonValue)[],
  options: SchemaInferenceOptions = {}
): InferenceResult {
  if (samples.length === 0) {
    return {
      success: false,
      schema: {},
      schemaString: '',
      sampleCount: 0,
      error: 'No JSON samples provided. Please add at least one valid JSON sample.',
    };
  }

  const parsedSamples: JsonValue[] = [];

  for (let i = 0; i < samples.length; i++) {
    const raw = samples[i];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return {
          success: false,
          schema: {},
          schemaString: '',
          sampleCount: 0,
          error: `Sample ${i + 1} is empty. All samples must contain valid JSON.`,
        };
      }
      const validation = validateJson(trimmed);
      if (!validation.isValid || validation.parsed === undefined) {
        return {
          success: false,
          schema: {},
          schemaString: '',
          sampleCount: 0,
          error: `Sample ${i + 1} contains invalid JSON syntax: ${validation.error || 'Syntax error'}`,
        };
      }
      parsedSamples.push(validation.parsed);
    } else {
      parsedSamples.push(raw);
    }
  }

  try {
    const inferredBody = inferSubSchema(parsedSamples);
    const schema: Record<string, unknown> = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: options.title?.trim() || 'InferredSchema',
      ...inferredBody,
    };

    const schemaString = JSON.stringify(schema, null, 2);

    return {
      success: true,
      schema,
      schemaString,
      sampleCount: parsedSamples.length,
    };
  } catch (err) {
    return {
      success: false,
      schema: {},
      schemaString: '',
      sampleCount: 0,
      error: err instanceof Error ? err.message : 'Failed to infer schema from samples.',
    };
  }
}
