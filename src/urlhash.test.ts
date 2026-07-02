import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { consumeUrlHash, installHashLoginHandler } from './urlhash';
import type { SessionState } from './types';

function setLocation(hash: string) {
  // jsdom lets us drive the fragment via location.hash; pathname/search stay
  // at their defaults ("/" and "").
  window.location.hash = hash;
}

describe('consumeUrlHash', () => {
  let replaceState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setLocation('');
    replaceState = vi.spyOn(window.history, 'replaceState');
  });

  afterEach(() => {
    replaceState.mockRestore();
    setLocation('');
  });

  it('dispatches startTokenLogin for #token= and scrubs the fragment', () => {
    setLocation('#token=abc123');
    const dispatch = vi.fn();
    consumeUrlHash(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: 'startTokenLogin', token: 'abc123' });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/');
  });

  it('dispatches startRegistrationVerify for #verify= and scrubs the fragment', () => {
    setLocation('#verify=xyz789');
    const dispatch = vi.fn();
    consumeUrlHash(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: 'startRegistrationVerify', token: 'xyz789' });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/');
  });

  it('falls back to verifySession for an empty #token= but still scrubs it', () => {
    setLocation('#token=');
    const dispatch = vi.fn();
    consumeUrlHash(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: 'verifySession' });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/');
  });

  it('dispatches verifySession and does NOT touch history when there is no login fragment', () => {
    setLocation('');
    const dispatch = vi.fn();
    consumeUrlHash(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: 'verifySession' });
    expect(replaceState).not.toHaveBeenCalled();
  });
});

describe('installHashLoginHandler', () => {
  let replaceState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setLocation('');
    replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
      // Don't actually mutate the URL — we assert on hash contents ourselves.
    });
  });

  afterEach(() => {
    replaceState.mockRestore();
    setLocation('');
  });

  it('consumes the current hash immediately on install', () => {
    setLocation('#token=first');
    const dispatch = vi.fn();
    installHashLoginHandler(dispatch, () => 'unknown');
    expect(dispatch).toHaveBeenCalledWith({ type: 'startTokenLogin', token: 'first' });
  });

  it('re-consumes on hashchange while not authenticated', () => {
    const dispatch = vi.fn();
    let state: SessionState = 'unknown';
    installHashLoginHandler(dispatch, () => state);
    dispatch.mockClear();

    setLocation('#token=second');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'startTokenLogin', token: 'second' });
  });

  it('ignores hashchange once authenticated so a re-inserted token cannot re-login', () => {
    const dispatch = vi.fn();
    const state: SessionState = 'loggedIn';
    installHashLoginHandler(dispatch, () => state);
    dispatch.mockClear();

    setLocation('#token=attacker');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
