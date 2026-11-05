import { useState, useMemo } from 'react';
import { TextEditor } from '../../components/TextEditor';
import { StatusAlert } from '../../components/StatusAlert';
import { SmartRepairPanel } from './SmartRepairPanel';
import { formatJson, minifyJson } from '../../lib/formatter';
import { validateJson } from '../../lib/validator';
import { repairJson } from '../../lib/repair';
import type { RepairResult } from '../../types/json';

interface FormatterTabProps {
  json: string;
  onChangeJson: (val: string) => void;
}

const SAMPLE_JSON = JSON.stringify(
  {
    app: 'JsonSense',
    tagline: 'Best Buddy for Json',
    version: '0.1.0',
    description: 'Privacy-focused developer JSON toolkit',
    features: ['Formatter', 'Validator', 'Tree Viewer', 'TypeScript Generator', 'JSON Diff', 'Smart Repair'],
    maintainer: {
      name: 'Senem',
      role: 'Software Engineer',
      active: true,
      contact: {
        github: 'senemur',
        email: null,
      },
    },
    metrics: {
      stars: 120,
      downloads: 4500,
      isProductionReady: true,
    },
  },
  null,
  2
);

export function FormatterTab({ json, onChangeJson }: FormatterTabProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [previousJson, setPreviousJson] = useState<string | null>(null);

  const validation = useMemo(() => {
    if (!json.trim()) return null;
    return validateJson(json);
  }, [json]);

  const handleFormat = (indent: 2 | 4) => {
    const res = formatJson(json, { indent });
    if (res.success) {
      onChangeJson(res.output);
      setErrorMessage(null);
    } else {
      setErrorMessage(res.error || 'Formatting failed');
    }
  };

  const handleMinify = () => {
    const res = minifyJson(json);
    if (res.success) {
      onChangeJson(res.output);
      setErrorMessage(null);
    } else {
      setErrorMessage(res.error || 'Minification failed');
    }
  };

  const handleValidate = () => {
    const res = validateJson(json);
    if (!res.isValid) {
      setErrorMessage(res.error || 'Invalid JSON');
    } else {
      setErrorMessage(null);
    }
  };

  const handleSmartRepair = () => {
    const res = repairJson(json);
    setRepairResult(res);
    if (!res.success) {
      setErrorMessage(res.error || 'Could not safely repair JSON.');
    } else {
      setErrorMessage(null);
    }
  };

  const handleApplyRepaired = (repairedOutput: string) => {
    setPreviousJson(json);
    onChangeJson(repairedOutput);
    setRepairResult(null);
    setErrorMessage(null);
  };

  const handleRevertToOriginal = () => {
    if (previousJson !== null) {
      onChangeJson(previousJson);
      setPreviousJson(null);
      setRepairResult(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white font-medium text-xs sm:text-sm transition shadow-sm cursor-pointer"
          >
            Format (2 Spaces)
          </button>
          <button
            type="button"
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Format (4 Spaces)
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Check Validity
          </button>
          <button
            type="button"
            onClick={handleSmartRepair}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer ${
              validation && !validation.isValid
                ? 'bg-[#8d2f43] hover:bg-[#732334] text-[#e6c76e] shadow-sm ring-2 ring-[#e6c76e]/50'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-[#8d2f43]/10 dark:hover:bg-[#8d2f43]/20'
            }`}
          >
            <span>✨</span>
            <span>Smart Repair</span>
          </button>
        </div>

        {validation && (
          <div className="text-xs font-medium">
            {validation.isValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Valid JSON Syntax
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                ⚠️ Invalid Syntax
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reversion Notice if previously applied */}
      {previousJson !== null && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Repaired JSON applied to editor.</span>
          </div>
          <button
            type="button"
            onClick={handleRevertToOriginal}
            className="font-medium underline hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer"
          >
            Revert to original input
          </button>
        </div>
      )}

      {/* Smart Repair Interactive Review Panel */}
      {repairResult && (
        <SmartRepairPanel
          result={repairResult}
          onApply={handleApplyRepaired}
          onClose={() => setRepairResult(null)}
        />
      )}

      {/* Error Alert Display with Smart Repair Suggestion */}
      {validation && !validation.isValid && !repairResult && (
        <div className="flex flex-col gap-2">
          <StatusAlert
            type="error"
            title="JSON Syntax Error"
            message={validation.error || 'Invalid JSON'}
            line={validation.line}
            column={validation.column}
            snippet={validation.snippet}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-[#8d2f43]/25 dark:border-[#8d2f43]/40 bg-[#f7f3f3] dark:bg-[#190c10]/70 text-xs">
            <div className="flex items-center gap-2 text-[#8d2f43] dark:text-[#e6c76e]">
              <span className="text-sm">💡</span>
              <span>
                Detected syntax issues. Smart Repair can automatically fix unquoted keys, trailing commas, single quotes, or comments.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSmartRepair}
              className="px-3 py-1 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-[#e6c76e] font-medium shadow-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <span>✨</span>
              <span>Repair JSON Now</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (!validation || validation.isValid) && !repairResult && (
        <StatusAlert
          type="error"
          title="Operation Error"
          message={errorMessage}
        />
      )}

      {/* Editor Pane */}
      <div className="h-[520px]">
        <TextEditor
          label="JSON Input"
          value={json}
          onChange={(val) => {
            onChangeJson(val);
            setErrorMessage(null);
            setRepairResult(null);
          }}
          isValid={validation ? validation.isValid : null}
          onLoadSample={() => {
            onChangeJson(SAMPLE_JSON);
            setErrorMessage(null);
            setRepairResult(null);
            setPreviousJson(null);
          }}
        />
      </div>
    </div>
  );
}
