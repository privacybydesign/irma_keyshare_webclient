// Vite's `base` config option must start *and* end with `/` (or be `./` for
// relative paths, or a full http(s) URL). Operators commonly set VITE_BASE
// to a bare subpath like `/sub` or `sub/`, which makes Vite hard-fail at
// build time. Normalise here so any reasonable input works.

export function normaliseBase(raw) {
  if (raw == null) return '/';
  const trimmed = String(raw).trim();
  if (trimmed === '' || trimmed === '/') return '/';
  if (trimmed === '.' || trimmed === './') return './';
  // Apply the same path-traversal rejection to absolute URLs as relative
  // paths — operator-controlled at build time, but the test suite claims
  // .. is always rejected and the previous short-circuit broke that.
  if (trimmed.split('/').some((segment) => segment === '..')) return '/';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  }
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  // Collapse runs of slashes ('//foo', 'foo//bar') down to a single '/'.
  const collapsed = withLeading.replace(/\/+/g, '/');
  if (collapsed === '/') return '/';
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
}
