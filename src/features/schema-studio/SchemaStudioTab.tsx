import { useState, useMemo } from 'react';
import { inferJsonSchema } from '../../lib/schema-inferrer';
import { validateAgainstSchema } from '../../lib/schema-validator';
import { useClipboard } from '../../hooks/useClipboard';
import { StatusAlert } from '../../components/StatusAlert';
import type { SchemaValidationError } from '../../types/json';

interface SampleItem {
  id: string;
  name: string;
  json: string;
}

const PRESET_USER_PROFILES: SampleItem[] = [
  {
    id: 's1',
    name: 'Sample 1',
    json: JSON.stringify(
      {
        id: 1,
        name: 'Senem',
        email: 'senem@example.com',
      },
      null,
      2
    ),
  },
  {
    id: 's2',
    name: 'Sample 2',
    json: JSON.stringify(
      {
        id: 2,
        name: 'Alex',
        active: true,
      },
      null,
      2
    ),
  },
];

const PRESET_ECOMMERCE: SampleItem[] = [
  {
    id: 'e1',
    name: 'Product 1',
    json: JSON.stringify(
      {
        sku: 'PROD-101',
        title: 'Mechanical Keyboard',
        price: 129.99,
        inStock: true,
        tags: ['peripherals', 'hardware'],
      },
      null,
      2
    ),
  },
  {
    id: 'e2',
    name: 'Product 2',
    json: JSON.stringify(
      {
        sku: 'PROD-102',
        title: 'USB-C Cable',
        price: 15,
        discount: null,
        tags: ['accessories'],
      },
      null,
      2
    ),
  },
];

