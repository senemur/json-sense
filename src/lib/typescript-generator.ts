import type { JsonValue, TypeScriptOptions } from '../types/json';
import { validateJson } from './validator';

interface InterfaceDefinition {
  name: string;
  fields: {
    key: string;
    type: string;
    optional: boolean;
  }[];
}

const TS_RESERVED_KEYWORDS = new Set([
  'any', 'unknown', 'never', 'void', 'null', 'undefined', 'boolean', 'number',
  'string', 'symbol', 'bigint', 'object', 'interface', 'type', 'class', 'enum',
  'function', 'const', 'var', 'let', 'export', 'import', 'default', 'return',
  'switch', 'case', 'break', 'continue', 'if', 'else', 'while', 'for', 'do',
  'in', 'of', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super',
  'extends', 'implements', 'package', 'private', 'protected', 'public',
  'static', 'yield', 'async', 'await'
]);

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[^a-zA-Z]+/, '')
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

function sanitizeInterfaceName(raw: string): string {
  let pascal = toPascalCase(raw) || 'Item';
  if (TS_RESERVED_KEYWORDS.has(pascal.toLowerCase())) {
    pascal = `${pascal}Data`;
  }
  return pascal;
}

/**
 * Converts a JSON string or parsed JSON object into TypeScript interfaces/types.
 * Absolutely safe: strictly parses with JSON.parse; never evaluates code.
 */
