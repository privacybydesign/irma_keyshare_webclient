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

  it('does not duplicate the disabled state with aria-disabled (NVDA/JAWS double-announce regression)', () => {
    render(<YiviAppBar title="Test" />);
    expect(screen.getByRole('button', { name: 'EN' }).hasAttribute('aria-disabled')).toBe(false);
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

  it('writes localStorage *before* awaiting i18n.changeLanguage (so a reload mid-await keeps the pick)', async () => {
    // Replace i18n.changeLanguage with a promise we hold open. While it is
    // unresolved, the click handler is paused at its `await`. If localStorage
    // is already populated at that point, the implementation must have
    // written it *before* entering the await — which is exactly the
    // invariant this test protects.
    let resolveLangChange;
    const langChangePromise = new Promise((resolve) => {
      resolveLangChange = resolve;
    });
    vi.spyOn(i18n, 'changeLanguage').mockImplementation(() => langChangePromise);

    render(<YiviAppBar title="Test" />);
    fireEvent.click(screen.getByRole('button', { name: 'NL' }));

    // Sync handler portion has finished; awaiting i18n.changeLanguage now.
    expect(window.localStorage.getItem('lang')).toBe('nl');

    resolveLangChange();
    await act(async () => {
      await langChangePromise;
    });
  });

  it('is a no-op when clicking the already-active language', async () => {
    render(<YiviAppBar title="Test" />);
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
    const changeSpy = vi.spyOn(i18n, 'changeLanguage');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    });
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
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
