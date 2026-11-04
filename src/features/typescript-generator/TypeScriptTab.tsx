import { useState, useMemo } from 'react';
import { generateTypeScript } from '../../lib/typescript-generator';
import { useClipboard } from '../../hooks/useClipboard';
import { StatusAlert } from '../../components/StatusAlert';

interface TypeScriptTabProps {
  json: string;
}

export function TypeScriptTab({ json }: TypeScriptTabProps) {
  const [rootName, setRootName] = useState('Root');
  const [exportTypes, setExportTypes] = useState(true);
  const { copied, copy } = useClipboard();

  const generated = useMemo(() => {
    if (!json.trim()) return null;
    return generateTypeScript(json, {
      rootName,
      exportTypes,
    });
  }, [json, rootName, exportTypes]);

  return (
    <div className="flex flex-col gap-4">
      {/* Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="root-name-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Root Name:
            </label>
            <input
              id="root-name-input"
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="e.g. UserResponse"
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={exportTypes}
              onChange={(e) => setExportTypes(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Include `export` keywords</span>
          </label>
        </div>

        {generated?.success && (
          <button
            type="button"
            onClick={() => copy(generated.code)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            {copied ? '✓ Copied Interfaces' : 'Copy TypeScript'}
          </button>
        )}
      </div>

      {/* Error state */}
      {generated && !generated.success && (
        <StatusAlert
          type="error"
          title="TypeScript Generation Error"
          message={generated.error || 'Failed to infer TypeScript interfaces. Please ensure your JSON is valid.'}
        />
      )}

      {/* Empty State */}
      {!json.trim() && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xl mb-3">
            TS
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            Ready to Generate TypeScript
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            Enter valid JSON in the Formatter tab to instantly convert it into clean, idiomatic TypeScript interfaces.
          </p>
        </div>
      )}

      {/* Output Code Display */}
      {generated?.success && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-mono text-zinc-500">
            <span>Generated Interfaces</span>
            <span>TypeScript</span>
          </div>
          <textarea
            readOnly
            value={generated.code}
            aria-label="Generated TypeScript interfaces"
            spellCheck={false}
            className="flex-1 p-3 font-mono text-xs sm:text-sm bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
