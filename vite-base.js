// Vite's `base` config option must start *and* end with `/` (or be `./` for
// relative paths, or a full http(s) URL). Operators commonly set VITE_BASE
// to a bare subpath like `/sub` or `sub/`, which makes Vite hard-fail at
// build time. Normalise here so any reasonable input works.

export function normaliseBase(raw) {
  if (raw == null) return '/';
  const trimmed = String(raw).trim();
  if (trimmed === '' || trimmed === '/') return '/';
  if (trimmed === '.' || trimmed === './') return './';
  // Path-traversal segments are an operator misconfig — fail the build
  // loudly rather than silently shipping a wrong base URL.
  if (trimmed.split('/').some((segment) => segment === '..')) {
    throw new Error(
      `VITE_BASE rejected: path-traversal segment ('..') in ${JSON.stringify(raw)}. ` +
        `Use an absolute path like '/sub/' or a full URL.`,
    );
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  }
  // Relative input ('./sub', './sub/foo') — preserve the leading dot, just
  // ensure the trailing slash. Passing this through the absolute-path
  // branch would otherwise produce '/./sub/' which Vite treats as an
  // absolute path with a literal '.' segment.
  if (trimmed.startsWith('./')) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  }
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  // Collapse runs of slashes ('//foo', 'foo//bar') down to a single '/'.
  const collapsed = withLeading.replace(/\/+/g, '/');
  if (collapsed === '/') return '/';
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
}
