import { useState } from 'react';
import { Header } from './components/Header';
import type { TabId } from './components/Header';
import { FormatterTab } from './features/formatter/FormatterTab';
import { TreeViewTab } from './features/tree-view/TreeViewTab';
import { InspectorTab } from './features/inspector/InspectorTab';
import { TypeScriptTab } from './features/typescript-generator/TypeScriptTab';
import { JsonDiffTab } from './features/json-diff/JsonDiffTab';
import { useTheme } from './hooks/useTheme';

const INITIAL_JSON = JSON.stringify(
  {
    name: 'JsonSense',
    tagline: 'Best Buddy for Json',
    description: 'A fast, elegant, privacy-focused developer tool for working with JSON data.',
    version: '0.1.0',
    private: true,
    features: [
      { id: 1, name: 'Format & Minify', ready: true },
      { id: 2, name: 'Syntax Validator', ready: true },
      { id: 3, name: 'Smart JSON Repair', ready: true },
      { id: 4, name: 'Tree Viewer', ready: true },
      { id: 5, name: 'Structure & Quality Inspector', ready: true },
      { id: 6, name: 'TypeScript Interface Generator', ready: true },
      { id: 7, name: 'JSON Comparison Diff', ready: true },
    ],
    stats: {
      stars: 120,
      openSource: true,
      license: 'MIT',
    },
  },
  null,
  2
);

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('formatter');
  const [jsonText, setJsonText] = useState<string>(INITIAL_JSON);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f7f3f3] dark:bg-[#120709] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'formatter' && (
          <FormatterTab
            json={jsonText}
            onChangeJson={setJsonText}
          />
        )}

        {activeTab === 'tree' && (
          <TreeViewTab json={jsonText} />
        )}

        {activeTab === 'inspector' && (
          <InspectorTab
            json={jsonText}
            onNavigateToFormatter={() => setActiveTab('formatter')}
          />
        )}

        {activeTab === 'typescript' && (
          <TypeScriptTab json={jsonText} />
        )}

        {activeTab === 'diff' && (
          <JsonDiffTab />
        )}
      </main>

      <footer className="border-t border-[#8d2f43]/15 dark:border-[#8d2f43]/30 py-4 px-6 text-center text-xs text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-[#190c10]/50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#8d2f43] dark:text-[#e6c76e]">
            JsonSense &bull; Best Buddy for Json
          </span>
          <span className="text-[11px] opacity-75">
            Zero network requests &bull; No cookies &bull; Data never leaves your machine
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
