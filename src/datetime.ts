// Shared timestamp formatting built on the native `Intl` APIs, replacing the
// previous `moment` usage. Both call sites (logs table, candidate selection)
// take a Unix timestamp in seconds and a language code (`en` / `nl`).

type RelativeDivision = {
  // Number of this unit that makes up the next-larger unit.
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
};

// Largest-unit-first thresholds, mirroring moment's `fromNow()` granularity
// (seconds → minutes → hours → days → months → years; no weeks).
const RELATIVE_DIVISIONS: RelativeDivision[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 30, unit: 'day' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

/**
 * Format a Unix timestamp (seconds) as a localised relative time string, e.g.
 * "3 hours ago" / "3 uur geleden". Replaces `moment.unix(ts).fromNow()`.
 */
export function formatRelativeTime(unixSeconds: number, lang: string, now: number = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  let duration = (unixSeconds * 1000 - now) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  // Unreachable: the last division uses Infinity, so the loop always returns.
  return rtf.format(Math.round(duration), 'year');
}

/**
 * Format a Unix timestamp (seconds) as a localised absolute date/time string
 * for tooltips. Replaces `moment.unix(ts).format('dddd, D MMM YYYY, H:mm:ss')`.
 */
export function formatAbsoluteTime(unixSeconds: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(unixSeconds * 1000));
}
