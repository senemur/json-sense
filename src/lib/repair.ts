import type { RepairResult, RepairFix, RepairOptions, RepairConfidence } from '../types/json';
import { validateJson } from './validator';
import { formatJson } from './formatter';

interface ContainerFrame {
  char: '{' | '[';
  line: number;
  col: number;
}

/**
 * Safely analyzes and repairs malformed JSON syntax.
 * Uses a token-aware scanner that never mutates string values or deletes characters inside strings.
 *
 * Supported repair capabilities:
 * - Unquoted object keys: { name: "val" } -> { "name": "val" }
 * - Single-quoted strings in keys and values: {'key': 'val'} -> {"key": "val"}
 * - Trailing commas in objects and arrays: [1, 2,] -> [1, 2]
 * - Duplicate consecutive commas: [1,, 2] -> [1, 2]
 * - Strips comments (// and /* ... *\/) while preserving line numbers and newlines
 * - Python / JS literals: True -> true, False -> false, None -> null, undefined -> null, NaN -> null
 * - Unquoted word values: { status: active } -> { "status": "active" }
 * - Leading plus signs on numbers: +42 -> 42
 * - Hexadecimal numbers: 0x1f -> 31
 * - Safely handles mismatched brackets and flags unrecoverable structures
 * - Unclosed brackets or braces at EOF: {"a": 1 -> {"a": 1}
 * - Unescaped raw newlines inside strings: converted to \n
 */
