import type { TabId } from '../../components/Header';

interface OverviewTabProps {
  onNavigateToTab: (tab: TabId, demoJson?: string) => void;
}

const DEMO_MALFORMED_JSON = `{
  name: 'Senem',
  title: 'Full-Stack Software Engineer',
  verified: True,
  skills: ['TypeScript', 'React', 'Vite', 'Playwright',],
  portfolio: {
    openSource: true,
    stars: 120,
  },
}`;

export function OverviewTab({ onNavigateToTab }: OverviewTabProps) {
  const handleStartInteractiveDemo = () => {
    onNavigateToTab('formatter', DEMO_MALFORMED_JSON);
  };

  return (
    <div className="flex flex-col gap-10 py-2 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 bg-gradient-to-b from-white via-white to-[#f7f3f3]/50 dark:from-[#180c10] dark:via-[#150a0d] dark:to-[#100608] p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8d2f43]/10 text-[#8d2f43] dark:bg-[#8d2f43]/30 dark:text-[#e6c76e] border border-[#8d2f43]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8d2f43] dark:bg-[#e6c76e] animate-pulse" />
              100% Client-Side Engine
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              Zero Telemetry &bull; Zero Server Requests
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
            The privacy-first developer studio for{' '}
            <span className="text-[#8d2f43] dark:text-[#e6c76e]">JSON</span>.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            JsonSense is an offline-capable developer utility built for real-world engineering workflows.
            Format, diagnose syntax errors, safely auto-repair malformed payloads, inspect structural telemetry,
            infer standard JSON Schemas from multi-sample batches, and validate payloads—all inside client memory.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('formatter')}
              className="px-5 py-2.5 rounded-xl bg-[#8d2f43] hover:bg-[#732334] text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <span>Launch Format &amp; Validate</span>
              <span>➔</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('schema')}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <span>📐 Schema Studio</span>
            </button>
            <button
              type="button"
              onClick={handleStartInteractiveDemo}
              className="px-4 py-2.5 rounded-xl bg-[#e6c76e]/20 hover:bg-[#e6c76e]/30 text-[#8d2f43] dark:text-[#e6c76e] text-xs sm:text-sm font-semibold border border-[#e6c76e]/40 transition cursor-pointer flex items-center gap-2"
            >
              <span> Run 5-Step Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[#8d2f43] dark:text-[#e6c76e] tracking-tight">
            Developer Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Engineered as a cohesive toolbox. Each module operates independently as pure, non-mutating algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Smart Repair */}
          <div
            onClick={() => onNavigateToTab('formatter')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🛠️</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  AST Scanner
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                Smart JSON Repair
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Deterministic token scanner diagnosing unquoted keys, trailing commas, single quotes,
                Python/JS literals (`True`, `undefined`), and unclosed containers without string mutation.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Formatter &amp; Repair ➔
            </span>
          </div>

          {/* Card 2: JSON Inspector */}
          <div
            onClick={() => onNavigateToTab('inspector')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🔍</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Quality Audit
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                Structure &amp; Quality Inspector
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Structural telemetry reporting object/array counts, max depth, type inconsistencies in arrays,
                empty string values, null values, and duplicate IDs with exact JSONPath markers.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Inspector ➔
            </span>
          </div>

          {/* Card 3: Schema Studio */}
          <div
            onClick={() => onNavigateToTab('schema')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📐</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  Schema Engine
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                Schema Studio
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Infers unified JSON Schema from multi-sample batches (integer detection, required intersections,
                union types) paired with a live validation workbench reporting JSONPath violation diagnostics.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Schema Studio ➔
            </span>
          </div>

          {/* Card 4: TypeScript Generator */}
          <div
            onClick={() => onNavigateToTab('typescript')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">TS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                  Code Generation
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                JSON to TypeScript
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Transforms nested payloads into clean, idiomatic TypeScript interfaces. Supports custom root names,
                optional fields, union array types, and configurable `export` declarations.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Generate TypeScript ➔
            </span>
          </div>

          {/* Card 5: JSON Diff */}
          <div
            onClick={() => onNavigateToTab('diff')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">±</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                  Semantic Diff
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                JSON Comparison Diff
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Recursive structural comparison identifying added, removed, and modified values across two payloads
                independent of key insertion ordering.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Compare Payloads ➔
            </span>
          </div>

          {/* Card 6: Interactive Tree Viewer */}
          <div
            onClick={() => onNavigateToTab('tree')}
            className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#8d2f43]/40 dark:hover:border-[#8d2f43]/60 transition shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🌲</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  DOM Navigation
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8d2f43] dark:group-hover:text-[#e6c76e] transition">
                Interactive Tree Explorer
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Hierarchical data browser with collapse/expand toggles, node item counts, value type tags,
                and real-time substring filtering across deeply nested keys and values.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Tree Explorer ➔
            </span>
          </div>
        </div>
      </section>

      {/* 5-Step Demo Walkthrough Showcase */}
      <section className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 bg-white dark:bg-[#180c10] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <h2 className="text-lg font-bold text-[#8d2f43] dark:text-[#e6c76e]">
                5-Step Live Demonstration Walkthrough
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Demonstrates how JsonSense connects malformed input, structural inspection, schema inference, and validation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartInteractiveDemo}
            className="px-4 py-2 rounded-xl bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Start Step 1</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1 */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 1
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Malformed Input</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Developer pastes raw payload containing single quotes, unquoted keys, and trailing commas.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 2
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Smart Repair</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Smart Repair diagnoses fixes, renders confidence badges, and applies clean JSON without string mutation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 3
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Telemetry &amp; Audit</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Switch to JSON Inspector to review max nesting depth, quality scores, and exact JSONPath coordinates.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 4
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Schema Studio</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Add multiple payload variations in Schema Studio to infer unified types, integer promotion, and required properties.
            </p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 5
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Live Validation</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Test incoming payloads in the Validation Workbench with instant expected vs. received violation tables.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Architecture Guarantee */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="text-xl">🛡️</div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Zero Server Exposure
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Many online JSON formatters send your data to external servers, exposing API tokens and PII.
            JsonSense runs 100% inside your browser environment.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="text-xl">⚡</div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Sub-millisecond Performance
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Zero network latency. Parsing, formatting, schema generation, and validation happen in microsecond
            pure JavaScript loops.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="text-xl">🧪</div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Verified Engineering
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Covered by 18 Vitest test suites, 176 unit tests, property-based permutation invariance suites,
            and 32 Chromium Playwright E2E browser flows.
          </p>
        </div>
      </section>
    </div>
  );
}
