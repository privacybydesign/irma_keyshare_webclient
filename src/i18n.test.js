import { describe, it, expect } from 'vitest';
import { baseLanguage } from './i18n.js';

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
