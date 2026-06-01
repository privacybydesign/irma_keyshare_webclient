import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import SelectMethod from './select_method.jsx';
import i18n from '../../i18n.js';
import { YiviAppBar as YiviAppBarClass } from '../../widgets/yivi_app_bar.jsx';

// The yivi-frontend widget makes real network calls when started. Replace
// it with a do-nothing stub so SelectMethod can mount under jsdom.
vi.mock('@privacybydesign/yivi-frontend', () => ({
  newWeb: vi.fn(() => ({
    start: vi.fn(() => new Promise(() => {})), // never resolves
    abort: vi.fn(),
  })),
}));

describe('SelectMethod', () => {
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

  it('preserves the #yivi-web-form DOM node identity across language switches', async () => {
    // The yivi-frontend widget writes its QR code imperatively into the
    // #yivi-web-form section. If React replaces or re-renders that node
    // when surrounding translations update (EN→NL), the QR code is wiped
    // and the in-flight session is lost. YiviWebFormMount's
    // shouldComponentUpdate=>false is what protects against that — this
    // test pins the contract end-to-end so a future refactor that drops
    // the SCU short-circuit fails loudly.
    const dispatch = vi.fn();
    const yiviSession = { url: 'http://x' };
    const { container } = render(<SelectMethod dispatch={dispatch} yiviSession={yiviSession} />);

    const beforeNode = container.querySelector('#yivi-web-form');
    expect(beforeNode).not.toBeNull();
    // Capture a sibling label that *should* re-translate — gives us a
    // positive signal that the re-render actually happened, so the
    // "node identity preserved" assertion isn't passing for the trivial
    // reason that nothing re-rendered.
    const beforeYiviTitle = container.querySelector('p > b').textContent;

    await act(async () => {
      await i18n.changeLanguage('nl');
    });

    const afterYiviTitle = container.querySelector('p > b').textContent;
    expect(afterYiviTitle).not.toBe(beforeYiviTitle);

    const afterNode = container.querySelector('#yivi-web-form');
    expect(afterNode).toBe(beforeNode);
  });
});
