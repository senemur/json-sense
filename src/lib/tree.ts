import type { JsonValue, TreeNodeData, JsonNodeType } from '../types/json';

export function getNodeType(val: unknown): JsonNodeType {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  const t = typeof val;
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  if (t === 'object') return 'object';
  return 'string';
}

/**
 * Builds a structured, recursive tree representation of any valid JSON value.
 */
export function buildTree(value: JsonValue, key = 'root', path = 'root'): TreeNodeData {
  const type = getNodeType(value);

  if (type === 'object' && value !== null && !Array.isArray(value)) {
    const entries = Object.entries(value);
    const children: TreeNodeData[] = entries.map(([childKey, childVal]) =>
      buildTree(childVal, childKey, `${path}.${childKey}`)
    );

    return {
      id: path,
      key,
      value,
      type: 'object',
      children,
      itemCount: entries.length,
    };
  }

  if (type === 'array' && Array.isArray(value)) {
    const children: TreeNodeData[] = value.map((item, idx) =>
      buildTree(item, `[${idx}]`, `${path}[${idx}]`)
    );

    return {
      id: path,
      key,
      value,
      type: 'array',
      children,
      itemCount: value.length,
    };
  }

  return {
    id: path,
    key,
    value,
    type,
  };
}

/**
 * Recursively filters tree nodes matching a search query in key or stringified value.
 */
export function filterTree(node: TreeNodeData, query: string): TreeNodeData | null {
  const q = query.toLowerCase().trim();
  if (!q) return node;

  const keyMatches = node.key.toLowerCase().includes(q);
  const valueMatches =
    node.type !== 'object' &&
    node.type !== 'array' &&
    String(node.value).toLowerCase().includes(q);

  if (node.children) {
    const filteredChildren = node.children
      .map((child) => filterTree(child, q))
      .filter((child): child is TreeNodeData => child !== null);

    if (filteredChildren.length > 0 || keyMatches) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
    return null;
  }

  return keyMatches || valueMatches ? node : null;
}
