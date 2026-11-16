import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import type { YiviSessionConfig } from '../../types';
import SelectMethod from './select_method';
import i18n from '../../i18n';

vi.mock('@privacybydesign/yivi-frontend', () => ({
  newWeb: vi.fn(() => ({
    start: vi.fn(() => new Promise<void>(() => {})),
    abort: vi.fn(),
  })),
}));

const mockedNewWeb = vi.mocked(YiviFrontend.newWeb);

const fakeSession = (url = 'http://x'): YiviSessionConfig => ({
  url,
  start: { url: (o) => `${o.url}/login/irma`, method: 'POST', credentials: 'include' },
  result: false,
});

describe('SelectMethod', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.removeAttribute('lang');
    window.localStorage.clear();
    mockedNewWeb.mockImplementation(() => ({
      start: vi.fn(() => new Promise<void>(() => {})),
      abort: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('preserves the #yivi-web-form DOM node identity across language switches', async () => {
    const dispatch = vi.fn();
    const { container } = render(<SelectMethod dispatch={dispatch} yiviSession={fakeSession()} />);

    const beforeNode = container.querySelector('#yivi-web-form');
    expect(beforeNode).not.toBeNull();
    const beforeYiviTitle = container.querySelector('p > b')!.textContent;

    await act(async () => {
      await i18n.changeLanguage('nl');
    });

    const afterYiviTitle = container.querySelector('p > b')!.textContent;
    expect(afterYiviTitle).not.toBe(beforeYiviTitle);

    const afterNode = container.querySelector('#yivi-web-form');
    expect(afterNode).toBe(beforeNode);
  });

  it('under StrictMode double-mount, only the second mount dispatches verifySession', async () => {
    vi.useFakeTimers();
    type MockWidget = {
      start: ReturnType<typeof vi.fn>;
      abort: ReturnType<typeof vi.fn>;
      _resolveStart: () => void;
    };
    const widgets: MockWidget[] = [];
    mockedNewWeb.mockImplementation(() => {
      let resolveStart: () => void = () => {};
      const widget: MockWidget = {
        start: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveStart = resolve;
            }),
        ),
        abort: vi.fn(),
        _resolveStart: () => resolveStart(),
      };
      widgets.push(widget);
      return widget as unknown as ReturnType<typeof YiviFrontend.newWeb>;
    });

    const dispatch = vi.fn();
    render(
      <React.StrictMode>
        <SelectMethod dispatch={dispatch} yiviSession={fakeSession()} />
      </React.StrictMode>,
    );

    expect(widgets.length).toBe(2);
    expect(widgets[0].abort).toHaveBeenCalled();

    await act(async () => {
      widgets[0]._resolveStart();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(dispatch).not.toHaveBeenCalled();

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
    mockedNewWeb.mockImplementation(() => ({
      start: vi.fn(() => Promise.reject('boom')),
      abort: vi.fn(),
    }));
    const dispatch = vi.fn();
    await act(async () => {
      render(<SelectMethod dispatch={dispatch} yiviSession={fakeSession()} />);
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'raiseError',
      errorMessage: 'error-yivi-login',
    });
  });

  it('swallows the Aborted sentinel without dispatching raiseError', async () => {
    mockedNewWeb.mockImplementation(() => ({
      start: vi.fn(() => Promise.reject('Aborted')),
      abort: vi.fn(),
    }));
    const dispatch = vi.fn();
    await act(async () => {
      render(<SelectMethod dispatch={dispatch} yiviSession={fakeSession()} />);
    });
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'raiseError' }));
  });

  it('dispatches startEmailLogin with the typed address when the email form is submitted', async () => {
    const dispatch = vi.fn();
    const { container } = render(<SelectMethod dispatch={dispatch} yiviSession={fakeSession()} />);
    const input = container.querySelector('#input-email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alice@example.test' } });
    await act(async () => {
      fireEvent.submit(container.querySelector('#login-form-email')!);
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'startEmailLogin', email: 'alice@example.test' });
  });
});
