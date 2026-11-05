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

export type RepairFixType =
  | 'unquoted-key'
  | 'single-quote'
  | 'trailing-comma'
  | 'comment'
  | 'literal'
  | 'unclosed-container'
  | 'escaped-char'
  | 'number-format';

export type RepairConfidence = 'high' | 'medium' | 'low';

export interface RepairFix {
  id: string;
  type: RepairFixType;
  description: string;
  line?: number;
  column?: number;
  confidence: RepairConfidence;
  explanation?: string;
}

export interface RepairOptions {
  indent?: 2 | 4;
}

export interface RepairResult {
  success: boolean;
  output: string;
  original: string;
  fixes: RepairFix[];
  changed: boolean;
  error?: string;
}

export type InspectorSeverity = 'warning' | 'info';

export type InspectorCategory =
  | 'type-inconsistency'
  | 'schema-inconsistency'
  | 'empty-value'
  | 'null-value'
  | 'empty-container'
  | 'duplicate-value';

export interface InspectorFinding {
  id: string;
  category: InspectorCategory;
  severity: InspectorSeverity;
  path: string;
  message: string;
  details?: string;
  valueSummary?: string;
}

export interface InspectorStats {
  totalObjects: number;
  totalArrays: number;
  totalProperties: number;
  distinctKeysCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
  totalValues: number;
  maxDepth: number;
  longestArray: { path: string; length: number } | null;
  largestObject: { path: string; propertyCount: number } | null;
  byteSize: number;
}

export interface InspectorResult {
  isValid: boolean;
  error?: string;
  stats: InspectorStats;
  findings: InspectorFinding[];
  summary: {
    totalFindings: number;
    warningCount: number;
    infoCount: number;
    qualityScore: number;
  };
}

