interface StatusAlertProps {
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  onDismiss?: () => void;
}

export function StatusAlert({
  type,
  title,
  message,
  line,
  column,
  snippet,
}: StatusAlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
      icon: '⚠️',
      titleColor: 'text-red-800 dark:text-red-200',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
      icon: '✓',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
      icon: 'ℹ️',
      titleColor: 'text-blue-800 dark:text-blue-200',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`rounded-lg border p-3 text-sm transition-all ${styles.bg}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base select-none">{styles.icon}</span>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${styles.titleColor}`}>
              {title || (type === 'error' ? 'Validation Error' : 'Status')}
            </span>
            {(line !== undefined || column !== undefined) && (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-mono font-medium">
                Line {line ?? '?'}, Col {column ?? '?'}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs break-words">{message}</p>
          {snippet && (
            <pre className="mt-2 overflow-x-auto rounded bg-black/10 dark:bg-black/30 p-2 font-mono text-xs text-red-900 dark:text-red-200">
              {snippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
