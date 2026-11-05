import { describe, it, expect } from 'vitest';
import { repairJson } from '../lib/repair';

describe('Smart JSON Repair', () => {
  it('does not alter already valid JSON', () => {
    const validJson = JSON.stringify({ name: 'JsonSense', stars: 100, active: true }, null, 2);
    const result = repairJson(validJson);

    expect(result.success).toBe(true);
    expect(result.changed).toBe(false);
    expect(result.fixes).toHaveLength(0);
    expect(result.output).toBe(validJson);
  });

  it('handles empty or whitespace-only inputs gracefully', () => {
    const resultEmpty = repairJson('');
    expect(resultEmpty.success).toBe(false);
    expect(resultEmpty.error).toContain('empty');

    const resultWhitespace = repairJson('   \n\t  ');
    expect(resultWhitespace.success).toBe(false);
    expect(resultWhitespace.error).toContain('empty');
  });

  it('repairs unquoted object keys', () => {
    const broken = `{
      name: "Senem",
      age: 30,
      active: true,
      $id: "user-1"
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);
    expect(result.changed).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({
      name: 'Senem',
      age: 30,
      active: true,
      $id: 'user-1',
    });

    const keyFixes = result.fixes.filter((f) => f.type === 'unquoted-key');
    expect(keyFixes.length).toBeGreaterThanOrEqual(4);
  });

  it('safely handles single-quoted strings and keys', () => {
    const broken = `{'title': 'Single \\'quotes\\' with "double" inside', 'author': 'Senem'}`;
    const result = repairJson(broken);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.title).toBe('Single \'quotes\' with "double" inside');
    expect(parsed.author).toBe('Senem');
  });

  it('removes trailing commas in objects and arrays', () => {
    const broken = `{
      "skills": ["C#", "React", "TypeScript",],
      "meta": {
        "verified": true,
      },
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed.skills).toEqual(['C#', 'React', 'TypeScript']);
    expect(parsed.meta.verified).toBe(true);

    const trailingFixes = result.fixes.filter((f) => f.type === 'trailing-comma');
    expect(trailingFixes.length).toBe(3);
  });

  it('never mutates or removes characters inside valid string values', () => {
    const inputWithSpecialString = JSON.stringify({
      message: 'Hello, {world}, this is not a syntax error: [1, 2,]',
      url: 'https://api.example.com/items?filter=all&sort=asc',
      code: 'if (x > 0) { return true; }',
    }, null, 2);

    const result = repairJson(inputWithSpecialString);
    expect(result.success).toBe(true);
    expect(result.changed).toBe(false);
    expect(result.output).toBe(inputWithSpecialString);
  });

  it('strips single-line and multi-line comments', () => {
    const broken = `{
      // Developer credentials
      "service": "api",
      /* Timeout in milliseconds */
      "timeout": 5000
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed.service).toBe('api');
    expect(parsed.timeout).toBe(5000);

    const commentFixes = result.fixes.filter((f) => f.type === 'comment');
    expect(commentFixes.length).toBe(2);
  });

  it('converts Python and JS non-standard literals', () => {
    const broken = `{
      "isVerified": True,
      "isBanned": False,
      "profile": None,
      "temp": undefined,
      "score": NaN
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed.isVerified).toBe(true);
    expect(parsed.isBanned).toBe(false);
    expect(parsed.profile).toBeNull();
    expect(parsed.temp).toBeNull();
    expect(parsed.score).toBeNull();
  });

  it('quotes unquoted word values', () => {
    const broken = `{
      status: active,
      role: admin
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed.status).toBe('active');
    expect(parsed.role).toBe('admin');
  });

  it('handles leading plus signs and hexadecimal numbers', () => {
    const broken = `{
      "positive": +42,
      "hex": 0x1f
    }`;

    const result = repairJson(broken);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed.positive).toBe(42);
    expect(parsed.hex).toBe(31);
  });

  it('closes unclosed object and array brackets at EOF', () => {
    const broken = `{"user": {"name": "Senem", "roles": ["admin", "editor"`;
    const result = repairJson(broken);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.user.name).toBe('Senem');
    expect(parsed.user.roles).toEqual(['admin', 'editor']);

    const unclosedFixes = result.fixes.filter((f) => f.type === 'unclosed-container');
    expect(unclosedFixes.length).toBe(3); // ']', '}', '}'
  });

  it('repairs the combined realistic payload from user prompt', () => {
    const promptExample = `{
  name: "Senem",
  "skills": ["C#", "React",],
  "active": true,
}`;

    const result = repairJson(promptExample);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({
      name: 'Senem',
      skills: ['C#', 'React'],
      active: true,
    });

    expect(result.fixes.some((f) => f.description.includes('name'))).toBe(true);
    expect(result.fixes.some((f) => f.description.includes('array'))).toBe(true);
    expect(result.fixes.some((f) => f.description.includes('object'))).toBe(true);
  });

  it('fails safely and honestly for completely corrupted input', () => {
    const gibberish = '<<< INVALID XML OR SQL STATEMENT >>>';
    const result = repairJson(gibberish);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.changed).toBe(false);
  });

  it('handles primitive JSON values correctly', () => {
    expect(repairJson('42').success).toBe(true);
    expect(repairJson('"primitive string"').success).toBe(true);
    expect(repairJson('true').success).toBe(true);
    expect(repairJson('null').success).toBe(true);

    const singleQuotePrim = repairJson("'single quoted primitive'");
    expect(singleQuotePrim.success).toBe(true);
    expect(singleQuotePrim.output).toBe('"single quoted primitive"');
  });
});
