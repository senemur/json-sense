import { describe, it, expect } from 'vitest';
import { validateAgainstSchema } from '../lib/schema-validator';

describe('validateAgainstSchema', () => {
  it('validates primitive types successfully', () => {
    const stringSchema = { type: 'string' };
    expect(validateAgainstSchema('hello', stringSchema).isValid).toBe(true);
    expect(validateAgainstSchema(123, stringSchema).isValid).toBe(false);

    const intSchema = { type: 'integer' };
    expect(validateAgainstSchema(42, intSchema).isValid).toBe(true);
    expect(validateAgainstSchema(42.5, intSchema).isValid).toBe(false);

    const numSchema = { type: 'number' };
    expect(validateAgainstSchema(42.5, numSchema).isValid).toBe(true);

    const boolSchema = { type: 'boolean' };
    expect(validateAgainstSchema(true, boolSchema).isValid).toBe(true);
    expect(validateAgainstSchema('true', boolSchema).isValid).toBe(false);

    const nullSchema = { type: 'null' };
    expect(validateAgainstSchema(null, nullSchema).isValid).toBe(true);
    expect(validateAgainstSchema(0, nullSchema).isValid).toBe(false);
  });

  it('validates union types', () => {
    const unionSchema = { type: ['integer', 'string', 'null'] };

    expect(validateAgainstSchema(10, unionSchema).isValid).toBe(true);
    expect(validateAgainstSchema('code', unionSchema).isValid).toBe(true);
    expect(validateAgainstSchema(null, unionSchema).isValid).toBe(true);
    expect(validateAgainstSchema(true, unionSchema).isValid).toBe(false);
  });

  it('validates required object fields and captures missing path', () => {
    const schema = {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    };

    const validData = { id: 1, name: 'Senem', email: 'senem@example.com' };
    const validResult = validateAgainstSchema(validData, schema);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const missingData = { id: 1, email: 'senem@example.com' };
    const invalidResult = validateAgainstSchema(missingData, schema);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveLength(1);
    expect(invalidResult.errors[0].path).toBe('$.name');
    expect(invalidResult.errors[0].keyword).toBe('required');
    expect(invalidResult.errors[0].message).toContain('Missing required property "name"');
  });

  it('validates nested object properties with accurate JSONPath', () => {
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            address: {
              type: 'object',
              required: ['zipCode'],
              properties: {
                zipCode: { type: 'integer' },
              },
            },
          },
        },
      },
    };

    const invalidData = {
      user: {
        address: {
          zipCode: '34000', // string instead of integer
        },
      },
    };

    const result = validateAgainstSchema(invalidData, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].path).toBe('$.user.address.zipCode');
    expect(result.errors[0].keyword).toBe('type');
  });

  it('validates array items and reports invalid element index path', () => {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
    };

    const data = [{ id: 1 }, { id: 'two' }, { id: 3 }];
    const result = validateAgainstSchema(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].path).toBe('$[1].id');
    expect(result.errors[0].keyword).toBe('type');
  });

  it('enforces additionalProperties: false', () => {
    const schema = {
      type: 'object',
      properties: {
        allowedKey: { type: 'string' },
      },
      additionalProperties: false,
    };

    const invalidData = {
      allowedKey: 'yes',
      rogueKey: 123,
    };

    const result = validateAgainstSchema(invalidData, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].path).toBe('$.rogueKey');
    expect(result.errors[0].keyword).toBe('additionalProperties');
  });

  it('validates number limits and string lengths', () => {
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'integer', minimum: 18, maximum: 120 },
        tag: { type: 'string', minLength: 2, maxLength: 5 },
      },
    };

    expect(validateAgainstSchema({ age: 25, tag: 'dev' }, schema).isValid).toBe(true);

    const tooYoung = validateAgainstSchema({ age: 16, tag: 'dev' }, schema);
    expect(tooYoung.isValid).toBe(false);
    expect(tooYoung.errors[0].keyword).toBe('minimum');

    const tooLong = validateAgainstSchema({ age: 25, tag: 'toolongtag' }, schema);
    expect(tooLong.isValid).toBe(false);
    expect(tooLong.errors[0].keyword).toBe('maxLength');
  });

  it('validates enum values', () => {
    const schema = {
      type: 'string',
      enum: ['draft', 'published', 'archived'],
    };

    expect(validateAgainstSchema('draft', schema).isValid).toBe(true);
    const result = validateAgainstSchema('deleted', schema);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].keyword).toBe('enum');
  });

  it('validates anyOf combinators', () => {
    const schema = {
      anyOf: [
        { type: 'string' },
        { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } },
      ],
    };

    expect(validateAgainstSchema('simple-string', schema).isValid).toBe(true);
    expect(validateAgainstSchema({ id: 10 }, schema).isValid).toBe(true);

    const fail = validateAgainstSchema({ id: 'wrong' }, schema);
    expect(fail.isValid).toBe(false);
    expect(fail.errors[0].keyword).toBe('anyOf');
  });

  it('handles boolean schemas according to Draft-07 specs', () => {
    expect(validateAgainstSchema({ a: 1 }, true).isValid).toBe(true);
    expect(validateAgainstSchema({ a: 1 }, false).isValid).toBe(false);
  });

  it('handles raw JSON string schemas and reports syntax errors', () => {
    const validJsonSchema = JSON.stringify({ type: 'integer' });
    expect(validateAgainstSchema(42, validJsonSchema).isValid).toBe(true);

    const invalidJsonSchema = '{ broken: json';
    const result = validateAgainstSchema(42, invalidJsonSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].keyword).toBe('syntax');
  });
});
