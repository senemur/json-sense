import { useState, useMemo } from 'react';
import { TextEditor } from '../../components/TextEditor';
import { StatusAlert } from '../../components/StatusAlert';
import { formatJson, minifyJson } from '../../lib/formatter';
import { validateJson } from '../../lib/validator';

interface FormatterTabProps {
  json: string;
  onChangeJson: (val: string) => void;
}

const SAMPLE_JSON = JSON.stringify(
  {
    app: 'JSON Buddy',
    version: '0.1.0',
    description: 'Privacy-focused developer JSON toolkit',
    features: ['Formatter', 'Validator', 'Tree Viewer', 'TypeScript Generator', 'JSON Diff'],
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

  return (
    <div className="flex flex-col gap-4">
      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs sm:text-sm hover:bg-indigo-700 transition shadow-sm cursor-pointer"
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

      {/* Error Alert Display */}
      {validation && !validation.isValid && (
        <StatusAlert
          type="error"
          title="JSON Syntax Error"
          message={validation.error || 'Invalid JSON'}
          line={validation.line}
          column={validation.column}
          snippet={validation.snippet}
        />
      )}

      {errorMessage && (!validation || validation.isValid) && (
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
          }}
          isValid={validation ? validation.isValid : null}
          onLoadSample={() => {
            onChangeJson(SAMPLE_JSON);
            setErrorMessage(null);
          }}
        />
      </div>
    </div>
  );
}
