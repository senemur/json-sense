import { describe, it, expect } from 'vitest';
import { buildTree, filterTree, getNodeType } from '../lib/tree';

describe('Tree utilities', () => {
  it('detects node types correctly', () => {
    expect(getNodeType(null)).toBe('null');
    expect(getNodeType([1, 2])).toBe('array');
    expect(getNodeType({ a: 1 })).toBe('object');
    expect(getNodeType('str')).toBe('string');
    expect(getNodeType(123)).toBe('number');
    expect(getNodeType(true)).toBe('boolean');
  });

  it('builds recursive tree for nested objects and arrays', () => {
    const data = {
      project: 'JsonSense',
      version: 1,
      tags: ['json', 'tools'],
      meta: {
        active: true,
        author: null,
      },
    };

    const tree = buildTree(data);
    expect(tree.type).toBe('object');
    expect(tree.itemCount).toBe(4);
    expect(tree.children).toHaveLength(4);

    const tagsNode = tree.children?.find((c) => c.key === 'tags');
    expect(tagsNode?.type).toBe('array');
    expect(tagsNode?.itemCount).toBe(2);
    expect(tagsNode?.children).toHaveLength(2);

    const metaNode = tree.children?.find((c) => c.key === 'meta');
    expect(metaNode?.type).toBe('object');
    expect(metaNode?.itemCount).toBe(2);
  });

  it('filters tree by search term', () => {
    const data = {
      user: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      settings: {
        theme: 'dark',
      },
    };

    const tree = buildTree(data);
    const filtered = filterTree(tree, 'alice');
    expect(filtered).not.toBeNull();
    // settings should not be included unless it matched
    const settingsNode = filtered?.children?.find((c) => c.key === 'settings');
    expect(settingsNode).toBeUndefined();

    const userNode = filtered?.children?.find((c) => c.key === 'user');
    expect(userNode).toBeDefined();
  });
});
