import { useState } from 'react';
import type { TreeNodeData, JsonNodeType } from '../../types/json';
import { useClipboard } from '../../hooks/useClipboard';

interface TreeNodeProps {
  node: TreeNodeData;
  depth?: number;
  initialExpanded?: boolean;
}

export function TreeNode({
  node,
  depth = 0,
  initialExpanded,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(
    initialExpanded !== undefined ? initialExpanded : depth < 2
  );
  const { copied, copy } = useClipboard(1500);

  const isContainer = node.type === 'object' || node.type === 'array';

  const getTypeBadge = (type: JsonNodeType) => {
    const styles: Record<JsonNodeType, string> = {
      string: 'text-emerald-600 dark:text-emerald-400',
      number: 'text-amber-600 dark:text-amber-400',
      boolean: 'text-purple-600 dark:text-purple-400',
      null: 'text-rose-600 dark:text-rose-400 font-semibold',
      object: 'text-blue-600 dark:text-blue-400',
      array: 'text-cyan-600 dark:text-cyan-400',
    };
    return (
      <span className={`text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 ${styles[type]}`}>
        {type}
      </span>
    );
  };

  const renderValuePreview = () => {
    if (node.value === null) {
      return <span className="text-rose-500 font-mono">null</span>;
    }
    if (typeof node.value === 'string') {
      return (
        <span className="text-emerald-600 dark:text-emerald-400 font-mono break-all">
          "{node.value}"
        </span>
      );
    }
    if (typeof node.value === 'number') {
      return (
        <span className="text-amber-600 dark:text-amber-400 font-mono">
          {node.value}
        </span>
      );
    }
    if (typeof node.value === 'boolean') {
      return (
        <span className="text-purple-600 dark:text-purple-400 font-mono">
          {String(node.value)}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="font-mono text-xs select-text">
      <div
        className="group flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
        style={{ paddingLeft: `${Math.max(4, depth * 16)}px` }}
      >
        {/* Toggle chevron for containers */}
        {isContainer ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="w-4 h-4 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center text-zinc-300 dark:text-zinc-700 text-[10px]">
            •
          </span>
        )}

        {/* Key name */}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {node.key}:
        </span>

        {/* Type Badge */}
        {getTypeBadge(node.type)}

        {/* Item count for containers */}
        {isContainer && (
          <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
            {node.type === 'object'
              ? `{ ${node.itemCount} ${node.itemCount === 1 ? 'key' : 'keys'} }`
              : `[ ${node.itemCount} ${node.itemCount === 1 ? 'item' : 'items'} ]`}
          </span>
        )}

        {/* Value preview for primitives */}
        {!isContainer && renderValuePreview()}

        {/* Copy path shortcut */}
        <button
          type="button"
          onClick={() => copy(node.id)}
          title={`Copy path: ${node.id}`}
          className="opacity-0 group-hover:opacity-100 text-[10px] px-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 transition cursor-pointer"
        >
          {copied ? '✓' : 'path'}
        </button>
      </div>

      {/* Children list */}
      {isContainer && isExpanded && node.children && (
        <div className="border-l border-zinc-200 dark:border-zinc-800/80 ml-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              initialExpanded={initialExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
