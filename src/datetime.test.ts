import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatAbsoluteTime } from './datetime';

// Fixed reference instant so the relative-time assertions are deterministic.
// 2023-06-05T14:30:05Z (a Monday).
const NOW_MS = Date.UTC(2023, 5, 5, 14, 30, 5);
const NOW_S = NOW_MS / 1000;

describe('formatRelativeTime', () => {
  it('returns "now" for the current instant (en)', () => {
    expect(formatRelativeTime(NOW_S, 'en', NOW_MS)).toBe('now');
  });

  it('localises "now" in Dutch', () => {
    expect(formatRelativeTime(NOW_S, 'nl', NOW_MS)).toBe('nu');
  });

  it('picks minutes for a few-minute-old timestamp (en)', () => {
    expect(formatRelativeTime(NOW_S - 3 * 60, 'en', NOW_MS)).toBe('3 minutes ago');
  });

  it('picks hours for an hours-old timestamp (en)', () => {
    expect(formatRelativeTime(NOW_S - 5 * 3600, 'en', NOW_MS)).toBe('5 hours ago');
  });

  it('picks days for a days-old timestamp (nl)', () => {
    expect(formatRelativeTime(NOW_S - 3 * 86400, 'nl', NOW_MS)).toBe('3 dagen geleden');
  });

  it('picks years for a years-old timestamp (en)', () => {
    expect(formatRelativeTime(NOW_S - 2 * 365 * 86400, 'en', NOW_MS)).toBe('2 years ago');
  });

  it('handles future timestamps (en)', () => {
    expect(formatRelativeTime(NOW_S + 2 * 3600, 'en', NOW_MS)).toBe('in 2 hours');
  });
});

describe('formatAbsoluteTime', () => {
  // Weekday/hour depend on the runtime timezone, so assert on TZ-stable parts
  // (year, short month, seconds, 24-hour clock) and on the locale difference.
  it('formats a full localised date/time in English', () => {
    const result = formatAbsoluteTime(NOW_S, 'en');
    expect(result).toContain('2023');
    expect(result).toContain('Jun'); // capitalised short month in English
    expect(result).toContain('05'); // 2-digit seconds
    expect(result).not.toMatch(/[AP]M/); // 24-hour clock
  });

  it('localises the month name in Dutch', () => {
    const result = formatAbsoluteTime(NOW_S, 'nl');
    expect(result).toContain('2023');
    expect(result).toContain('jun'); // lowercase short month in Dutch
    expect(result).not.toContain('Jun');
  });
});
