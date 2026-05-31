import { describe, it, expect } from 'vitest';
import { normaliseBase } from './vite-base.js';

describe('normaliseBase', () => {
  it('defaults to "/" when input is missing', () => {
    expect(normaliseBase(undefined)).toBe('/');
    expect(normaliseBase(null)).toBe('/');
    expect(normaliseBase('')).toBe('/');
    expect(normaliseBase('   ')).toBe('/');
  });

  it('returns "/" unchanged', () => {
    expect(normaliseBase('/')).toBe('/');
  });

  it('passes "./" through for relative-path deploys', () => {
    expect(normaliseBase('.')).toBe('./');
    expect(normaliseBase('./')).toBe('./');
  });

  it('adds the missing trailing slash', () => {
    expect(normaliseBase('/sub')).toBe('/sub/');
    expect(normaliseBase('/sub/nested')).toBe('/sub/nested/');
  });

  it('adds the missing leading slash', () => {
    expect(normaliseBase('sub/')).toBe('/sub/');
  });

  it('adds both slashes when neither is present', () => {
    expect(normaliseBase('sub')).toBe('/sub/');
    expect(normaliseBase('sub/nested')).toBe('/sub/nested/');
  });

  it('trims surrounding whitespace before normalising', () => {
    expect(normaliseBase('  /sub  ')).toBe('/sub/');
  });

  it('preserves absolute URLs but enforces the trailing slash', () => {
    expect(normaliseBase('https://cdn.example.com/app/')).toBe('https://cdn.example.com/app/');
    expect(normaliseBase('https://cdn.example.com/app')).toBe('https://cdn.example.com/app/');
    expect(normaliseBase('http://cdn.example.com/')).toBe('http://cdn.example.com/');
  });

  it('collapses runs of slashes so Vite does not reject the config', () => {
    expect(normaliseBase('//')).toBe('/');
    expect(normaliseBase('//foo//bar//')).toBe('/foo/bar/');
    expect(normaliseBase('foo//bar')).toBe('/foo/bar/');
  });

  it('throws on path-traversal segments so operator misconfigs fail loudly', () => {
    expect(() => normaliseBase('..')).toThrow(/path-traversal/);
    expect(() => normaliseBase('../sub')).toThrow(/path-traversal/);
    expect(() => normaliseBase('/sub/../etc')).toThrow(/path-traversal/);
  });

  it('throws on path-traversal segments inside absolute URLs too', () => {
    expect(() => normaliseBase('https://cdn.example.com/foo/../etc/')).toThrow(/path-traversal/);
  });
});
