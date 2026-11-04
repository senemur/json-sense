import type { Theme } from '../hooks/useTheme';

export type TabId = 'formatter' | 'tree' | 'typescript' | 'diff';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'formatter', label: 'Format & Validate', icon: '{ }' },
    { id: 'tree', label: 'Tree Viewer', icon: '🌲' },
    { id: 'typescript', label: 'JSON to TypeScript', icon: 'TS' },
    { id: 'diff', label: 'JSON Diff', icon: '±' },
  ];

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              JB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
                  JSON Buddy
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  MVP
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Fast, private developer JSON toolkit
              </p>
            </div>
          </div>

          {/* Privacy badge and Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              title="All processing occurs locally in your browser. No JSON is ever sent to any server."
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% In-Browser &amp; Private</span>
            </div>

            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="font-mono text-xs opacity-80">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
