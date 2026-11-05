import { describe, it, expect } from 'vitest';
import { validateAgainstSchema } from '../lib/schema-validator';
import { inferJsonSchema } from '../lib/schema-inferrer';
import type { JsonValue } from '../types/json';

describe('Draft-07 Conformance Audit & Regression Suite', () => {
  describe('Numeric Limits: exclusiveMinimum and exclusiveMaximum (Draft-07 numeric syntax)', () => {
    it('validates exclusiveMinimum correctly', () => {
      const schema = {
        type: 'number',
        exclusiveMinimum: 10,
      };

      // 10 is equal to exclusiveMinimum -> must fail
      const eqResult = validateAgainstSchema(10, schema);
      expect(eqResult.isValid).toBe(false);
      expect(eqResult.errors[0].keyword).toBe('exclusiveMinimum');

      // 9.9 is less than exclusiveMinimum -> must fail
      expect(validateAgainstSchema(9.9, schema).isValid).toBe(false);

      // 10.01 is strictly greater -> must pass
      expect(validateAgainstSchema(10.01, schema).isValid).toBe(true);
    });

    it('validates exclusiveMaximum correctly', () => {
      const schema = {
        type: 'number',
        exclusiveMaximum: 100,
      };

      // 100 is equal to exclusiveMaximum -> must fail
      const eqResult = validateAgainstSchema(100, schema);
      expect(eqResult.isValid).toBe(false);
      expect(eqResult.errors[0].keyword).toBe('exclusiveMaximum');

      // 100.1 is greater than exclusiveMaximum -> must fail
      expect(validateAgainstSchema(100.1, schema).isValid).toBe(false);

      // 99.99 is strictly less -> must pass
      expect(validateAgainstSchema(99.99, schema).isValid).toBe(true);
    });
  });

  describe('Logical Combinator: not', () => {
    it('validates "not" keyword correctly', () => {
      const schema = {
        not: { type: 'string' },
      };

      // String should fail because it matches the "not" subschema
      const failResult = validateAgainstSchema('should fail', schema);
      expect(failResult.isValid).toBe(false);
      expect(failResult.errors[0].keyword).toBe('not');

      // Number does not match string subschema -> passes
      expect(validateAgainstSchema(123, schema).isValid).toBe(true);
      expect(validateAgainstSchema(true, schema).isValid).toBe(true);
      expect(validateAgainstSchema(null, schema).isValid).toBe(true);
    });
  });

  describe('Array Constraints: uniqueItems', () => {
    it('validates uniqueItems on primitives', () => {
      const schema = {
        type: 'array',
        uniqueItems: true,
      };

      expect(validateAgainstSchema([1, 2, 3, 4], schema).isValid).toBe(true);

      const dupResult = validateAgainstSchema([1, 2, 3, 2], schema);
      expect(dupResult.isValid).toBe(false);
      expect(dupResult.errors[0].keyword).toBe('uniqueItems');
    });

    it('validates uniqueItems on complex objects and nested arrays', () => {
      const schema = {
        type: 'array',
        uniqueItems: true,
      };

      const uniqueObjs = [{ id: 1 }, { id: 2 }];
      expect(validateAgainstSchema(uniqueObjs, schema).isValid).toBe(true);

      const duplicateObjs = [{ id: 1, meta: { tag: 'a' } }, { id: 1, meta: { tag: 'a' } }];
      const res = validateAgainstSchema(duplicateObjs, schema);
      expect(res.isValid).toBe(false);
      expect(res.errors[0].keyword).toBe('uniqueItems');
    });

    it('validates "contains" keyword', () => {
      const schema = {
        type: 'array',
        contains: { type: 'integer', minimum: 10 },
      };

      // Array contains 12 >= 10 -> passes
      expect(validateAgainstSchema([1, 5, 12, 3], schema).isValid).toBe(true);

      // Array has integers but none >= 10 -> fails
      const fail = validateAgainstSchema([1, 2, 9], schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].keyword).toBe('contains');
    });
  });

  describe('Numeric Constraints: multipleOf', () => {
    it('validates multipleOf correctly', () => {
      const schema = {
        type: 'number',
        multipleOf: 2.5,
      };

      expect(validateAgainstSchema(5, schema).isValid).toBe(true);
      expect(validateAgainstSchema(7.5, schema).isValid).toBe(true);

      const fail = validateAgainstSchema(6, schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].keyword).toBe('multipleOf');
    });
  });

  describe('Array Tuple with additionalItems schema', () => {
    it('validates tuple items and schema-based additional items', () => {
      const schema = {
        type: 'array',
        items: [{ type: 'string' }, { type: 'integer' }],
        additionalItems: { type: 'boolean' },
      };

      expect(validateAgainstSchema(['hello', 42], schema).isValid).toBe(true);
      expect(validateAgainstSchema(['hello', 42, true, false], schema).isValid).toBe(true);

      const invalidExtra = validateAgainstSchema(['hello', 42, 'not-a-bool'], schema);
      expect(invalidExtra.isValid).toBe(false);
      expect(invalidExtra.errors[0].path).toBe('$[2]');
      expect(invalidExtra.errors[0].keyword).toBe('type');
    });
  });

  describe('Object Constraints: minProperties and maxProperties', () => {
    it('validates minProperties correctly', () => {
      const schema = {
        type: 'object',
        minProperties: 2,
      };

      expect(validateAgainstSchema({ a: 1, b: 2 }, schema).isValid).toBe(true);
      expect(validateAgainstSchema({ a: 1, b: 2, c: 3 }, schema).isValid).toBe(true);

      const fail = validateAgainstSchema({ a: 1 }, schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].keyword).toBe('minProperties');
    });

    it('validates maxProperties correctly', () => {
      const schema = {
        type: 'object',
        maxProperties: 2,
      };

      expect(validateAgainstSchema({ a: 1 }, schema).isValid).toBe(true);
      expect(validateAgainstSchema({ a: 1, b: 2 }, schema).isValid).toBe(true);

      const fail = validateAgainstSchema({ a: 1, b: 2, c: 3 }, schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].keyword).toBe('maxProperties');
    });
  });

  describe('Boolean Schemas in Items: items: false / true', () => {
    it('rejects all items when items: false is specified', () => {
      const schema = {
        type: 'array',
        items: false,
      };

      // Empty array has no items -> passes
      expect(validateAgainstSchema([], schema).isValid).toBe(true);

      // Array with items -> fails
      const fail = validateAgainstSchema(['any-item'], schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].path).toBe('$[0]');
    });
  });

  describe('Object propertyNames Keyword', () => {
    it('validates propertyNames with pattern', () => {
      const schema = {
        type: 'object',
        propertyNames: {
          pattern: '^[a-z_]+$',
        },
      };

      expect(validateAgainstSchema({ valid_key: 1, another: 2 }, schema).isValid).toBe(true);

      const fail = validateAgainstSchema({ 'INVALID-KEY': 1 }, schema);
      expect(fail.isValid).toBe(false);
      expect(fail.errors[0].keyword).toBe('propertyNames');
      expect(fail.errors[0].path).toBe('$["INVALID-KEY"]');
    });
  });

  describe('Deterministic Error Ordering', () => {
    it('produces identical error sequence regardless of object key order', () => {
      const schema = {
        type: 'object',
        required: ['z_key', 'a_key', 'm_key'],
        properties: {
          z_key: { type: 'string' },
          a_key: { type: 'string' },
          m_key: { type: 'string' },
        },
      };

      // Two payloads with identical invalid values but inserted in different orders
      const payload1 = {
        z_key: 123,
        m_key: 456,
        a_key: 789,
      };

      const payload2 = {
        a_key: 789,
        z_key: 123,
        m_key: 456,
      };

      const res1 = validateAgainstSchema(payload1, schema);
      const res2 = validateAgainstSchema(payload2, schema);

      expect(res1.errors.map((e) => e.path)).toEqual(res2.errors.map((e) => e.path));
    });
  });

  describe('Distinction: Missing Property vs Null vs Wrong Type', () => {
    const schema = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
      },
    };

    it('distinguishes missing property from explicit null', () => {
      // 1. Missing
      const missingRes = validateAgainstSchema({}, schema);
      expect(missingRes.isValid).toBe(false);
      expect(missingRes.errors[0].keyword).toBe('required');
      expect(missingRes.errors[0].received).toBe('missing');

      // 2. Explicit null
      const nullRes = validateAgainstSchema({ name: null }, schema);
      expect(nullRes.isValid).toBe(false);
      expect(nullRes.errors[0].keyword).toBe('type');
      expect(nullRes.errors[0].received).toBe('null');

      // 3. Wrong type
      const numRes = validateAgainstSchema({ name: 12345 }, schema);
      expect(numRes.isValid).toBe(false);
      expect(numRes.errors[0].keyword).toBe('type');
      expect(numRes.errors[0].received).toBe('integer');
    });
  });

  describe('Inference Engine Permutation & Multi-Sample Invariance', () => {
    const sampleA: JsonValue = {
      id: 1,
      name: 'Senem',
      email: 'senem@example.com',
      age: 28,
      tags: ['engineer', 'admin'],
      metadata: { role: 'lead', active: true },
    };

    const sampleB: JsonValue = {
      id: 2,
      name: 'Alex',
      age: 30,
      tags: ['designer'],
      metadata: { role: 'staff', active: false },
      bio: 'Developer advocate',
    };

    const sampleC: JsonValue = {
      id: 3,
      name: 'Jordan',
      email: null,
      age: 32.5, // float -> promotes integer to number!
      tags: [],
      metadata: { role: 'contributor', active: true },
    };

    const sampleD: JsonValue = {
      id: 4,
      name: 'Morgan',
      email: 'morgan@example.com',
      age: 25,
      tags: ['qa'],
      metadata: { role: 'tester', active: true },
      bio: null,
    };

    it('produces identical schema across all permutations of 3 samples (Property-based invariance)', () => {
      // Generate all 6 permutations of [A, B, C]
      const permutations = [
        [sampleA, sampleB, sampleC],
        [sampleA, sampleC, sampleB],
        [sampleB, sampleA, sampleC],
        [sampleB, sampleC, sampleA],
        [sampleC, sampleA, sampleB],
        [sampleC, sampleB, sampleA],
      ];

      const baseline = inferJsonSchema(permutations[0]).schemaString;

      for (let i = 1; i < permutations.length; i++) {
        const current = inferJsonSchema(permutations[i]).schemaString;
        expect(current).toBe(baseline);
      }
    });

    it('handles duplicate samples without distorting requiredness or types', () => {
      const withDuplicates = [sampleA, sampleA, sampleB, sampleB];
      const withoutDuplicates = [sampleA, sampleB];

      const schemaWithDups = inferJsonSchema(withDuplicates).schema;
      const schemaWithoutDups = inferJsonSchema(withoutDuplicates).schema;

      expect(schemaWithDups.required).toEqual(schemaWithoutDups.required);
      expect(schemaWithDups.properties).toEqual(schemaWithoutDups.properties);
    });

    it('correctly handles float promotion across 4 samples', () => {
      const res = inferJsonSchema([sampleA, sampleB, sampleC, sampleD]);
      expect(res.success).toBe(true);

      const props = res.schema.properties as Record<string, Record<string, unknown>>;
      // sampleC has 32.5 -> age must be 'number', not 'integer'
      expect(props.age.type).toBe('number');
      // id is always integer -> 'integer'
      expect(props.id.type).toBe('integer');
      // email is in A, C, D (where C is null) -> optional and nullable: ["null", "string"]
      expect(props.email.type).toEqual(['null', 'string']);
      // required keys across all 4: id, metadata, name, tags
      expect(res.schema.required).toEqual(['age', 'id', 'metadata', 'name', 'tags']);
    });
  });
});
