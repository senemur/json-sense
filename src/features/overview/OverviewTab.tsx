import { useState } from 'react';
import type { TabId } from '../../components/Header';
import {
  Wrench,
  FileSearch,
  Boxes,
  FileCode2,
  GitCompare,
  FolderTree,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Play,
  ArrowRight,
  Code2,
  AlertTriangle,
} from 'lucide-react';

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

const DEMO_REPAIRED_JSON = `{
  "name": "Senem",
  "title": "Full-Stack Software Engineer",
  "verified": true,
  "skills": [
    "TypeScript",
    "React",
    "Vite",
    "Playwright"
  ],
  "portfolio": {
    "openSource": true,
    "stars": 120
  }
}`;

const DEMO_INFERRED_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "title": { "type": "string" },
    "verified": { "type": "boolean" },
    "skills": { "type": "array", "items": { "type": "string" } },
    "portfolio": {
      "type": "object",
      "properties": {
        "openSource": { "type": "boolean" },
        "stars": { "type": "integer" }
      },
      "required": ["openSource", "stars"]
    }
  },
  "required": ["name", "title", "verified", "skills", "portfolio"]
}`;

export function OverviewTab({ onNavigateToTab }: OverviewTabProps) {
  const [activeDemoStep, setActiveDemoStep] = useState<number>(1);

  const handleStartInteractiveDemo = () => {
    onNavigateToTab('formatter', DEMO_MALFORMED_JSON);
  };

  return (
    <div className="flex flex-col gap-10 py-2 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 bg-gradient-to-b from-white via-white to-[#f7f3f3]/50 dark:from-[#180c10] dark:via-[#150a0d] dark:to-[#100608] p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl flex flex-col gap-3.5">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8d2f43]/10 text-[#8d2f43] dark:bg-[#8d2f43]/30 dark:text-[#e6c76e] border border-[#8d2f43]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8d2f43] dark:text-[#e6c76e]" />
              In-Memory Client Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              Client-Side Execution &bull; Zero Server Requests
            </span>
          </div>

          {/* Balanced Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 leading-snug">
            The privacy-first developer studio for{' '}
            <span className="text-[#8d2f43] dark:text-[#e6c76e]">JSON</span>.
          </h1>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            JsonSense is an offline-capable developer suite engineered for production workflows.
            Format, diagnose syntax faults, safely auto-repair malformed payloads, audit structural quality,
            infer unified JSON Schemas from multi-sample batches, and test payloads with exact JSONPath diagnostics.
          </p>

          {/* Prominent CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Highly Prominent "Run 5-Step Demo" Button */}
            <button
              type="button"
              onClick={handleStartInteractiveDemo}
              className="px-5 py-2.5 rounded-xl bg-[#8d2f43] hover:bg-[#732334] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2.5 border border-[#e6c76e]/50 ring-2 ring-[#8d2f43]/20 dark:ring-[#e6c76e]/20 group"
              title="Start guided 5-step demonstration with sample malformed payload"
            >
              <div className="w-5 h-5 rounded-full bg-[#e6c76e] text-[#8d2f43] flex items-center justify-center font-bold">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span className="tracking-wide">Run 5-Step Demo</span>
              <ArrowRight className="w-4 h-4 text-[#e6c76e] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Launch Formatter */}
            <button
              type="button"
              onClick={() => onNavigateToTab('formatter')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span>Launch Editor</span>
            </button>

            {/* Launch Schema Studio */}
            <button
              type="button"
              onClick={() => onNavigateToTab('schema')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Open Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#8d2f43] dark:text-[#e6c76e] tracking-tight">
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60">
                  <Wrench className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
                  <FileSearch className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                </div>
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60">
                  <Boxes className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </div>
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60">
                  <FileCode2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                </div>
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60">
                  <GitCompare className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                </div>
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60">
                  <FolderTree className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                </div>
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

      {/* 5-Step Demo Walkthrough Showcase with Interactive Preview */}
      <section className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 bg-white dark:bg-[#180c10] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#8d2f43]/10 dark:bg-[#8d2f43]/30">
                <Play className="w-4 h-4 text-[#8d2f43] dark:text-[#e6c76e] fill-current" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#8d2f43] dark:text-[#e6c76e]">
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
            className="px-4 py-2 rounded-xl bg-[#8d2f43] hover:bg-[#732334] text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#e6c76e]" />
            <span>Start Live Demo Flow</span>
          </button>
        </div>

        {/* Step Cards with Active Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveDemoStep(1)}
            className={`text-left flex flex-col gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
              activeDemoStep === 1
                ? 'border-[#8d2f43] dark:border-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 1
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Malformed Input</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Raw payload containing single quotes, unquoted keys, and trailing commas.
            </p>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setActiveDemoStep(2)}
            className={`text-left flex flex-col gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
              activeDemoStep === 2
                ? 'border-[#8d2f43] dark:border-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 2
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Smart Repair</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Diagnoses fixes, renders confidence badges, and produces clean JSON.
            </p>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setActiveDemoStep(3)}
            className={`text-left flex flex-col gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
              activeDemoStep === 3
                ? 'border-[#8d2f43] dark:border-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 3
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Quality Audit</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Review max nesting depth, quality scores, and exact JSONPath coordinates.
            </p>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => setActiveDemoStep(4)}
            className={`text-left flex flex-col gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
              activeDemoStep === 4
                ? 'border-[#8d2f43] dark:border-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 4
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Schema Inference</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Infer unified types, integer promotion, and required properties from multi-sample sets.
            </p>
          </button>

          {/* Step 5 */}
          <button
            type="button"
            onClick={() => setActiveDemoStep(5)}
            className={`text-left flex flex-col gap-1.5 p-3 rounded-xl border transition cursor-pointer ${
              activeDemoStep === 5
                ? 'border-[#8d2f43] dark:border-[#e6c76e] bg-[#8d2f43]/5 dark:bg-[#8d2f43]/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-[#8d2f43] dark:text-[#e6c76e] uppercase tracking-wider">
              Step 5
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Live Validation</h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
              Test incoming payloads with instant expected vs. received violation tables.
            </p>
          </button>
        </div>

        {/* Step Preview Box (Interactive Visual Walkthrough) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8d2f43] dark:bg-[#e6c76e]" />
              {activeDemoStep === 1 && 'Preview: Raw Malformed Payload (Unquoted keys, Python literals, trailing comma)'}
              {activeDemoStep === 2 && 'Preview: Deterministic AST Repair Output (Standard RFC 8259)'}
              {activeDemoStep === 3 && 'Preview: Inspector Telemetry (Nesting depth: 2, 2 Objects, 1 Array, 0 Nulls)'}
              {activeDemoStep === 4 && 'Preview: Inferred JSON Schema (Draft-07 Structure)'}
              {activeDemoStep === 5 && 'Preview: Validation Workbench Error Diagnostic Table'}
            </span>
            <button
              type="button"
              onClick={handleStartInteractiveDemo}
              className="text-xs font-semibold text-[#8d2f43] dark:text-[#e6c76e] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Open in Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeDemoStep === 1 && (
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>Detected 4 syntax faults: Unquoted key `name`, Python literal `True`, trailing comma after `'Playwright'`, unquoted `portfolio`.</span>
              </div>
              <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                {DEMO_MALFORMED_JSON}
              </pre>
            </div>
          )}

          {activeDemoStep === 2 && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200">
                  Quote key `name` (High Confidence)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200">
                  Convert `True` &rarr; `true` (High Confidence)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200">
                  Strip trailing comma (High Confidence)
                </span>
              </div>
              <pre className="p-3 rounded-xl bg-zinc-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                {DEMO_REPAIRED_JSON}
              </pre>
            </div>
          )}

          {activeDemoStep === 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Max Depth</span>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">2</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Objects</span>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">2</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Arrays</span>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">1</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Total Props</span>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">7</p>
              </div>
            </div>
          )}

          {activeDemoStep === 4 && (
            <pre className="p-3 rounded-xl bg-zinc-900 text-amber-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              {DEMO_INFERRED_SCHEMA}
            </pre>
          )}

          {activeDemoStep === 5 && (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                  <tr>
                    <th className="px-3 py-2">Path</th>
                    <th className="px-3 py-2">Keyword</th>
                    <th className="px-3 py-2">Expected</th>
                    <th className="px-3 py-2">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <tr>
                    <td className="px-3 py-2 font-mono text-[#8d2f43] dark:text-[#e6c76e]">$.name</td>
                    <td className="px-3 py-2 font-mono">type</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">string</td>
                    <td className="px-3 py-2 text-red-600 dark:text-red-400">number</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-[#8d2f43] dark:text-[#e6c76e]">$.portfolio.stars</td>
                    <td className="px-3 py-2 font-mono">required</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">present</td>
                    <td className="px-3 py-2 text-red-600 dark:text-red-400">missing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Client-Side Architecture Guarantees */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Client-Side Execution
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All parsing, repair, AST analysis, and schema validation execute strictly within your local browser JavaScript engine.
            No JSON data is sent to external servers.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 w-fit">
            <Zap className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Sub-millisecond Performance
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Zero network latency. Parsing, formatting, schema generation, and validation happen in microsecond
            pure JavaScript loops.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-[#8d2f43]/10 dark:bg-[#8d2f43]/30 border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 w-fit">
            <CheckCircle2 className="w-4 h-4 text-[#8d2f43] dark:text-[#e6c76e]" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Verified Engineering
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Covered by 19 Vitest test suites, 179 unit tests, property-based permutation invariance suites,
            and 35 Chromium Playwright E2E browser flows.
          </p>
        </div>
      </section>
    </div>
  );
}
