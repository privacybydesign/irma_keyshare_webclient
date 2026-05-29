import { describe, it, expect } from 'vitest';
import logs from './logs.js';

const initial = logs(undefined, { type: '@@INIT' });

describe('logs reducer', () => {
  it('starts empty, not loading, and on index 0', () => {
    expect(initial).toEqual({
      logEntries: [],
      currentIndex: 0,
      haveMore: false,
      loading: false,
    });
  });

  it('loadedLogs caps the visible list at 10 and sets haveMore correctly', () => {
    const eleven = Array.from({ length: 11 }, (_, i) => ({ id: i }));
    const next = logs(initial, { type: 'loadedLogs', entries: eleven });
    expect(next.logEntries).toHaveLength(10);
    expect(next.haveMore).toBe(true);
    expect(next.loading).toBe(false);
  });

  it('loadedLogs with <=10 entries reports haveMore=false', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const next = logs(initial, { type: 'loadedLogs', entries: five });
    expect(next.logEntries).toHaveLength(5);
    expect(next.haveMore).toBe(false);
  });

  it('loadLogs records the requested page and flips loading on', () => {
    const next = logs(initial, { type: 'loadLogs', index: 2 });
    expect(next.currentIndex).toBe(2);
    expect(next.loading).toBe(true);
  });

  it('loadLogs is a no-op while another load is in flight (debounces re-fires)', () => {
    const busy = logs(initial, { type: 'loadLogs', index: 1 });
    const ignored = logs(busy, { type: 'loadLogs', index: 99 });
    expect(ignored).toBe(busy);
    expect(ignored.currentIndex).toBe(1);
  });

  it('errorLoadingLogs clears entries and resets loading', () => {
    const busy = logs(initial, { type: 'loadLogs', index: 1 });
    const next = logs(busy, { type: 'errorLoadingLogs' });
    expect(next.logEntries).toEqual([]);
    expect(next.haveMore).toBe(false);
    expect(next.loading).toBe(false);
  });

  it('loggedOut wipes entries and resets the page index', () => {
    const loaded = logs(initial, {
      type: 'loadedLogs',
      entries: Array.from({ length: 11 }, (_, i) => ({ id: i })),
    });
    const next = logs(loaded, { type: 'loggedOut' });
    expect(next.logEntries).toEqual([]);
    expect(next.currentIndex).toBe(0);
    expect(next.haveMore).toBe(false);
  });
});
