import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import SelectMethod from './select_method.jsx';
import i18n from '../../i18n.js';
import { YiviAppBar as YiviAppBarClass } from '../../widgets/yivi_app_bar.jsx';

// The yivi-frontend widget makes real network calls when started. Replace
// it with a do-nothing stub so SelectMethod can mount under jsdom. Default
// implementation returns a widget whose `.start()` never resolves; tests
// that need finer control override `newWeb` via mockImplementation.
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
    // Reset the module-level mock between tests; vi.restoreAllMocks doesn't
    // re-apply the mock implementation we installed via vi.mock() above.
    YiviFrontend.newWeb.mockImplementation(() => ({
      start: vi.fn(() => new Promise(() => {})),
      abort: vi.fn(),
    }));
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

  it('under StrictMode double-mount, only the second mount dispatches verifySession', async () => {
    // React 19 StrictMode invokes componentDidMount → componentWillUnmount →
    // componentDidMount on the *same* instance in dev. The guard in
    // SelectMethod.componentDidMount captures the widget reference in
    // closure scope so a still-pending `.start().then(...)` from mount #1
    // does not pass the `widget !== this._yiviWeb` check when it resolves
    // after the re-mount has installed mount #2's widget. This pins that
    // contract: mount #1's resolution must be silent; only mount #2's
    // resolution may dispatch.
    vi.useFakeTimers();
    const widgets = [];
    YiviFrontend.newWeb.mockImplementation(() => {
      let resolveStart;
      const widget = {
        start: vi.fn(
          () =>
            new Promise((resolve) => {
              resolveStart = resolve;
            }),
        ),
        abort: vi.fn(),
        _resolveStart: () => resolveStart(),
      };
      widgets.push(widget);
      return widget;
    });

    const dispatch = vi.fn();
    const yiviSession = { url: 'http://x' };
    render(
      <React.StrictMode>
        <SelectMethod dispatch={dispatch} yiviSession={yiviSession} />
      </React.StrictMode>,
    );

    // StrictMode in dev creates two widgets (mount #1 → unmount → mount #2).
    expect(widgets.length).toBe(2);
    // Mount #1 was unmounted and aborted before mount #2 ran.
    expect(widgets[0].abort).toHaveBeenCalled();

    // Resolve mount #1's start() — this is the stale path. The guard must
    // suppress the setTimeout/dispatch.
    await act(async () => {
      widgets[0]._resolveStart();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(dispatch).not.toHaveBeenCalled();

    // Now resolve mount #2's start() — this is the current widget. After
    // the 1s delay, dispatch must fire exactly once.
    await act(async () => {
      widgets[1]._resolveStart();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'verifySession' });

    vi.useRealTimers();
  });

  it('dispatches raiseError when widget.start() rejects with a non-Aborted error', async () => {
    // The catch path in componentDidMount filters out the 'Aborted' sentinel
    // (which yivi-frontend uses for user-initiated cancellation; we don't
    // want a noisy error toast in that case) and dispatches a raiseError
    // for everything else. Pin both branches.
    YiviFrontend.newWeb.mockImplementation(() => ({
      start: vi.fn(() => Promise.reject('boom')),
      abort: vi.fn(),
    }));
    const dispatch = vi.fn();
    await act(async () => {
      render(<SelectMethod dispatch={dispatch} yiviSession={{ url: 'http://x' }} />);
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'raiseError',
      errorMessage: 'Error while logging in with Yivi: boom',
    });
  });

  it('swallows the Aborted sentinel without dispatching raiseError', async () => {
    // Companion to the test above — yivi-frontend rejects with the literal
    // string 'Aborted' when the user cancels; that path must stay silent.
    YiviFrontend.newWeb.mockImplementation(() => ({
      start: vi.fn(() => Promise.reject('Aborted')),
      abort: vi.fn(),
    }));
    const dispatch = vi.fn();
    await act(async () => {
      render(<SelectMethod dispatch={dispatch} yiviSession={{ url: 'http://x' }} />);
    });
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'raiseError' }));
  });

  it('dispatches startEmailLogin with the typed address when the email form is submitted', async () => {
    const dispatch = vi.fn();
    const { container } = render(<SelectMethod dispatch={dispatch} yiviSession={{ url: 'http://x' }} />);
    const input = container.querySelector('#input-email');
    fireEvent.change(input, { target: { value: 'alice@example.test' } });
    await act(async () => {
      fireEvent.submit(container.querySelector('#login-form-email'));
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'startEmailLogin', email: 'alice@example.test' });
  });
});
