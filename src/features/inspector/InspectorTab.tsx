import { useState, useMemo } from 'react';
import { inspectJson } from '../../lib/inspector';
import type { InspectorCategory } from '../../types/json';
import { useClipboard } from '../../hooks/useClipboard';

interface InspectorTabProps {
  json: string;
  onNavigateToFormatter?: () => void;
}

export function InspectorTab({ json, onNavigateToFormatter }: InspectorTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'info'>('all');
  const { copied, copy } = useClipboard();

  const inspection = useMemo(() => {
    return inspectJson(json);
  }, [json]);

  const { isValid, error, stats, findings, summary } = inspection;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: findings.length,
      'type-inconsistency': 0,
      'schema-inconsistency': 0,
      'empty-value': 0,
      'null-value': 0,
      'empty-container': 0,
      'duplicate-value': 0,
    };
    findings.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Category filter
      if (selectedCategory !== 'all' && f.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (severityFilter !== 'all' && f.severity !== severityFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPath = f.path.toLowerCase().includes(query);
        const matchesMsg = f.message.toLowerCase().includes(query);
        const matchesDetails = f.details?.toLowerCase().includes(query) ?? false;
        return matchesPath || matchesMsg || matchesDetails;
      }
      return true;
    });
  }, [findings, selectedCategory, severityFilter, searchQuery]);

  const getCategoryBadge = (category: InspectorCategory) => {
    switch (category) {
      case 'type-inconsistency':
        return {
          label: 'Type Inconsistency',
          classes:
            'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        };
      case 'schema-inconsistency':
        return {
          label: 'Schema Mismatch',
          classes:
            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'empty-value':
        return {
          label: 'Empty Value',
          classes:
            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'null-value':
        return {
          label: 'Null Value',
          classes:
            'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'empty-container':
        return {
          label: 'Empty Container',
          classes:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
        };
      case 'duplicate-value':
        return {
          label: 'Duplicate',
          classes:
            'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        };
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#8d2f43]/30 dark:border-[#8d2f43]/40 bg-white dark:bg-zinc-900/60 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#8d2f43]/10 dark:bg-[#8d2f43]/20 text-[#8d2f43] dark:text-[#e6c76e] flex items-center justify-center text-2xl mb-3">
          🔍
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          Valid JSON Required for Inspection
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
          {error ||
            'JSON Inspector analyzes structural patterns, schema uniformity, and data quality across valid JSON. Please provide valid syntax.'}
        </p>
        {onNavigateToFormatter && (
          <button
            type="button"
            onClick={onNavigateToFormatter}
            className="mt-4 px-4 py-2 rounded-lg bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-medium transition shadow-sm cursor-pointer"
          >
            Go to Formatter &amp; Repair
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Overview & Quality Score Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/35 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#8d2f43]/10 dark:bg-[#8d2f43]/25 border border-[#8d2f43]/20 text-[#8d2f43] dark:text-[#e6c76e] flex items-center justify-center text-xl shadow-sm">
            🔍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                JSON Structure &amp; Quality Inspector
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  summary.qualityScore >= 90
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : summary.qualityScore >= 70
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                }`}
              >
                Quality Score: {summary.qualityScore}/100
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Comprehensive structural metrics and heuristic quality observations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            Size: <strong className="text-zinc-900 dark:text-zinc-200">{formatBytes(stats.byteSize)}</strong>
          </span>
        </div>
      </div>

      {/* Structural Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Objects */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Objects</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalObjects}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-auto">
            {stats.largestObject ? `Max props: ${stats.largestObject.propertyCount}` : 'No objects'}
          </span>
        </div>

        {/* Arrays */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Arrays</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalArrays}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-auto">
            {stats.longestArray ? `Max items: ${stats.longestArray.length}` : 'No arrays'}
          </span>
        </div>

        {/* Properties */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Properties</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalProperties}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-auto">
            {stats.distinctKeysCount} distinct keys
          </span>
        </div>

        {/* Max Nesting Depth */}
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Max Depth</span>
          <span className="text-xl font-bold text-[#8d2f43] dark:text-[#e6c76e] mt-1">
            {stats.maxDepth}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-auto">
            hierarchy levels
          </span>
        </div>

        {/* Values Breakdown */}
        <div className="col-span-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Primitive Values ({stats.stringCount + stats.numberCount + stats.booleanCount + stats.nullCount})
          </span>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
            <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="block text-[10px] text-zinc-400">String</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.stringCount}</span>
            </div>
            <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="block text-[10px] text-zinc-400">Number</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.numberCount}</span>
            </div>
            <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="block text-[10px] text-zinc-400">Bool</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.booleanCount}</span>
            </div>
            <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="block text-[10px] text-zinc-400">Null</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.nullCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {/* Controls: Category Filter and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#8d2f43] text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All Findings ({findings.length})
            </button>

            {categoryCounts['type-inconsistency'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('type-inconsistency')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === 'type-inconsistency'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                Type Inconsistency ({categoryCounts['type-inconsistency']})
              </button>
            )}

            {categoryCounts['schema-inconsistency'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('schema-inconsistency')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === 'schema-inconsistency'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                Schema Mismatch ({categoryCounts['schema-inconsistency']})
              </button>
            )}

            {categoryCounts['empty-value'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('empty-value')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === 'empty-value'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                Empty Strings ({categoryCounts['empty-value']})
              </button>
            )}

            {categoryCounts['null-value'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('null-value')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === 'null-value'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                Null Values ({categoryCounts['null-value']})
              </button>
            )}

            {categoryCounts['duplicate-value'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('duplicate-value')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === 'duplicate-value'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 hover:bg-orange-100'
                }`}
              >
                Duplicates ({categoryCounts['duplicate-value']})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as 'all' | 'warning' | 'info')}
              aria-label="Filter findings by severity"
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#8d2f43]"
            >
              <option value="all">All Severities</option>
              <option value="warning">Warnings ({summary.warningCount})</option>
              <option value="info">Info ({summary.infoCount})</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by path or message..."
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#8d2f43] w-48 sm:w-60"
            />
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <span className="text-3xl mb-2">✨</span>
            <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              {findings.length === 0 ? 'Pristine JSON Quality' : 'No findings match current filter'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              {findings.length === 0
                ? 'No type inconsistencies, missing properties, or empty values detected.'
                : 'Try clearing the search query or selecting a different category filter.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredFindings.map((finding) => {
              const badge = getCategoryBadge(finding.category);
              return (
                <div
                  key={finding.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          finding.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <code className="text-[11px] font-mono font-semibold text-[#8d2f43] dark:text-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 px-1.5 py-0.5 rounded border border-[#8d2f43]/20 dark:border-[#8d2f43]/40">
                        {finding.path}
                      </code>
                    </div>

                    <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {finding.message}
                    </p>

                    {finding.details && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {finding.details}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => copy(finding.path)}
                      title={`Copy ${finding.path}`}
                      className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{copied ? '✓' : '📋'}</span>
                      <span>Copy Path</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
