import type { Theme } from '../hooks/useTheme';

export type TabId = 'formatter' | 'tree' | 'inspector' | 'typescript' | 'diff';

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
    { id: 'inspector', label: 'JSON Inspector', icon: '🔍' },
    { id: 'typescript', label: 'JSON to TypeScript', icon: 'TS' },
    { id: 'diff', label: 'JSON Diff', icon: '±' },
  ];

  return (
    <header className="border-b border-[#8d2f43]/15 dark:border-[#8d2f43]/30 bg-white/90 dark:bg-[#180c10]/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="JsonSense Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-sm border border-[#8d2f43]/20 bg-[#f7f3f3]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#8d2f43] dark:text-[#e6c76e] text-xl tracking-tight">
                  JsonSense
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#8d2f43]/10 text-[#8d2f43] dark:bg-[#8d2f43]/30 dark:text-[#e6c76e] border border-[#8d2f43]/20 dark:border-[#8d2f43]/40">
                  MVP
                </span>
              </div>
              <p className="text-xs text-[#8d2f43]/80 dark:text-[#e6c76e]/80 font-medium hidden sm:block">
                Best Buddy for Json
              </p>
            </div>
          </div>

          {/* Privacy badge and Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              title="All processing occurs locally in your browser. No JSON is ever sent to any server."
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#8d2f43]/5 text-[#8d2f43] dark:bg-[#8d2f43]/20 dark:text-[#e6c76e] border border-[#8d2f43]/20 dark:border-[#8d2f43]/40"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8d2f43] dark:bg-[#e6c76e] animate-pulse" />
              <span>100% In-Browser &amp; Private</span>
            </div>

            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-[#8d2f43]/10 dark:hover:bg-[#8d2f43]/20 border border-[#8d2f43]/20 dark:border-[#8d2f43]/40 transition-colors cursor-pointer"
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
                    ? 'bg-[#8d2f43] text-white shadow-sm ring-1 ring-[#e6c76e]/50'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-[#8d2f43]/10 dark:hover:bg-[#8d2f43]/20'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`font-mono text-xs ${isActive ? 'text-[#e6c76e]' : 'opacity-80'}`}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
