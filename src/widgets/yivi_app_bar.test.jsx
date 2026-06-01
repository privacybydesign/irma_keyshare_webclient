import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import YiviAppBar, { YiviAppBar as YiviAppBarClass } from './yivi_app_bar.jsx';
import i18n from '../i18n.js';

describe('YiviAppBar language switcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.removeAttribute('lang');
    window.localStorage.clear();
    YiviAppBarClass._latestRequestedLang = undefined;
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

  it('rolls back localStorage when i18n.changeLanguage rejects', async () => {
    const mockI18n = {
      language: 'en',
      changeLanguage: vi.fn(() => Promise.reject(new Error('load failed'))),
    };
    const instance = new YiviAppBarClass({ i18n: mockI18n });

    window.localStorage.setItem('lang', 'en');
    await instance.changeLanguage('nl');

    // localStorage must reflect the *previous* (still-current) language, not
    // the failed one — otherwise detectLanguage() on next reload would start
    // the user in a language they never successfully switched to.
    expect(window.localStorage.getItem('lang')).toBe('en');
    expect(YiviAppBarClass._latestRequestedLang).toBeUndefined();
  });

  it('re-issues changeLanguage when an out-of-order resolution leaves i18next at the wrong language', async () => {
    // Two changeLanguage calls (NL then EN) with resources that resolve in
    // reverse order — EN's promise settles first, NL's later. Without the
    // convergence step, i18next.language would end up `nl` (whichever
    // promise resolves last wins inside i18next) while localStorage and
    // <html lang> point at `en`, so translations would silently render
    // in the wrong language. Verify the switcher re-issues a
    // changeLanguage('en') to bring i18next back in sync.
    const calls = [];
    const resolvers = {};
    const mockI18n = {
      language: 'en',
      changeLanguage: vi.fn((lang) => {
        calls.push(lang);
        return new Promise((resolve) => {
          resolvers[lang] = () => {
            // Mimic i18next: setting language on resolution.
            mockI18n.language = lang;
            resolve();
          };
        });
      }),
    };
    const instance = new YiviAppBarClass({ i18n: mockI18n });

    const nlPromise = instance.changeLanguage('nl');
    const enPromise = instance.changeLanguage('en');

    // Resolve EN first, NL second — i18next.language will end at 'nl'.
    resolvers.en();
    resolvers.nl();
    await Promise.all([nlPromise, enPromise]);

    // The post-await convergence in the second-resolving call (NL) must
    // have detected the drift and re-issued changeLanguage('en').
    expect(calls).toContain('en');
    expect(calls.filter((c) => c === 'en').length).toBeGreaterThanOrEqual(2);
  });

  it('survives three rapid clicks with arbitrary resolution order — last click wins', async () => {
    // NL → EN → NL with arbitrary promise resolution order. The convergence
    // step should pull i18next back to whichever language was requested
    // last regardless of which earlier promise settled when.
    const pending = []; // FIFO of resolver entries: { lang, fire }
    const mockI18n = {
      language: 'en',
      changeLanguage: vi.fn(
        (lang) =>
          new Promise((resolve) => {
            pending.push({
              lang,
              fire: () => {
                mockI18n.language = lang;
                resolve();
              },
            });
          }),
      ),
    };
    const instance = new YiviAppBarClass({ i18n: mockI18n });

    const p1 = instance.changeLanguage('nl');
    const p2 = instance.changeLanguage('en');
    const p3 = instance.changeLanguage('nl');

    expect(window.localStorage.getItem('lang')).toBe('nl');
    expect(YiviAppBarClass._latestRequestedLang).toBe('nl');

    // pending = [nl(p1), en(p2), nl(p3)]. Resolve in chaotic order: EN
    // first (the middle click), then NL#1, then the final NL.
    pending.splice(1, 1)[0].fire(); // EN (p2)
    pending.shift().fire(); // NL (p1)
    pending.shift().fire(); // NL (p3)
    await Promise.all([p1, p2, p3]);

    // Drain any fire-and-forget convergence calls the post-await steps
    // queued (each pulled from the head of `pending`).
    while (pending.length) {
      pending.shift().fire();
      await Promise.resolve();
    }

    expect(mockI18n.language).toBe('nl');
    expect(document.documentElement.getAttribute('lang')).toBe('nl');
  });

  it('survives rapid clicks: the last requested language wins even if i18next resolves out of order', async () => {
    // The disabled state on the inactive button prevents this race via the
    // DOM in normal flow, but withTranslation can re-render off Redux /
    // other state mid-flight too, briefly re-enabling the other button.
    // Test the underlying method directly so the guard is verified
    // independently of the disabled-button rendering path.
    const resolvers = {};
    const mockI18n = {
      language: 'en',
      changeLanguage: vi.fn(
        (lang) =>
          new Promise((resolve) => {
            resolvers[lang] = resolve;
          }),
      ),
    };
    const instance = new YiviAppBarClass({ i18n: mockI18n });

    const nlPromise = instance.changeLanguage('nl');
    const enPromise = instance.changeLanguage('en');

    // localStorage reflects the latest call immediately (sync writes before
    // the await), even though no i18next promise has resolved yet.
    expect(window.localStorage.getItem('lang')).toBe('en');

    // Resolve EN first, then NL — the *earlier* request finishes last.
    resolvers.en();
    resolvers.nl();
    await Promise.all([nlPromise, enPromise]);

    // The post-await setAttribute from NL must bail out because EN is the
    // latest-requested language; the DOM has to settle at EN.
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('logs but does not corrupt state when the post-await convergence call itself rejects', async () => {
    // Same out-of-order scenario as the convergence test, but make the
    // fire-and-forget convergence call (the re-issued changeLanguage that
    // pulls i18next back into sync) reject. The .catch must log via
    // console.error and the surrounding state must remain consistent with
    // the user's most recent click — otherwise a transient network/load
    // hiccup during convergence would silently corrupt localStorage and
    // the latest-requested marker.
    const calls = [];
    const resolvers = {};
    const mockI18n = {
      language: 'en',
      changeLanguage: vi.fn((lang) => {
        calls.push(lang);
        // First two calls (the user's NL then EN) resolve. The third call
        // is the convergence re-issue — reject it.
        if (calls.length >= 3) {
          return Promise.reject(new Error('convergence failed'));
        }
        return new Promise((resolve) => {
          resolvers[lang] = () => {
            mockI18n.language = lang;
            resolve();
          };
        });
      }),
    };
    const instance = new YiviAppBarClass({ i18n: mockI18n });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const nlPromise = instance.changeLanguage('nl');
    const enPromise = instance.changeLanguage('en');

    // EN resolves first, NL second — NL's post-await convergence detects the
    // drift (i18next stuck on 'nl') and fires a third changeLanguage('en')
    // which rejects.
    resolvers.en();
    resolvers.nl();
    await Promise.all([nlPromise, enPromise]);
    // Microtask drain for the fire-and-forget rejection to hit .catch.
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith('Language convergence failed', expect.any(Error));
    // localStorage and the latest-requested marker reflect the user's final
    // pick (EN), not the failed-convergence intermediate state.
    expect(window.localStorage.getItem('lang')).toBe('en');
    expect(YiviAppBarClass._latestRequestedLang).toBe('en');
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
