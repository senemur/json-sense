import type { ValidationResult, JsonValue } from '../types/json';

/**
 * Parses and validates JSON syntax with helpful line, column, and context snippet extraction.
 * Guarantees no raw stack traces are exposed to users.
 */
export function validateJson(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'JSON input is empty. Please enter or paste JSON to validate.',
    };
  }

  try {
    const parsed = JSON.parse(input) as JsonValue;
    return {
      isValid: true,
      parsed,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const { line, column, snippet, cleanMessage } = extractErrorLocation(input, message);

    return {
      isValid: false,
      error: cleanMessage,
      line,
      column,
      snippet,
    };
  }
}

interface ErrorLocation {
  line?: number;
  column?: number;
  snippet?: string;
  cleanMessage: string;
}

function extractErrorLocation(fullText: string, errorMessage: string): ErrorLocation {
  // Format standard friendly error message without stack trace
  const cleanMessage = errorMessage.replace(/^SyntaxError:\s*/i, '');

  let position: number | null = null;
  let line: number | null = null;
  let column: number | null = null;

  // Pattern 1: "... at position 123"
  const posMatch = errorMessage.match(/at position (\d+)/i);
  if (posMatch && posMatch[1]) {
    position = parseInt(posMatch[1], 10);
  }

  // Pattern 2: "... line 1 column 5"
  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/i);
  if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  }

  // Pattern 3: Modern V8 format: "... \"<context>\" is not valid JSON" or "... ...\"<context>\" is not valid JSON"
  if (position === null && (line === null || column === null)) {
    const v8QuoteMatch = errorMessage.match(/["'](.*)["'] is not valid JSON/s);
    if (v8QuoteMatch && v8QuoteMatch[1]) {
      const excerpt = v8QuoteMatch[1].replace(/^\.\.\./, '');
      const idx = fullText.indexOf(excerpt);
      if (idx !== -1) {
        position = idx;
      }
    }
  }

  // If we still do not have a position, attempt to match the unexpected token
  if (position === null && (line === null || column === null)) {
    const tokenMatch = errorMessage.match(/Unexpected token ['"]?([^'"]+)['"]?/);
    if (tokenMatch && tokenMatch[1]) {
      const token = tokenMatch[1];
      const idx = fullText.lastIndexOf(token);
      if (idx !== -1) {
        position = idx;
      }
    }
  }

  // If we have position but not line/col, compute line and col
  if (position !== null && (line === null || column === null)) {
    const textUpToPos = fullText.slice(0, Math.min(position, fullText.length));
    const lines = textUpToPos.split('\n');
    line = lines.length;
    const lastLine = lines[lines.length - 1];
    column = (lastLine ? lastLine.length : 0) + 1;
  }

  // Fallback: If still nothing, default to line 1 column 1 if text is non-empty
  if (line === null && fullText.trim().length > 0) {
    line = 1;
    column = 1;
  }

  // Generate a code snippet pointing to the error location if available
  let snippet: string | undefined;
  if (line !== null && line > 0) {
    const allLines = fullText.split('\n');
    const targetLineIndex = line - 1;
    if (targetLineIndex >= 0 && targetLineIndex < allLines.length) {
      const lineContent = allLines[targetLineIndex];
      const colPointer = column && column > 0 ? ' '.repeat(Math.max(0, column - 1)) + '^' : '^';
      snippet = `Line ${line}:\n${lineContent}\n${colPointer}`;
    }
  }

  return {
    line: line ?? undefined,
    column: column ?? undefined,
    snippet,
    cleanMessage,
  };
}
