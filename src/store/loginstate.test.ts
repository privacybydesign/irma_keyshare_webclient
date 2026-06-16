import { describe, it, expect } from 'vitest';
import login from './loginstate';
import type { AppAction, LoginState } from '../types';

const initial = login(undefined, { type: '@@INIT' } as unknown as AppAction);

describe('login reducer', () => {
  it('starts in the "unknown" session state with no candidates and no error', () => {
    expect(initial).toEqual({
      sessionState: 'unknown',
      candidates: [],
      error: '',
    });
  });

  it('returns the same state for an unknown action', () => {
    const state: LoginState = { ...initial, sessionState: 'loggedIn' };
    expect(login(state, { type: 'noSuchAction' } as unknown as AppAction)).toBe(state);
  });

  it.each([
    ['startSendMail', 'waitSendEmail'],
    ['startRegistrationVerify', 'waitVerifyEmail'],
    ['registrationVerified', 'showPostRegistration'],
    ['emailSent', 'emailSent'],
    ['startTokenLogin', 'waitCandidates'],
    ['loggedIn', 'loggedIn'],
    ['logout', 'loggingOut'],
    ['tokenInvalid', 'tokenInvalid'],
    ['sessionExpired', 'sessionExpired'],
  ])('action %s transitions sessionState to %s', (type, expected) => {
    expect(login(initial, { type } as unknown as AppAction).sessionState).toBe(expected);
  });

  it('setCandidates stores candidates + token and transitions to selectCandidate', () => {
    const next = login(initial, {
      type: 'setCandidates',
      candidates: [
        { username: 'alice', last_active: 0 },
        { username: 'bob', last_active: 0 },
      ],
      token: 'tok-123',
    });
    expect(next.sessionState).toBe('selectCandidate');
    expect(next.candidates).toEqual([
      { username: 'alice', last_active: 0 },
      { username: 'bob', last_active: 0 },
    ]);
    expect(next.token).toBe('tok-123');
  });

  it('loggedOut transitions to loggedOut and seeds the Yivi session config', () => {
    const next = login(initial, { type: 'loggedOut' });
    expect(next.sessionState).toBe('loggedOut');
    expect(next.yiviSession!.url).toBe(window.config!.server);
    expect(next.yiviSession!.start.method).toBe('POST');
    expect(next.yiviSession!.start.url({ url: 'http://x' })).toBe('http://x/login/irma');
  });

  it('raiseWarning captures the explanation/details payload', () => {
    const next = login(initial, {
      type: 'raiseWarning',
      explanation: 'why',
      details: 'how',
    });
    expect(next.sessionState).toBe('warningRaised');
    expect(next.explanation).toBe('why');
    expect(next.details).toBe('how');
  });

  it('raiseError sets error only when it is currently empty (first-error wins)', () => {
    const first = login(initial, { type: 'raiseError', errorMessage: 'boom' });
    expect(first.error).toBe('boom');
    const second = login(first, { type: 'raiseError', errorMessage: 'second' });
    expect(second).toBe(first);
    expect(second.error).toBe('boom');
  });

  it('resolveError clears the error and transitions to loggingOut', () => {
    const errored = login(initial, { type: 'raiseError', errorMessage: 'boom' });
    const next = login(errored, { type: 'resolveError' });
    expect(next.error).toBe('');
    expect(next.sessionState).toBe('loggingOut');
  });
});
