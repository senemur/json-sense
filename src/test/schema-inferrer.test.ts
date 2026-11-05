import { describe, it, expect } from 'vitest';
import { inferJsonSchema } from '../lib/schema-inferrer';

describe('inferJsonSchema', () => {
  it('infers schema from a single sample object with standard types', () => {
    const sample = JSON.stringify({
      id: 1,
      name: 'Senem',
      active: true,
      score: 98.5,
      notes: null,
    });

    const result = inferJsonSchema([sample], { title: 'User' });
    expect(result.success).toBe(true);
    expect(result.sampleCount).toBe(1);
    expect(result.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(result.schema.title).toBe('User');
    expect(result.schema.type).toBe('object');

    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.id.type).toBe('integer');
    expect(props.name.type).toBe('string');
    expect(props.active.type).toBe('boolean');
    expect(props.score.type).toBe('number');
    expect(props.notes.type).toBe('null');

    expect(result.schema.required).toEqual(['active', 'id', 'name', 'notes', 'score']);
  });

  it('correctly handles multi-sample required fields intersection and optional properties', () => {
    const sample1 = JSON.stringify({
      id: 1,
      name: 'Senem',
      email: 'senem@example.com',
    });

    const sample2 = JSON.stringify({
      id: 2,
      name: 'Alex',
      active: true,
    });

    const result = inferJsonSchema([sample1, sample2]);
    expect(result.success).toBe(true);
    expect(result.sampleCount).toBe(2);

    const schema = result.schema;
    // 'id' and 'name' are in both samples -> required
    // 'email' and 'active' are only in one sample -> optional (not in required)
    expect(schema.required).toEqual(['id', 'name']);

    const props = schema.properties as Record<string, Record<string, unknown>>;
    expect(props.id.type).toBe('integer');
    expect(props.name.type).toBe('string');
    expect(props.email.type).toBe('string');
    expect(props.active.type).toBe('boolean');
  });

  it('unifies integer and float numbers under "number"', () => {
    const sample1 = JSON.stringify({ value: 10 });
    const sample2 = JSON.stringify({ value: 10.75 });

    const result = inferJsonSchema([sample1, sample2]);
    expect(result.success).toBe(true);
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.value.type).toBe('number');
  });

  it('infers union type when a field has different primitive types across samples', () => {
    const sample1 = JSON.stringify({ code: 123 });
    const sample2 = JSON.stringify({ code: 'ABC-123' });

    const result = inferJsonSchema([sample1, sample2]);
    expect(result.success).toBe(true);
    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    expect(props.code.type).toEqual(['integer', 'string']);
  });

  it('distinguishes nullable fields (union with null) from optional properties', () => {
    const sample1 = JSON.stringify({
      requiredAndNullable: 'present',
      optionalField: 'first',
    });
    const sample2 = JSON.stringify({
      requiredAndNullable: null,
      anotherOptional: 42,
    });

    const result = inferJsonSchema([sample1, sample2]);
    expect(result.success).toBe(true);

    const schema = result.schema;
    expect(schema.required).toEqual(['requiredAndNullable']);

    const props = schema.properties as Record<string, Record<string, unknown>>;
    expect(props.requiredAndNullable.type).toEqual(['null', 'string']);
    expect(props.optionalField.type).toBe('string');
    expect(props.anotherOptional.type).toBe('integer');
  });

  it('handles nested objects and nested arrays deterministically', () => {
    const sample1 = JSON.stringify({
      user: {
        profile: {
          age: 28,
        },
      },
      tags: ['typescript', 'react'],
    });

    const sample2 = JSON.stringify({
      user: {
        profile: {
          age: 30,
          role: 'admin',
        },
      },
      tags: ['vite'],
    });

    const result = inferJsonSchema([sample1, sample2]);
    expect(result.success).toBe(true);

    const props = result.schema.properties as Record<string, Record<string, unknown>>;
    const userProp = props.user as Record<string, unknown>;
    const userProps = userProp.properties as Record<string, Record<string, unknown>>;
    const profileProp = userProps.profile;
    const profileProps = profileProp.properties as Record<string, Record<string, unknown>>;

    expect(userProp.type).toBe('object');
    expect(profileProp.type).toBe('object');
    expect(profileProp.required).toEqual(['age']);
    expect(profileProps.age.type).toBe('integer');
    expect(profileProps.role.type).toBe('string');

    const tagsProp = props.tags as Record<string, unknown>;
    expect(tagsProp.type).toBe('array');
    expect((tagsProp.items as Record<string, unknown>).type).toBe('string');
  });

  it('is deterministic: sample input order does not change output schema', () => {
    const sampleA = JSON.stringify({ a: 1, b: 'two', c: true });
    const sampleB = JSON.stringify({ b: 2, c: false, d: null });

    const result1 = inferJsonSchema([sampleA, sampleB]);
    const result2 = inferJsonSchema([sampleB, sampleA]);

    expect(result1.schemaString).toBe(result2.schemaString);
  });

  it('handles primitive root samples', () => {
    const stringRoot = inferJsonSchema(['"hello"']);
    expect(stringRoot.success).toBe(true);
    expect(stringRoot.schema.type).toBe('string');

    const numberRoot = inferJsonSchema(['42']);
    expect(numberRoot.success).toBe(true);
    expect(numberRoot.schema.type).toBe('integer');

    const arrayRoot = inferJsonSchema(['[1, 2, 3]']);
    expect(arrayRoot.success).toBe(true);
    expect(arrayRoot.schema.type).toBe('array');
    expect((arrayRoot.schema.items as Record<string, unknown>).type).toBe('integer');
  });

  it('handles empty objects and empty arrays gracefully', () => {
    const emptyObj = inferJsonSchema(['{}']);
    expect(emptyObj.success).toBe(true);
    expect(emptyObj.schema.type).toBe('object');
    expect(emptyObj.schema.properties).toEqual({});

    const emptyArr = inferJsonSchema(['[]']);
    expect(emptyArr.success).toBe(true);
    expect(emptyArr.schema.type).toBe('array');
    expect(emptyArr.schema.items).toEqual({});
  });

  it('returns structured error when samples are empty or invalid', () => {
    const emptyList = inferJsonSchema([]);
    expect(emptyList.success).toBe(false);
    expect(emptyList.error).toContain('No JSON samples provided');

    const blankSample = inferJsonSchema(['   ']);
    expect(blankSample.success).toBe(false);
    expect(blankSample.error).toContain('Sample 1 is empty');

    const invalidSyntax = inferJsonSchema(['{ invalid: json }']);
    expect(invalidSyntax.success).toBe(false);
    expect(invalidSyntax.error).toContain('Sample 1 contains invalid JSON syntax');
  });
});
