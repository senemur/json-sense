import type { RepairResult, RepairFix } from '../../types/json';
import { useClipboard } from '../../hooks/useClipboard';

interface SmartRepairPanelProps {
  result: RepairResult;
  onApply: (repairedJson: string) => void;
  onClose: () => void;
}

export function SmartRepairPanel({
  result,
  onApply,
  onClose,
}: SmartRepairPanelProps) {
  const { copied, copy } = useClipboard();

  const getBadgeColor = (type: RepairFix['type']) => {
    switch (type) {
      case 'unquoted-key':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'trailing-comma':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'single-quote':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'comment':
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
      case 'literal':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'unclosed-container':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const formatFixTypeLabel = (type: RepairFix['type']) => {
    switch (type) {
      case 'unquoted-key':
        return 'Unquoted Key';
      case 'trailing-comma':
        return 'Trailing Comma';
      case 'single-quote':
        return 'Single Quote';
      case 'comment':
        return 'Comment';
      case 'literal':
        return 'Literal';
      case 'unclosed-container':
        return 'Unclosed Container';
      case 'number-format':
        return 'Number Format';
      case 'escaped-char':
        return 'Escape Sequence';
      default:
        return type;
    }
  };

  return (
    <div
      role="region"
      aria-label="Smart JSON Repair Review"
      className="flex flex-col gap-3 p-4 rounded-xl border border-[#8d2f43]/25 dark:border-[#8d2f43]/40 bg-[#f7f3f3] dark:bg-[#190c10]/80 shadow-sm"
    >
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#8d2f43]/15 dark:border-[#8d2f43]/30">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">✨</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Smart Repair Results
              </h3>
              {result.success && result.changed && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#8d2f43]/10 text-[#8d2f43] dark:bg-[#8d2f43]/30 dark:text-[#e6c76e] border border-[#8d2f43]/20 dark:border-[#8d2f43]/40">
                  ✓ {result.fixes.length} {result.fixes.length === 1 ? 'fix' : 'fixes'} applied
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Review applied syntax corrections before updating your editor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result.success && result.changed && (
            <>
              <button
                type="button"
                onClick={() => onApply(result.output)}
                className="px-3 py-1.5 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white font-medium text-xs shadow-sm ring-1 ring-[#e6c76e]/40 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>Apply to Editor</span>
              </button>

              <button
                type="button"
                onClick={() => copy(result.output)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-[#8d2f43]/10 dark:hover:bg-[#8d2f43]/20 text-xs font-medium transition cursor-pointer"
              >
                {copied ? '✓ Copied' : 'Copy Repaired'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Applied Fixes List */}
      {result.fixes.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Detected and Resolved Issues:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {result.fixes.map((fix) => (
              <div
                key={fix.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${getBadgeColor(
                    fix.type
                  )}`}
                >
                  {formatFixTypeLabel(fix.type)}
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px] truncate flex-1" title={fix.description}>
                  {fix.description}
                </span>
                {fix.line && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    L{fix.line}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1">
        {/* Original */}
        <div className="flex flex-col rounded-lg border border-red-200 dark:border-red-950/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-3 py-1.5 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-950/80 text-xs font-medium text-red-800 dark:text-red-300">
            <span>Original (Broken Syntax)</span>
            <span className="font-mono text-[10px]">Read Only</span>
          </div>
          <div className="p-3 h-48 overflow-auto font-mono text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre leading-relaxed select-text">
            {result.original}
          </div>
        </div>

        {/* Repaired */}
        <div className="flex flex-col rounded-lg border border-emerald-200 dark:border-emerald-950/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-950/80 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <span>Repaired (Valid JSON)</span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">✓ Valid Syntax</span>
          </div>
          <div className="p-3 h-48 overflow-auto font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre leading-relaxed select-text">
            {result.output}
          </div>
        </div>
      </div>
    </div>
  );
}