export function SchemaStudioTab() {
  // Mode switcher
  const [activeMode, setActiveMode] = useState<'inference' | 'validation'>('inference');

  // Samples State
  const [samples, setSamples] = useState<SampleItem[]>(PRESET_USER_PROFILES);
  const [activeSampleId, setActiveSampleId] = useState<string>('s1');
  const [schemaTitle, setSchemaTitle] = useState<string>('UserProfileSchema');

  // Inferred Schema Output
  const [inferredSchemaText, setInferredSchemaText] = useState<string>(() => {
    const res = inferJsonSchema(
      PRESET_USER_PROFILES.map((s) => s.json),
      { title: 'UserProfileSchema' }
    );
    return res.schemaString || '';
  });

  // Validation Workbench State
  const [validatorSchemaText, setValidatorSchemaText] = useState<string>(() => {
    return inferredSchemaText;
  });
  const [targetDataText, setTargetDataText] = useState<string>(
    JSON.stringify(
      {
        id: 3,
        name: 'Jordan',
        email: 'jordan@example.com',
        active: false,
      },
      null,
      2
    )
  );

  // Validation Execution State
  const [validationRunCount, setValidationRunCount] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: SchemaValidationError[];
  } | null>(null);

  // Clipboard hooks
  const { copied: copiedSchema, copy: copySchema } = useClipboard();
  const { copied: copiedPath, copy: copyPath } = useClipboard();

  // Active sample accessor
  const currentSample = useMemo(() => {
    return samples.find((s) => s.id === activeSampleId) || samples[0];
  }, [samples, activeSampleId]);

  // Handle sample content change
  const handleUpdateCurrentSample = (newJson: string) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === activeSampleId ? { ...s, json: newJson } : s))
    );
  };

  // Add sample
  const handleAddSample = () => {
    const newId = `s_${Date.now()}`;
    const newIndex = samples.length + 1;
    const newSample: SampleItem = {
      id: newId,
      name: `Sample ${newIndex}`,
      json: '{\n  \n}',
    };
    setSamples((prev) => [...prev, newSample]);
    setActiveSampleId(newId);
  };

  // Remove sample
  const handleRemoveSample = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (samples.length <= 1) return;
    const remaining = samples.filter((s) => s.id !== idToRemove);
    setSamples(remaining);
    if (activeSampleId === idToRemove) {
      setActiveSampleId(remaining[0].id);
    }
  };

  // Run Inference
  const handleRunInference = () => {
    const result = inferJsonSchema(
      samples.map((s) => s.json),
      { title: schemaTitle }
    );
    if (result.success) {
      setInferredSchemaText(result.schemaString);
      setValidatorSchemaText(result.schemaString);
    } else {
      setInferredSchemaText('');
    }
  };

  // Run Validation
  const handleRunValidation = () => {
    try {
      const parsedData = JSON.parse(targetDataText);
      const res = validateAgainstSchema(parsedData, validatorSchemaText);
      setValidationResult(res);
      setValidationRunCount((c) => c + 1);
    } catch (err) {
      setValidationResult({
        isValid: false,
        errors: [
          {
            path: '$',
            keyword: 'syntax',
            message: `Target data is not valid JSON: ${err instanceof Error ? err.message : 'Syntax error'}`,
          },
        ],
      });
      setValidationRunCount((c) => c + 1);
    }
  };

  // Preset Loaders
  const loadPreset = (type: 'user' | 'ecommerce') => {
    const preset = type === 'user' ? PRESET_USER_PROFILES : PRESET_ECOMMERCE;
    const title = type === 'user' ? 'UserProfileSchema' : 'ProductSchema';
    setSamples(preset);
    setActiveSampleId(preset[0].id);
    setSchemaTitle(title);
    const res = inferJsonSchema(
      preset.map((s) => s.json),
      { title }
    );
    if (res.success) {
      setInferredSchemaText(res.schemaString);
      setValidatorSchemaText(res.schemaString);
    }
    if (type === 'user') {
      setTargetDataText(
        JSON.stringify({ id: 3, name: 'Jordan', email: 'jordan@example.com', active: false }, null, 2)
      );
    } else {
      setTargetDataText(
        JSON.stringify(
          {
            sku: 'PROD-103',
            title: 'Gaming Mouse',
            price: 59.99,
            inStock: true,
            tags: ['peripherals'],
          },
          null,
          2
        )
      );
    }
    setValidationResult(null);
  };

  // Load sample payloads for validation
  const loadValidPayload = () => {
    setTargetDataText(
      JSON.stringify(
        {
          id: 42,
          name: 'Morgan',
          email: 'morgan@example.com',
          active: true,
        },
        null,
        2
      )
    );
    setValidationResult(null);
  };

  const loadInvalidPayload = () => {
    setTargetDataText(
      JSON.stringify(
        {
          id: 'not-an-integer',
          // name is missing (required in inferred schema)
          email: null,
          active: 'yes', // should be boolean
        },
        null,
        2
      )
    );
    setValidationResult(null);
  };

  // Switch to validation tab and transfer schema
  const handleTransferToValidator = () => {
    setValidatorSchemaText(inferredSchemaText);
    setActiveMode('validation');
  };

  // Download schema file
  const handleDownloadSchema = () => {
    const blob = new Blob([inferredSchemaText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schemaTitle.toLowerCase() || 'schema'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Studio Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 bg-white dark:bg-[#180c10] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📐</span>
            <h2 className="text-lg font-bold text-[#8d2f43] dark:text-[#e6c76e]">Schema Studio</h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[#8d2f43]/10 text-[#8d2f43] dark:bg-[#8d2f43]/30 dark:text-[#e6c76e] border border-[#8d2f43]/20">
              Draft-07
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Infer standard JSON Schema specifications from single or multiple payloads, and validate target data.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            aria-label="Schema Inference Tab"
            onClick={() => setActiveMode('inference')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'inference'
                ? 'bg-[#8d2f43] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>🧬</span>
            <span>Schema Inference</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {samples.length}
            </span>
          </button>
          <button
            type="button"
            aria-label="Validation Workbench Tab"
            onClick={() => setActiveMode('validation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'validation'
                ? 'bg-[#8d2f43] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>🎯</span>
            <span>Validation Workbench</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('user')}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 text-zinc-700 dark:text-zinc-300 font-medium transition cursor-pointer"
          >
            👤 User Profile Variations
          </button>
          <button
            type="button"
            onClick={() => loadPreset('ecommerce')}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 text-zinc-700 dark:text-zinc-300 font-medium transition cursor-pointer"
          >
            🛍️ E-Commerce Catalog
          </button>
        </div>

        <div className="text-zinc-500 text-[11px]">
          {activeMode === 'inference'
            ? 'Unified inference analyzes union types, required intersections & integers.'
            : 'Strict Draft-07 specification validation with JSONPath tracking.'}
        </div>
      </div>

      {/* MODE 1: SCHEMA INFERENCE */}
      {activeMode === 'inference' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Multi-sample editor */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Sample Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSampleId(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-2 border ${
                      activeSampleId === s.id
                        ? 'bg-white dark:bg-zinc-900 border-[#8d2f43] dark:border-[#e6c76e] text-[#8d2f43] dark:text-[#e6c76e] shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span>{s.name}</span>
                    {samples.length > 1 && (
                      <span
                        onClick={(e) => handleRemoveSample(s.id, e)}
                        className="text-zinc-400 hover:text-red-500 rounded p-0.5 transition cursor-pointer"
                        title="Remove this sample"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddSample}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
                  title="Add another JSON sample"
                >
                  + Add Sample
                </button>
              </div>
            </div>

            {/* Title & Inference Control */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <label htmlFor="schema-title-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Schema Title:
              </label>
              <input
                id="schema-title-input"
                type="text"
                value={schemaTitle}
                onChange={(e) => setSchemaTitle(e.target.value)}
                placeholder="e.g. UserProfileSchema"
                className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#8d2f43]"
              />
              <button
                type="button"
                onClick={handleRunInference}
                className="px-3.5 py-1.5 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Infer Schema ➔
              </button>
            </div>

            {/* Current Sample JSON Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                <span>Edit JSON content for {currentSample?.name}:</span>
                <span className="font-mono text-[11px]">
                  {currentSample?.json.length || 0} chars
                </span>
              </div>
              <textarea
                value={currentSample?.json || ''}
                onChange={(e) => handleUpdateCurrentSample(e.target.value)}
                rows={16}
                spellCheck={false}
                placeholder="Paste or edit JSON sample here..."
                className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8d2f43] resize-y"
              />
            </div>
          </div>

          {/* Right Column: Inferred JSON Schema Output */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Inferred JSON Schema (Draft-07)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copySchema(inferredSchemaText)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  {copiedSchema ? '✓ Copied' : 'Copy Schema'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSchema}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                  title="Download schema as JSON file"
                >
                  💾 Download
                </button>
              </div>
            </div>

            {/* Schema Textarea / Display */}
            <textarea
              readOnly
              value={inferredSchemaText}
              rows={18}
              spellCheck={false}
              className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none resize-y"
            />

            {/* Action to transfer to Validator Workbench */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#8d2f43]/15 dark:border-[#8d2f43]/30 bg-[#8d2f43]/5 dark:bg-[#8d2f43]/10">
              <div className="text-xs text-[#8d2f43] dark:text-[#e6c76e] font-medium">
                Want to test new payloads against this inferred schema?
              </div>
              <button
                type="button"
                onClick={handleTransferToValidator}
                className="px-3 py-1.5 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Open in Validation Workbench ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: VALIDATION WORKBENCH */}
      {activeMode === 'validation' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: JSON Schema */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  JSON Schema Specification
                </span>
                <button
                  type="button"
                  onClick={() => setValidatorSchemaText(inferredSchemaText)}
                  className="text-xs text-[#8d2f43] dark:text-[#e6c76e] hover:underline font-medium cursor-pointer"
                >
                  Reset to Inferred Schema
                </button>
              </div>
              <textarea
                value={validatorSchemaText}
                onChange={(e) => setValidatorSchemaText(e.target.value)}
                rows={14}
                spellCheck={false}
                placeholder="Enter or paste JSON Schema (Draft-07)..."
                className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8d2f43] resize-y"
              />
            </div>

            {/* Column 2: Target JSON Data */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Target JSON Data to Validate
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadValidPayload}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    Load Valid Data
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                  <button
                    type="button"
                    onClick={loadInvalidPayload}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                  >
                    Load Invalid Data
                  </button>
                </div>
              </div>
              <textarea
                value={targetDataText}
                onChange={(e) => setTargetDataText(e.target.value)}
                rows={14}
                spellCheck={false}
                placeholder="Enter or paste target JSON payload..."
                className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8d2f43] resize-y"
              />
            </div>
          </div>

          {/* Validation Action Button */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Validates types, required fields, enum values, array items, and min/max constraints against the schema.
            </div>
            <button
              type="button"
              onClick={handleRunValidation}
              className="px-4 py-2 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <span>🎯</span>
              <span>Validate Against Schema</span>
            </button>
          </div>

          {/* Validation Result Display */}
          {validationRunCount > 0 && validationResult && (
            <div className="flex flex-col gap-4">
              {validationResult.isValid ? (
                <StatusAlert
                  type="success"
                  title="Schema Validation Passed"
                  message="The target JSON data fully satisfies all constraints, required fields, and type specifications of the schema."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <StatusAlert
                    type="error"
                    title={`Schema Validation Failed (${validationResult.errors.length} ${
                      validationResult.errors.length === 1 ? 'error' : 'errors'
                    })`}
                    message="The payload violates one or more JSON Schema specifications. Review the details below:"
                  />

                  {/* Error Table */}
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-semibold">
                          <th className="p-3">JSON Path</th>
                          <th className="p-3">Keyword</th>
                          <th className="p-3">Violation Message</th>
                          <th className="p-3">Expected</th>
                          <th className="p-3">Received</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {validationResult.errors.map((err, idx) => (
                          <tr
                            key={`${err.path}-${err.keyword}-${idx}`}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition"
                          >
                            <td className="p-3 font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e]">
                              {err.path}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                {err.keyword}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-800 dark:text-zinc-200">
                              {err.message}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                              {err.expected || '—'}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-rose-600 dark:text-rose-400">
                              {err.received || '—'}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => copyPath(err.path)}
                                className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                              >
                                {copiedPath ? '✓ Copied' : 'Copy Path'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
