import { useState, useCallback, useRef } from 'react';

export function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;

      let success = false;

      // Primary modern clipboard API
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          success = true;
        }
      } catch {
        // Fall through to textarea execCommand fallback
      }

      // Secondary fallback for restricted contexts (e.g., iframes, insecure origins)
      if (!success) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          success = document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          success = false;
        }
      }

      if (success) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        setCopied(true);
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, duration);
        return true;
      }

      setCopied(false);
      return false;
    },
    [duration]
  );

  return { copied, copy };
}
