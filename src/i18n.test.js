import { describe, it, expect } from 'vitest';
import { baseLanguage, resolveInitialLang } from './i18n.js';

describe('resolveInitialLang', () => {
  it('returns the configured language when it is in the supported set', () => {
    expect(resolveInitialLang('nl')).toBe('nl');
    expect(resolveInitialLang('en')).toBe('en');
  });

  it('strips a region tag to the base subtag', () => {
    expect(resolveInitialLang('nl-NL')).toBe('nl');
    expect(resolveInitialLang('en-GB')).toBe('en');
  });

  it('case-folds before checking the supported set', () => {
    expect(resolveInitialLang('NL')).toBe('nl');
    expect(resolveInitialLang('En-Us')).toBe('en');
  });

  it('trims surrounding whitespace', () => {
    expect(resolveInitialLang('  nl  ')).toBe('nl');
    expect(resolveInitialLang('\ten-US\n')).toBe('en');
  });

  it('falls back to "en" for unsupported languages', () => {
    expect(resolveInitialLang('fr')).toBe('en');
    expect(resolveInitialLang('de-DE')).toBe('en');
  });

  it('falls back to "en" for missing, null, undefined, or empty input', () => {
    expect(resolveInitialLang(undefined)).toBe('en');
    expect(resolveInitialLang(null)).toBe('en');
    expect(resolveInitialLang('')).toBe('en');
    expect(resolveInitialLang('   ')).toBe('en');
  });

  it('honours an explicit supported-set override and falls back to its first entry', () => {
    expect(resolveInitialLang('de', ['de', 'fr'])).toBe('de');
    expect(resolveInitialLang('fr', ['de', 'fr'])).toBe('fr');
    // Unsupported input falls back to the first entry of the override set,
    // not the hardcoded default — verifies the supported argument is
    // actually honoured (and not silently ignored when input is missing).
    expect(resolveInitialLang('en', ['de', 'fr'])).toBe('de');
    expect(resolveInitialLang(undefined, ['de', 'fr'])).toBe('de');
  });
});

describe('baseLanguage', () => {
  it('returns the base subtag, lowercased, for a region-tagged value', () => {
    expect(baseLanguage({ language: 'nl-NL' })).toBe('nl');
    expect(baseLanguage({ language: 'EN-GB' })).toBe('en');
    expect(baseLanguage({ language: 'zh-Hant-TW' })).toBe('zh');
  });

  it('passes through a bare base subtag unchanged', () => {
    expect(baseLanguage({ language: 'nl' })).toBe('nl');
    expect(baseLanguage({ language: 'en' })).toBe('en');
  });

  it('returns empty string when language is missing or empty', () => {
    expect(baseLanguage({ language: '' })).toBe('');
    expect(baseLanguage({ language: undefined })).toBe('');
    expect(baseLanguage({})).toBe('');
  });
});
