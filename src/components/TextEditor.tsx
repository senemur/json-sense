import { useMemo } from 'react';
import { getJsonStats } from '../lib/formatter';
import { useClipboard } from '../hooks/useClipboard';

interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  isValid?: boolean | null; // null if empty
  label?: string;
  onLoadSample?: () => void;
  actions?: React.ReactNode;
}

export function TextEditor({
  value,
  onChange,
  placeholder = 'Paste or type JSON here...',
  readOnly = false,
  isValid = null,
  label,
  onLoadSample,
  actions,
}: TextEditorProps) {
  const { copied, copy } = useClipboard();
  const stats = useMemo(() => getJsonStats(value), [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    // Allow Tab key to insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs">
        <div className="flex items-center gap-2">
          {label && (
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
          )}
          {isValid !== null && (
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                isValid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {isValid ? 'Valid JSON' : 'Invalid Syntax'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {actions}
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              className="px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              Sample
            </button>
          )}
          {value && (
            <button
              type="button"
              onClick={() => copy(value)}
              className="px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          {!readOnly && value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-1 min-h-[300px]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-label={label || 'JSON Editor'}
          spellCheck={false}
          className="w-full h-full p-3 font-mono text-xs sm:text-sm bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 leading-relaxed"
        />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span>{stats.lines} lines</span>
          <span>{stats.chars} chars</span>
          <span>{formatByteSize(stats.bytes)}</span>
        </div>
        <div>{readOnly ? 'Read Only' : 'UTF-8'}</div>
      </div>
    </div>
  );
}
