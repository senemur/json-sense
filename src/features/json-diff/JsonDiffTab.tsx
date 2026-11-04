import { useState, useMemo } from 'react';
import { TextEditor } from '../../components/TextEditor';
import { compareJson } from '../../lib/diff';
import { StatusAlert } from '../../components/StatusAlert';
import type { DiffEntry } from '../../types/json';

const SAMPLE_LEFT = JSON.stringify(
  {
    name: 'JSON Buddy',
    version: '0.1.0',
    features: ['format', 'validate'],
    settings: {
      theme: 'dark',
      tabSize: 2,
    },
    status: 'beta',
  },
  null,
  2
);

const SAMPLE_RIGHT = JSON.stringify(
  {
    name: 'JSON Buddy Pro',
    version: '0.2.0',
    features: ['format', 'validate', 'tree-view', 'diff'],
    settings: {
      theme: 'system',
      tabSize: 2,
      autoSave: true,
    },
  },
  null,
  2
);

export function JsonDiffTab() {
  const [leftJson, setLeftJson] = useState(SAMPLE_LEFT);
  const [rightJson, setRightJson] = useState(SAMPLE_RIGHT);

  const diffResult = useMemo(() => {
    return compareJson(leftJson, rightJson);
  }, [leftJson, rightJson]);

  const loadSamples = () => {
    setLeftJson(SAMPLE_LEFT);
    setRightJson(SAMPLE_RIGHT);
  };

  const renderDiffBadge = (type: DiffEntry['type']) => {
    const badges = {
      added: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      removed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      modified: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      unchanged: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200',
    };
    return (
      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${badges[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Diff Controls & Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSamples}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            Load Comparison Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftJson('');
              setRightJson('');
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Clear Both
          </button>
        </div>

        {/* Diff Result Summary Badges */}
        {diffResult && !diffResult.errorLeft && !diffResult.errorRight && (
          <div className="flex items-center gap-2 text-xs font-mono">
            {diffResult.isEqual ? (
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                ✓ Identical JSON
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  +{diffResult.summary.added} added
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  -{diffResult.summary.removed} removed
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  ~{diffResult.summary.modified} modified
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error notices */}
      {diffResult?.errorLeft && (
        <StatusAlert
          type="error"
          title="Left JSON Error"
          message={diffResult.errorLeft}
        />
      )}
      {diffResult?.errorRight && (
        <StatusAlert
          type="error"
          title="Right JSON Error"
          message={diffResult.errorRight}
        />
      )}

      {/* Two Pane Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[380px]">
        <TextEditor
          label="Original (Left)"
          value={leftJson}
          onChange={setLeftJson}
          placeholder="Paste original JSON..."
        />
        <TextEditor
          label="Modified (Right)"
          value={rightJson}
          onChange={setRightJson}
          placeholder="Paste modified JSON..."
        />
      </div>

      {/* Granular Diff Inspector Table */}
      {diffResult && !diffResult.errorLeft && !diffResult.errorRight && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Detailed Diff View ({diffResult.changes.filter((c) => c.type !== 'unchanged').length} changes)
            </span>
          </div>

          <div className="overflow-x-auto max-h-[350px]">
            {diffResult.isEqual ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Both JSON inputs have identical keys and values.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="py-2 px-3 w-28">Type</th>
                    <th className="py-2 px-3">Property Path</th>
                    <th className="py-2 px-3">Original (Left)</th>
                    <th className="py-2 px-3">Modified (Right)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {diffResult.changes
                    .filter((c) => c.type !== 'unchanged')
                    .map((item, idx) => (
                      <tr
                        key={`${item.path}-${idx}`}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-2 px-3">{renderDiffBadge(item.type)}</td>
                        <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">
                          {item.path}
                        </td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400 break-all">
                          {item.oldValue !== undefined ? JSON.stringify(item.oldValue) : '-'}
                        </td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 break-all">
                          {item.newValue !== undefined ? JSON.stringify(item.newValue) : '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