export function generateTypeScript(
  input: string | JsonValue,
  options: TypeScriptOptions = {}
): { success: boolean; code: string; error?: string } {
  let parsed: JsonValue;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, code: '', error: 'Input is empty' };
    }
    const validation = validateJson(input);
    if (!validation.isValid || validation.parsed === undefined) {
      return {
        success: false,
        code: '',
        error: validation.error || 'Invalid JSON syntax',
      };
    }
    parsed = validation.parsed;
  } else {
    parsed = input;
  }

  // Ensure rootName is a valid, sanitized PascalCase identifier
  const rawRoot = options.rootName?.trim() || 'Root';
  const rootName = sanitizeInterfaceName(rawRoot) || 'Root';
  const exportPrefix = options.exportTypes !== false ? 'export ' : '';

  try {
    const interfaces: InterfaceDefinition[] = [];
    const usedNames = new Set<string>();

    function getUniqueInterfaceName(baseName: string): string {
      const name = sanitizeInterfaceName(baseName);
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
      let counter = 2;
      while (usedNames.has(`${name}${counter}`)) {
        counter++;
      }
      const unique = `${name}${counter}`;
      usedNames.add(unique);
      return unique;
    }

    function inferType(val: JsonValue, fieldKey: string): string {
      if (val === null) {
        return 'null';
      }

      if (typeof val === 'string') {
        return 'string';
      }

      if (typeof val === 'number') {
        return 'number';
      }

      if (typeof val === 'boolean') {
        return 'boolean';
      }

      if (Array.isArray(val)) {
        if (val.length === 0) {
          return 'unknown[]';
        }

        // Check if all array elements are objects
        const areAllObjects = val.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item));

        if (areAllObjects) {
          // Merge objects in the array into a single interface definition
          const subInterfaceName = getUniqueInterfaceName(singularize(fieldKey));
          const mergedFields = mergeObjectArray(val as { [key: string]: JsonValue }[]);
          interfaces.push({
            name: subInterfaceName,
            fields: mergedFields,
          });
          return `${subInterfaceName}[]`;
        }

        // Collect all distinct element types
        const types = Array.from(new Set(val.map((item, idx) => inferType(item, `${fieldKey}Item${idx}`))));
        if (types.length === 1) {
          return `${types[0]}[]`;
        }
        return `(${types.join(' | ')})[]`;
      }

      if (typeof val === 'object') {
        const subInterfaceName = getUniqueInterfaceName(fieldKey);
        const fields = extractFields(val as { [key: string]: JsonValue });
        interfaces.push({
          name: subInterfaceName,
          fields,
        });
        return subInterfaceName;
      }

      return 'unknown';
    }

    function extractFields(obj: { [key: string]: JsonValue }) {
      return Object.entries(obj).map(([key, value]) => {
        const typeStr = inferType(value, key);
        return {
          key,
          type: typeStr,
          optional: false,
        };
      });
    }

    function mergeObjectArray(
      objects: { [key: string]: JsonValue }[]
    ) {
      const allKeys = new Set<string>();
      for (const obj of objects) {
        for (const k of Object.keys(obj)) {
          allKeys.add(k);
        }
      }

      const resultFields: { key: string; type: string; optional: boolean }[] = [];

      for (const key of Array.from(allKeys)) {
        const isPresentInAll = objects.every((o) => key in o);
        const presentValues = objects
          .filter((o) => key in o)
          .map((o) => o[key]);

        // Check if all present values are non-null objects
        const objectValues = presentValues.filter(
          (v): v is { [k: string]: JsonValue } =>
            v !== null && typeof v === 'object' && !Array.isArray(v)
        );
        const hasNull = presentValues.some((v) => v === null);
        const hasPrimitives = presentValues.some(
          (v) => v === null || typeof v !== 'object' || Array.isArray(v)
        );

        let finalType: string;

        // If all present values are objects (with optional nulls), merge them recursively
        if (objectValues.length > 0 && !hasPrimitives) {
          const nestedName = getUniqueInterfaceName(key);
          const nestedFields = mergeObjectArray(objectValues);
          interfaces.push({
            name: nestedName,
            fields: nestedFields,
          });
          finalType = hasNull ? `${nestedName} | null` : nestedName;
        } else {
          const typesForKey = new Set<string>();
          for (const val of presentValues) {
            typesForKey.add(inferType(val, key));
          }
          const typeArray = Array.from(typesForKey);
          finalType = typeArray.length > 0 ? typeArray.join(' | ') : 'unknown';
        }

        resultFields.push({
          key,
          type: finalType,
          optional: !isPresentInAll,
        });
      }

      return resultFields;
    }

    // Top level handling
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      usedNames.add(rootName);
      const rootFields = extractFields(parsed as { [key: string]: JsonValue });
      interfaces.unshift({
        name: rootName,
        fields: rootFields,
      });

      // Format interfaces into code
      const codeOutput = interfaces
        .map((iface) => {
          const fieldLines = iface.fields.map((f) => {
            const formattedKey = formatKey(f.key);
            const optMarker = f.optional ? '?' : '';
            return `  ${formattedKey}${optMarker}: ${f.type};`;
          });

          return `${exportPrefix}interface ${iface.name} {\n${fieldLines.join('\n')}\n}`;
        })
        .join('\n\n');

      return { success: true, code: codeOutput };
    }

    if (Array.isArray(parsed)) {
      usedNames.add(rootName);
      const arrayType = inferType(parsed, rootName);
      const rootTypeDecl = `${exportPrefix}type ${rootName} = ${arrayType};`;

      const codeOutput = interfaces.length > 0
        ? interfaces
            .map((iface) => {
              const fieldLines = iface.fields.map((f) => {
                const formattedKey = formatKey(f.key);
                const optMarker = f.optional ? '?' : '';
                return `  ${formattedKey}${optMarker}: ${f.type};`;
              });
              return `${exportPrefix}interface ${iface.name} {\n${fieldLines.join('\n')}\n}`;
            })
            .join('\n\n') + `\n\n${rootTypeDecl}`
        : rootTypeDecl;

      return { success: true, code: codeOutput };
    }

    // Primitive at root
    const primType = inferType(parsed, rootName);
    return {
      success: true,
      code: `${exportPrefix}type ${rootName} = ${primType};`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      code: '',
      error: err instanceof Error ? err.message : 'Failed to generate TypeScript',
    };
  }
}

function singularize(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es') && !str.endsWith('ss')) return str.slice(0, -2);
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

function formatKey(key: string): string {
  // If key is a valid JavaScript identifier, leave it as is
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}
