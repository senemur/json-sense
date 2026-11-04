import { useState, useMemo } from 'react';
import { TreeNode } from './TreeNode';
import { buildTree, filterTree } from '../../lib/tree';
import { validateJson } from '../../lib/validator';
import { StatusAlert } from '../../components/StatusAlert';

interface TreeViewTabProps {
  json: string;
}

export function TreeViewTab({ json }: TreeViewTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandAllKey, setExpandAllKey] = useState(0); // increments to re-mount with new initialExpanded
  const [defaultExpanded, setDefaultExpanded] = useState(true);

  const validation = useMemo(() => {
    if (!json.trim()) return null;
    return validateJson(json);
  }, [json]);

  const treeData = useMemo(() => {
    if (!validation || !validation.isValid || validation.parsed === undefined) {
      return null;
    }
    const fullTree = buildTree(validation.parsed);
    return searchQuery ? filterTree(fullTree, searchQuery) : fullTree;
  }, [validation, searchQuery]);

  const handleToggleExpandAll = (expanded: boolean) => {
    setDefaultExpanded(expanded);
    setExpandAllKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-zinc-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter keys or values..."
            aria-label="Filter tree nodes"
            className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleExpandAll(true)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => handleToggleExpandAll(false)}
            className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Validation error notice */}
      {validation && !validation.isValid && (
        <StatusAlert
          type="error"
          title="Cannot Render Tree: Invalid JSON"
          message={validation.error || 'Please correct the JSON syntax to explore it as a tree.'}
          line={validation.line}
          column={validation.column}
          snippet={validation.snippet}
        />
      )}

      {/* Empty State */}
      {!json.trim() && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xl mb-3">
            🌲
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            No JSON to Explore
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            Paste or format valid JSON in the Formatter tab to view and inspect its collapsible tree structure here.
          </p>
        </div>
      )}

      {/* Tree Content */}
      {treeData && (
        <div
          key={expandAllKey}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-x-auto min-h-[400px] max-h-[650px]"
        >
          <TreeNode
            node={treeData}
            initialExpanded={defaultExpanded}
          />
        </div>
      )}

      {validation?.isValid && !treeData && searchQuery && (
        <div className="p-8 text-center text-xs text-zinc-500 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          No matching nodes found for "{searchQuery}".
        </div>
      )}
    </div>
  );
}
