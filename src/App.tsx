import { useState } from 'react';
import { Header } from './components/Header';
import type { TabId } from './components/Header';
import { FormatterTab } from './features/formatter/FormatterTab';
import { TreeViewTab } from './features/tree-view/TreeViewTab';
import { TypeScriptTab } from './features/typescript-generator/TypeScriptTab';
import { JsonDiffTab } from './features/json-diff/JsonDiffTab';
import { useTheme } from './hooks/useTheme';

const INITIAL_JSON = JSON.stringify(
  {
    name: 'JSON Buddy',
    description: 'A browser-based developer tool for working with JSON data.',
    version: '0.1.0',
    private: true,
    features: [
      { id: 1, name: 'Format & Minify', ready: true },
      { id: 2, name: 'Syntax Validator', ready: true },
      { id: 3, name: 'Tree Viewer', ready: true },
      { id: 4, name: 'TypeScript Interface Generator', ready: true },
      { id: 5, name: 'JSON Comparison Diff', ready: true },
    ],
    stats: {
      stars: 100,
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
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

        {activeTab === 'typescript' && (
          <TypeScriptTab json={jsonText} />
        )}

        {activeTab === 'diff' && (
          <JsonDiffTab />
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>JSON Buddy &bull; 100% Client-Side JSON Utility</span>
          <span className="text-[11px] opacity-75">
            Zero network requests &bull; No cookies &bull; Data never leaves your machine
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
