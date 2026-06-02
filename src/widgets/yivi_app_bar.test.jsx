import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import YiviAppBar from './yivi_app_bar.jsx';
import i18n from '../i18n.js';

describe('YiviAppBar language switcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.removeAttribute('lang');
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders an EN and an NL button with the correct disabled/aria-pressed state', () => {
    render(<YiviAppBar title="Test" />);
    const en = screen.getByRole('button', { name: 'EN' });
    const nl = screen.getByRole('button', { name: 'NL' });
    expect(en.disabled).toBe(true);
    expect(en.getAttribute('aria-pressed')).toBe('true');
    expect(nl.disabled).toBe(false);
    expect(nl.getAttribute('aria-pressed')).toBe('false');
  });

  it('flips i18n language, html lang attribute, and localStorage when the other button is clicked', async () => {
    render(<YiviAppBar title="Test" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'NL' }));
    });
    expect(i18n.language).toBe('nl');
    expect(document.documentElement.getAttribute('lang')).toBe('nl');
    expect(window.localStorage.getItem('lang')).toBe('nl');
    expect(screen.getByRole('button', { name: 'NL' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'EN' }).disabled).toBe(false);
  });

  it('survives localStorage being unavailable (Safari private mode etc.)', async () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(<YiviAppBar title="Test" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'NL' }));
    });
    expect(i18n.language).toBe('nl');
    expect(document.documentElement.getAttribute('lang')).toBe('nl');
  });

  it('renders the language switcher locked when lockLanguageSwitcher is set (yivi-session-in-flight)', () => {
    render(<YiviAppBar title="Test" lockLanguageSwitcher />);
    const en = screen.getByRole('button', { name: 'EN' });
    const nl = screen.getByRole('button', { name: 'NL' });
    expect(en.disabled).toBe(true);
    expect(nl.disabled).toBe(true);
    expect(en.getAttribute('title')).toBeTruthy();
    expect(nl.getAttribute('title')).toBeTruthy();
  });

  it('notifies a languageChanged subscriber so consumers like document.title can react', async () => {
    const subscriber = vi.fn();
    i18n.on('languageChanged', subscriber);
    render(<YiviAppBar title="Test" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'NL' }));
    });
    expect(subscriber).toHaveBeenCalledWith('nl');
    i18n.off('languageChanged', subscriber);
  });
});
