import { describe, it, expect } from 'vitest';
import { generateTypeScript } from '../lib/typescript-generator';

describe('generateTypeScript', () => {
  it('generates interface for simple object', () => {
    const json = JSON.stringify({
      id: 1,
      name: 'JSON Buddy',
      isActive: true,
      score: 98.5,
    });

    const result = generateTypeScript(json, { rootName: 'AppConfig' });
    expect(result.success).toBe(true);
    expect(result.code).toContain('export interface AppConfig {');
    expect(result.code).toContain('id: number;');
    expect(result.code).toContain('name: string;');
    expect(result.code).toContain('isActive: boolean;');
    expect(result.code).toContain('score: number;');
  });

  it('handles nested objects with separate interfaces', () => {
    const json = JSON.stringify({
      user: {
        id: 42,
        profile: {
          bio: 'Engineer',
        },
      },
    });

    const result = generateTypeScript(json);
    expect(result.success).toBe(true);
    expect(result.code).toContain('interface Root {');
    expect(result.code).toContain('user: User;');
    expect(result.code).toContain('interface User {');
    expect(result.code).toContain('profile: Profile;');
    expect(result.code).toContain('interface Profile {');
  });

  it('merges array of objects and identifies optional properties', () => {
    const json = JSON.stringify({
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob' }, // role is missing
      ],
    });

    const result = generateTypeScript(json);
    expect(result.success).toBe(true);
    expect(result.code).toContain('users: User[];');
    expect(result.code).toContain('interface User {');
    expect(result.code).toContain('id: number;');
    expect(result.code).toContain('name: string;');
    expect(result.code).toContain('role?: string;');
  });

  it('handles primitive arrays and union arrays', () => {
    const json = JSON.stringify({
      tags: ['react', 'typescript'],
      scores: [10, 20, 30],
      mixed: ['hello', 42, true],
    });

    const result = generateTypeScript(json);
    expect(result.success).toBe(true);
    expect(result.code).toContain('tags: string[];');
    expect(result.code).toContain('scores: number[];');
    expect(result.code).toContain('mixed: (string | number | boolean)[];');
  });

  it('handles nullable values', () => {
    const json = JSON.stringify({
      description: null,
    });

    const result = generateTypeScript(json);
    expect(result.success).toBe(true);
    expect(result.code).toContain('description: null;');
  });

  it('escapes invalid identifier keys', () => {
    const json = JSON.stringify({
      'content-type': 'application/json',
      '123num': 'value',
    });

    const result = generateTypeScript(json);
    expect(result.success).toBe(true);
    expect(result.code).toContain('"content-type": string;');
    expect(result.code).toContain('"123num": string;');
  });

  it('handles empty input gracefully', () => {
    const result = generateTypeScript('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles invalid JSON gracefully', () => {
    const result = generateTypeScript('{ name: "bad" }');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
