import type { FormatResult, FormatOptions } from '../types/json';
import { validateJson } from './validator';

/**
 * Formats valid JSON with configurable indentation (e.g., 2 spaces, 4 spaces, or tabs).
 * Returns original input unaltered if parsing or formatting fails.
 */
export function formatJson(input: string, options: FormatOptions = { indent: 2 }): FormatResult {
  if (!input.trim()) {
    return {
      success: true,
      output: '',
    };
  }

  const validation = validateJson(input);
  if (!validation.isValid || validation.parsed === undefined) {
    return {
      success: false,
      output: input,
      error: validation.error || 'Invalid JSON syntax',
    };
  }

  try {
    const formatted = JSON.stringify(validation.parsed, null, options.indent);
    return {
      success: true,
      output: formatted,
    };
  } catch (err: unknown) {
    return {
      success: false,
      output: input,
      error: err instanceof Error ? err.message : 'Failed to format JSON',
    };
  }
}

/**
 * Minifies JSON by stripping all whitespace and newlines outside strings.
 * Returns original input unaltered if formatting fails.
 */
export function minifyJson(input: string): FormatResult {
  if (!input.trim()) {
    return {
      success: true,
      output: '',
    };
  }

  const validation = validateJson(input);
  if (!validation.isValid || validation.parsed === undefined) {
    return {
      success: false,
      output: input,
      error: validation.error || 'Invalid JSON syntax',
    };
  }

  try {
    const minified = JSON.stringify(validation.parsed);
    return {
      success: true,
      output: minified,
    };
  } catch (err: unknown) {
    return {
      success: false,
      output: input,
      error: err instanceof Error ? err.message : 'Failed to minify JSON',
    };
  }
}

/**
 * Computes fast stats for JSON text (character count, line count, byte size).
 */
export function getJsonStats(text: string): { chars: number; lines: number; bytes: number } {
  const chars = text.length;
  const lines = text ? text.split('\n').length : 0;
  // Blob byte size approximation (UTF-8)
  const bytes = new TextEncoder().encode(text).length;

  return { chars, lines, bytes };
}
