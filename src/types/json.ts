export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
  snippet?: string;
  parsed?: JsonValue;
}

export interface FormatOptions {
  indent: number | '\t';
}

export interface FormatResult {
  success: boolean;
  output: string;
  error?: string;
}

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffEntry {
  path: string;
  type: DiffType;
  oldValue?: JsonValue;
  newValue?: JsonValue;
}

export interface DiffResult {
  isEqual: boolean;
  changes: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
  errorLeft?: string;
  errorRight?: string;
}

export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export interface TreeNodeData {
  id: string;
  key: string;
  value: JsonValue;
  type: JsonNodeType;
  children?: TreeNodeData[];
  itemCount?: number;
}

export interface TypeScriptOptions {
  rootName?: string;
  exportTypes?: boolean;
}
