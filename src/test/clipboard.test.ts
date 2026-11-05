import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../hooks/useClipboard';

describe('useClipboard hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('copies text using navigator.clipboard when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useClipboard(2000));

    let success = false;
    await act(async () => {
      success = await result.current.copy('Hello JSON');
    });

    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('Hello JSON');
    expect(result.current.copied).toBe(true);

    // After duration, copied flag resets
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('falls back to document.execCommand when navigator.clipboard rejects', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const { result } = renderHook(() => useClipboard(1500));

    let success = false;
    await act(async () => {
      success = await result.current.copy('Fallback text');
    });

    expect(success).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.copied).toBe(false);
  });

  it('gracefully handles empty text without copying', async () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useClipboard());

    let success = true;
    await act(async () => {
      success = await result.current.copy('');
    });

    expect(success).toBe(false);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });

  it('clears previous timer on consecutive rapid copies', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useClipboard(2000));

    await act(async () => {
      await result.current.copy('First copy');
    });
    expect(result.current.copied).toBe(true);

    // Advance 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(true);

    // Call copy again: should restart the 2000ms timer
    await act(async () => {
      await result.current.copy('Second copy');
    });

    // Advance 1500ms (total 2500ms from first copy, but only 1500ms from second)
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // Should still be true because second copy reset the timer!
    expect(result.current.copied).toBe(true);

    // Advance remaining 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });
});