export function repairJson(input: string, options: RepairOptions = {}): RepairResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      success: false,
      output: input,
      original: input,
      fixes: [],
      changed: false,
      error: 'JSON input is empty. Nothing to repair.',
    };
  }

  // If already completely valid, do not alter original input
  const initialValidation = validateJson(input);
  if (initialValidation.isValid) {
    return {
      success: true,
      output: input,
      original: input,
      fixes: [],
      changed: false,
    };
  }

  const fixes: RepairFix[] = [];
  let fixCounter = 0;
  const createFix = (
    type: RepairFix['type'],
    description: string,
    fixLine?: number,
    confidence: RepairConfidence = 'high',
    explanation?: string,
    column?: number
  ) => {
    fixCounter++;
    fixes.push({
      id: `fix-${fixCounter}-${type}`,
      type,
      description,
      line: fixLine,
      column,
      confidence,
      explanation,
    });
  };

  const text = input;
  let pos = 0;
  let line = 1;
  let col = 1;
  let output = '';

  const containerStack: ContainerFrame[] = [];

  const peek = (offset = 0): string => {
    return text[pos + offset] ?? '';
  };

  const advance = (): string => {
    const char = text[pos] ?? '';
    pos++;
    if (char === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return char;
  };

  // Peek forward past whitespace and comments to see the next meaningful character
  const peekNextTokenChar = (startPos = pos): { char: string; index: number } => {
    let p = startPos;
    while (p < text.length) {
      const c = text[p];
      // Skip whitespace
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        p++;
        continue;
      }
      // Skip single-line comment
      if (c === '/' && text[p + 1] === '/') {
        p += 2;
        while (p < text.length && text[p] !== '\n') {
          p++;
        }
        continue;
      }
      // Skip multi-line comment
      if (c === '/' && text[p + 1] === '*') {
        p += 2;
        while (p < text.length && !(text[p] === '*' && text[p + 1] === '/')) {
          p++;
        }
        p += 2;
        continue;
      }
      return { char: c, index: p };
    }
    return { char: '', index: p };
  };

  while (pos < text.length) {
    const char = text[pos];

    // 1. Whitespace: preserved verbatim
    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      output += advance();
      continue;
    }

    // 2. Single-line comment //: preserve subsequent newline so line numbering remains identical
    if (char === '/' && peek(1) === '/') {
      const commentLine = line;
      const commentCol = col;
      advance(); // /
      advance(); // /
      while (pos < text.length && text[pos] !== '\n') {
        advance();
      }
      createFix(
        'comment',
        'Removed single-line comment',
        commentLine,
        'high',
        'Single-line comment (//) removed. Comments are forbidden in standard JSON.',
        commentCol
      );
      continue;
    }

    // 3. Multi-line comment /* ... */: preserve newline count to maintain line numbering for subsequent tokens
    if (char === '/' && peek(1) === '*') {
      const commentLine = line;
      const commentCol = col;
      advance(); // /
      advance(); // *
      let preservedNewlines = '';
      while (pos < text.length && !(text[pos] === '*' && peek(1) === '/')) {
        if (text[pos] === '\r' && peek(1) === '\n') {
          preservedNewlines += '\r\n';
          advance(); // \r
          advance(); // \n
        } else if (text[pos] === '\n') {
          preservedNewlines += '\n';
          advance(); // \n
        } else {
          advance();
        }
      }
      if (pos < text.length) {
        advance(); // *
        advance(); // /
      }
      output += preservedNewlines;
      createFix(
        'comment',
        'Removed multi-line comment (preserved line numbers)',
        commentLine,
        'high',
        'Multi-line comment (/* ... */) removed while preserving line breaks to ensure accurate error locations.',
        commentCol
      );
      continue;
    }

    // 4. Double-quoted string: MUST NOT touch inside contents!
    if (char === '"') {
      advance();
      output += '"';
      let closed = false;

      while (pos < text.length) {
        const c = text[pos];
        if (c === '\\') {
          output += advance(); // \
          if (pos < text.length) {
            output += advance(); // escaped char
          }
        } else if (c === '"') {
          output += advance();
          closed = true;
          break;
        } else if (c === '\n' || c === '\r') {
          if (c === '\r' && peek(1) === '\n') {
            advance();
          }
          advance();
          output += '\\n';
          createFix(
            'escaped-char',
            'Escaped raw newline inside string',
            line,
            'high',
            'Unescaped newline characters are prohibited inside JSON strings; replaced with \\n.',
            col
          );
        } else {
          output += advance();
        }
      }

      if (!closed) {
        output += '"';
        createFix(
          'unclosed-container',
          'Added missing closing quote to unclosed string',
          line,
          'medium',
          'String literal reached line break or end of input without closing quote; closing quote added.',
          col
        );
      }
      continue;
    }

    // 5. Single-quoted string: convert to double-quoted string safely
    if (char === "'") {
      const strLine = line;
      const strCol = col;
      advance(); // '
      output += '"';
      let content = '';
      let closed = false;

      while (pos < text.length) {
        const c = text[pos];
        if (c === '\\') {
          advance(); // \
          const next = text[pos] ?? '';
          advance();
          if (next === "'") {
            // \' inside single quotes becomes a literal '
            content += "'";
          } else if (next === '"') {
            // Escaped double quote becomes \"
            content += '\\"';
          } else {
            // Other escape sequences like \n, \t, \\
            content += '\\' + next;
          }
        } else if (c === "'") {
          advance();
          closed = true;
          break;
        } else if (c === '"') {
          // Unescaped literal double quote inside single quotes must be escaped in double-quoted JSON!
          content += '\\"';
          advance();
        } else if (c === '\n' || c === '\r') {
          if (c === '\r' && peek(1) === '\n') {
            advance();
          }
          advance();
          content += '\\n';
          createFix(
            'escaped-char',
            'Escaped raw newline inside single-quoted string',
            line,
            'high',
            'Unescaped newline characters are prohibited inside single-quoted strings; replaced with \\n.',
            col
          );
        } else {
          content += advance();
        }
      }

      output += content + '"';
      createFix(
        'single-quote',
        closed
          ? 'Converted single-quoted string to standard double quotes'
          : 'Added closing quote and converted single-quoted string to double quotes',
        strLine,
        'high',
        'JSON specification requires double-quoted strings. Single quotes were replaced and nested quotes escaped.',
        strCol
      );
      continue;
    }

    // 6. Containers: Objects { and Arrays [ with strict mismatch verification
    if (char === '{') {
      const openLine = line;
      const openCol = col;
      output += advance();
      containerStack.push({ char: '{', line: openLine, col: openCol });
      continue;
    }

    if (char === '}') {
      const closeLine = line;
      const closeCol = col;
      if (containerStack.length === 0) {
        return {
          success: false,
          output: input,
          original: input,
          fixes: [],
          changed: false,
          error: `Unexpected closing bracket '}' with no matching opening '{' at line ${closeLine}, column ${closeCol}.`,
        };
      }
      const top = containerStack[containerStack.length - 1];
      if (top.char !== '{') {
        return {
          success: false,
          output: input,
          original: input,
          fixes: [],
          changed: false,
          error: `Mismatched closing bracket '}' at line ${closeLine}, column ${closeCol}: expected ']' to close array opened at line ${top.line}, column ${top.col}.`,
        };
      }
      containerStack.pop();
      output += advance();
      continue;
    }

    if (char === '[') {
      const openLine = line;
      const openCol = col;
      output += advance();
      containerStack.push({ char: '[', line: openLine, col: openCol });
      continue;
    }

    if (char === ']') {
      const closeLine = line;
      const closeCol = col;
      if (containerStack.length === 0) {
        return {
          success: false,
          output: input,
          original: input,
          fixes: [],
          changed: false,
          error: `Unexpected closing bracket ']' with no matching opening '[' at line ${closeLine}, column ${closeCol}.`,
        };
      }
      const top = containerStack[containerStack.length - 1];
      if (top.char !== '[') {
        return {
          success: false,
          output: input,
          original: input,
          fixes: [],
          changed: false,
          error: `Mismatched closing bracket ']' at line ${closeLine}, column ${closeCol}: expected '}' to close object opened at line ${top.line}, column ${top.col}.`,
        };
      }
      containerStack.pop();
      output += advance();
      continue;
    }

    // 7. Commas: Handle trailing commas and consecutive commas
    if (char === ',') {
      const commaLine = line;
      const commaCol = col;
      const nextToken = peekNextTokenChar(pos + 1);

      // Trailing comma before closing } or ]
      if (nextToken.char === '}' || nextToken.char === ']') {
        advance(); // skip comma
        createFix(
          'trailing-comma',
          `Removed trailing comma in ${nextToken.char === '}' ? 'object' : 'array'}`,
          commaLine,
          'high',
          'Trailing commas after elements in objects or arrays are forbidden in JSON.',
          commaCol
        );
        continue;
      }

      // Duplicate consecutive comma
      if (nextToken.char === ',') {
        advance(); // skip redundant comma
        createFix(
          'trailing-comma',
          'Removed duplicate consecutive comma',
          commaLine,
          'high',
          'Consecutive commas without an element in between are invalid syntax in JSON.',
          commaCol
        );
        continue;
      }

      output += advance();
      continue;
    }

    // 8. Colons
    if (char === ':') {
      output += advance();
      continue;
    }

    // 9. Leading plus on numbers (+42 -> 42)
    if (char === '+' && /[0-9]/.test(peek(1))) {
      const numLine = line;
      const numCol = col;
      advance(); // skip +
      createFix(
        'number-format',
        "Removed non-standard leading '+' from number",
        numLine,
        'high',
        "JSON numbers cannot have an explicit '+' sign prefix (only '-' is permitted for negatives).",
        numCol
      );
      continue;
    }

    // 10. Hexadecimal numbers (0x1f -> 31)
    if (char === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
      const hexLine = line;
      const hexCol = col;
      advance(); // 0
      advance(); // x
      let hexDigits = '';
      while (pos < text.length && /[0-9a-fA-F]/.test(text[pos])) {
        hexDigits += advance();
      }
      const decimalVal = parseInt(hexDigits, 16);
      if (!Number.isNaN(decimalVal)) {
        output += String(decimalVal);
        createFix(
          'number-format',
          `Converted hexadecimal '0x${hexDigits}' to decimal '${decimalVal}'`,
          hexLine,
          'medium',
          'Hexadecimal numbers (0x...) are not valid in standard JSON; converted to decimal integer.',
          hexCol
        );
        continue;
      }
    }

    // 11. Identifiers / Words: Unquoted keys, literals (True/False/None/undefined/NaN), or unquoted string values
    if (/[a-zA-Z_$]/.test(char)) {
      const wordLine = line;
      const wordCol = col;
      let word = '';
      while (pos < text.length && /[-a-zA-Z0-9_$]/.test(text[pos])) {
        word += advance();
      }

      // Check what follows this word
      const nextToken = peekNextTokenChar();

      // Case A: Followed by ':' -> definitely an UNQUOTED OBJECT KEY!
      if (nextToken.char === ':') {
        output += `"${word}"`;
        createFix(
          'unquoted-key',
          `Added double quotes to unquoted key '${word}'`,
          wordLine,
          'high',
          'Object property names must be double-quoted strings in JSON.',
          wordCol
        );
        continue;
      }

      // Case B: Value literals
      if (word === 'True') {
        output += 'true';
        createFix(
          'literal',
          "Replaced Python literal 'True' with 'true'",
          wordLine,
          'high',
          "Boolean true must be lowercase 'true' in JSON.",
          wordCol
        );
        continue;
      }
      if (word === 'False') {
        output += 'false';
        createFix(
          'literal',
          "Replaced Python literal 'False' with 'false'",
          wordLine,
          'high',
          "Boolean false must be lowercase 'false' in JSON.",
          wordCol
        );
        continue;
      }
      if (word === 'None') {
        output += 'null';
        createFix(
          'literal',
          "Replaced Python literal 'None' with 'null'",
          wordLine,
          'high',
          "Python None literal converted to standard JSON null.",
          wordCol
        );
        continue;
      }
      if (word === 'undefined') {
        output += 'null';
        createFix(
          'literal',
          "Replaced 'undefined' with 'null'",
          wordLine,
          'medium',
          "JSON specification does not support 'undefined'. Replaced with 'null', which may alter object property semantics if omission was intended.",
          wordCol
        );
        continue;
      }
      if (word === 'NaN') {
        output += 'null';
        createFix(
          'literal',
          "Replaced 'NaN' with 'null'",
          wordLine,
          'medium',
          "JSON does not support IEEE 754 NaN (Not-a-Number); converted to null.",
          wordCol
        );
        continue;
      }
      if (word === 'true' || word === 'false' || word === 'null') {
        // Standard JSON literal
        output += word;
        continue;
      }

      // Case C: Unquoted word value inside object or array
      if (containerStack.length > 0) {
        output += `"${word}"`;
        createFix(
          'unquoted-key',
          `Added double quotes to unquoted value '${word}'`,
          wordLine,
          'medium',
          `Unquoted identifier '${word}' was interpreted as a string value and enclosed in double quotes.`,
          wordCol
        );
        continue;
      }

      output += word;
      continue;
    }

    // Default: pass through any other character
    output += advance();
  }

  // 12. Check for unclosed containers at EOF (unclosed brackets/braces that have no mismatch)
  if (containerStack.length > 0) {
    while (containerStack.length > 0) {
      const unclosed = containerStack.pop()!;
      const closing = unclosed.char === '{' ? '}' : ']';
      output += closing;
      createFix(
        'unclosed-container',
        `Added missing closing '${closing}' for unclosed ${unclosed.char === '{' ? 'object' : 'array'} (opened at line ${unclosed.line}, col ${unclosed.col})`,
        line,
        'medium',
        `Container was opened but never closed before end of input; safely auto-closed in reverse order.`,
        col
      );
    }
  }

  // Double-check if the repaired text is valid JSON syntax
  const postValidation = validateJson(output);
  if (postValidation.isValid) {
    const indentOption = options.indent ?? 2;
    const formatted = formatJson(output, { indent: indentOption });
    const finalOutput = formatted.success ? formatted.output : output;

    return {
      success: true,
      output: finalOutput,
      original: input,
      fixes,
      changed: finalOutput !== input,
    };
  }

  return {
    success: false,
    output: input,
    original: input,
    fixes: [],
    changed: false,
    error: postValidation.error || 'Could not safely repair this JSON. The structure is too ambiguous or corrupt.',
  };
}
