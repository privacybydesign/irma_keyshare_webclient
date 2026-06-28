import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import buildStore from './index';
import type { Candidate, UserDataResponse } from '../types';

// ── fetch mock plumbing ──────────────────────────────────────────────────────
//
// The middleware layer in index.ts is one `fetch` call per handler, each with
// its own success/error branching. We exercise it by building a real store via
// buildStore(), routing `global.fetch` by request path, dispatching the trigger
// action, then flushing the microtask queue so every chained `.then`/`.catch`
// (and any cascade the success branch dispatches) has run before we assert.

type StubResponse = Pick<Response, 'status'> & {
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

const jsonRes = (status: number, body: unknown): StubResponse => ({
  status,
  json: () => Promise.resolve(body),
});

const textRes = (status: number, body: string): StubResponse => ({
  status,
  text: () => Promise.resolve(body),
});

// A 204-style response with no meaningful body. json()/text() are provided so a
// handler that unexpectedly reads them still resolves rather than throwing.
const noBody = (status: number): StubResponse => ({
  status,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
});

// Route a request to the longest matching path prefix in `routes`. Any path not
// covered rejects loudly so an unanticipated fetch surfaces as a test failure
// rather than silently dispatching raiseError.
function mockFetch(routes: Record<string, StubResponse>): ReturnType<typeof vi.fn> {
  const keys = Object.keys(routes).sort((a, b) => b.length - a.length);
  const fn = vi.fn((input: string) => {
    const path = new URL(input).pathname;
    const match = keys.find((k) => path === k || path.startsWith(k));
    if (!match) return Promise.reject(new Error(`unexpected fetch: ${path}`));
    return Promise.resolve(routes[match] as unknown as Response);
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

// Drain the microtask queue. A single real-timer macrotask tick runs only after
// every pending promise job (including jobs that queue further jobs, e.g. the
// emailRemoved → GET /user cascade) has settled.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const userData = (over: Partial<UserDataResponse> = {}): UserDataResponse => ({
  username: 'alice',
  emails: [],
  delete_in_progress: false,
  revalidate_in_progress: false,
  ...over,
});

const candidate = (username: string): Candidate => ({ username, last_active: 1 });

type Store = ReturnType<typeof buildStore>;
let store: Store;

beforeEach(() => {
  store = buildStore();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('handleLoadLogs — GET /user/logs/:index', () => {
  it('happy path: loads entries into state', async () => {
    mockFetch({ '/user/logs': jsonRes(200, [{ timestamp: 1, event: 'e1' }]) });
    store.dispatch({ type: 'loadLogs', index: 0 });
    await flush();
    expect(store.getState().logs.logEntries).toEqual([{ timestamp: 1, event: 'e1' }]);
    expect(store.getState().logs.loading).toBe(false);
    expect(store.getState().login.error).toBe('');
  });

  it('non-200 status raises an error and clears loading', async () => {
    mockFetch({ '/user/logs': noBody(500) });
    store.dispatch({ type: 'loadLogs', index: 0 });
    await flush();
    expect(store.getState().logs.logEntries).toEqual([]);
    expect(store.getState().logs.loading).toBe(false);
    expect(store.getState().login.error).toContain('Error while loading log entries');
  });

  it('dedupe guard: a second loadLogs while one is in flight does not fetch again', () => {
    const fetchFn = mockFetch({ '/user/logs': jsonRes(200, []) });
    store.dispatch({ type: 'loadLogs', index: 0 }); // reducer flips logs.loading on
    store.dispatch({ type: 'loadLogs', index: 1 }); // guard short-circuits
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe('handleUpdateData — GET /user', () => {
  it('happy path: populates user data', async () => {
    mockFetch({ '/user': jsonRes(200, userData({ username: 'bob' })) });
    store.dispatch({ type: 'startUpdateInfo' });
    await flush();
    expect(store.getState().userdata.username).toBe('bob');
    expect(store.getState().userdata.fetching).toBe(false);
  });

  it('non-200 status raises an error and clears fetching', async () => {
    mockFetch({ '/user': noBody(404) });
    store.dispatch({ type: 'startUpdateInfo' });
    await flush();
    expect(store.getState().userdata.fetching).toBe(false);
    expect(store.getState().login.error).toContain('Error while loading user data');
  });

  it('dedupe guard: a second startUpdateInfo while fetching does not fetch again', () => {
    const fetchFn = mockFetch({ '/user': jsonRes(200, userData()) });
    store.dispatch({ type: 'startUpdateInfo' }); // reducer flips userdata.fetching on
    store.dispatch({ type: 'startUpdateInfo' }); // guard short-circuits
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('emailRemoved (no guard) triggers a /user refresh', async () => {
    mockFetch({ '/user': jsonRes(200, userData({ username: 'carol' })) });
    store.dispatch({ type: 'emailRemoved' });
    await flush();
    expect(store.getState().userdata.username).toBe('carol');
  });
});

describe('handleEmail — POST /email/remove', () => {
  it('204 dispatches emailRemoved, which cascades into a /user refresh', async () => {
    mockFetch({
      '/email/remove': noBody(204),
      '/user': jsonRes(200, userData({ username: 'dave' })),
    });
    store.dispatch({ type: 'removeEmail', email: 'a@b.c' });
    await flush();
    expect(store.getState().userdata.username).toBe('dave');
    expect(store.getState().login.error).toBe('');
  });

  it('500 + REVALIDATE_EMAIL raises a warning rather than an error', async () => {
    mockFetch({ '/email/remove': jsonRes(500, { error: 'REVALIDATE_EMAIL' }) });
    store.dispatch({ type: 'removeEmail', email: 'a@b.c' });
    await flush();
    expect(store.getState().login.sessionState).toBe('warningRaised');
    expect(store.getState().login.explanation).toBe('delete-mail-explanation');
    expect(store.getState().login.details).toBe('delete-mail-details');
    expect(store.getState().login.error).toBe('');
  });

  it('500 without the REVALIDATE_EMAIL marker raises an error', async () => {
    mockFetch({ '/email/remove': jsonRes(500, { error: 'something-else' }) });
    store.dispatch({ type: 'removeEmail', email: 'a@b.c' });
    await flush();
    expect(store.getState().login.error).toContain('Error while removing email');
  });
});

describe('handleDeleteAccount — POST /user/delete', () => {
  it('204 dispatches logout, which logs the user out via /logout', async () => {
    mockFetch({ '/user/delete': noBody(204), '/logout': noBody(204) });
    store.dispatch({ type: 'removeAccount' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedOut');
  });

  it('500 + REVALIDATE_EMAIL raises the delete-account warning', async () => {
    mockFetch({ '/user/delete': jsonRes(500, { error: 'REVALIDATE_EMAIL' }) });
    store.dispatch({ type: 'removeAccount' });
    await flush();
    expect(store.getState().login.sessionState).toBe('warningRaised');
    expect(store.getState().login.explanation).toBe('delete-account-mail-explanation');
    expect(store.getState().login.details).toBe('delete-account-mail-details');
  });

  it('500 without the marker raises an error', async () => {
    mockFetch({ '/user/delete': jsonRes(500, { error: 'nope' }) });
    store.dispatch({ type: 'removeAccount' });
    await flush();
    expect(store.getState().login.error).toContain('Error while deleting account');
  });
});

describe('handleTokenLogin — POST /login/token/candidates + /login/token', () => {
  it('exactly one candidate finishes the login (→ loggedIn)', async () => {
    mockFetch({
      '/login/token/candidates': jsonRes(200, [candidate('alice')]),
      '/login/token': noBody(204),
      '/user': jsonRes(200, userData()),
    });
    store.dispatch({ type: 'startTokenLogin', token: 'tok' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedIn');
  });

  it('multiple candidates populate the candidate picker', async () => {
    mockFetch({ '/login/token/candidates': jsonRes(200, [candidate('a'), candidate('b')]) });
    store.dispatch({ type: 'startTokenLogin', token: 'tok' });
    await flush();
    expect(store.getState().login.sessionState).toBe('selectCandidate');
    expect(store.getState().login.candidates).toHaveLength(2);
    expect(store.getState().login.token).toBe('tok');
  });

  it('zero candidates raises an error', async () => {
    mockFetch({ '/login/token/candidates': jsonRes(200, []) });
    store.dispatch({ type: 'startTokenLogin', token: 'tok' });
    await flush();
    expect(store.getState().login.error).toContain('no candidates returned');
  });

  it('non-200 on the candidates request raises an error', async () => {
    mockFetch({ '/login/token/candidates': noBody(500) });
    store.dispatch({ type: 'startTokenLogin', token: 'tok' });
    await flush();
    expect(store.getState().login.error).toContain('Error while fetching login candidates');
  });

  it('finishTokenLogin with a non-204 response raises an error', async () => {
    mockFetch({ '/login/token': noBody(500) });
    store.dispatch({ type: 'finishTokenLogin', token: 'tok', username: 'alice' });
    await flush();
    expect(store.getState().login.error).toContain('Error while logging in with token');
  });
});

describe('handleEmailLogin — POST /login/email', () => {
  it('204 marks the email as sent', async () => {
    mockFetch({ '/login/email': noBody(204) });
    store.dispatch({ type: 'startEmailLogin', email: 'a@b.c' });
    await flush();
    expect(store.getState().login.sessionState).toBe('emailSent');
  });

  it('non-204 raises an error', async () => {
    mockFetch({ '/login/email': noBody(500) });
    store.dispatch({ type: 'startEmailLogin', email: 'a@b.c' });
    await flush();
    expect(store.getState().login.error).toContain('Error while logging in with email');
  });
});

describe('handleRegistrationVerify — POST /verify', () => {
  it('204 marks the registration verified', async () => {
    mockFetch({ '/verify': noBody(204) });
    store.dispatch({ type: 'startRegistrationVerify', token: 'tok' });
    await flush();
    expect(store.getState().login.sessionState).toBe('showPostRegistration');
  });

  it('403 marks the token invalid (not an error)', async () => {
    mockFetch({ '/verify': noBody(403) });
    store.dispatch({ type: 'startRegistrationVerify', token: 'tok' });
    await flush();
    expect(store.getState().login.sessionState).toBe('tokenInvalid');
    expect(store.getState().login.error).toBe('');
  });

  it('other non-204 status raises an error', async () => {
    mockFetch({ '/verify': noBody(500) });
    store.dispatch({ type: 'startRegistrationVerify', token: 'tok' });
    await flush();
    expect(store.getState().login.error).toContain('Error while verifying email');
  });
});

describe('handleVerifySession — POST /checksession', () => {
  it('"ok" logs the user in', async () => {
    mockFetch({ '/checksession': textRes(200, 'ok'), '/user': jsonRes(200, userData()) });
    store.dispatch({ type: 'verifySession' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedIn');
  });

  it('"expired" logs the user out', async () => {
    mockFetch({ '/checksession': textRes(200, 'expired') });
    store.dispatch({ type: 'verifySession' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedOut');
  });

  it('an unexpected body raises an error', async () => {
    mockFetch({ '/checksession': textRes(200, 'something-weird') });
    store.dispatch({ type: 'verifySession' });
    await flush();
    expect(store.getState().login.error).toContain('Error while verifying session');
  });

  it('non-200 status raises an error', async () => {
    mockFetch({ '/checksession': textRes(500, '') });
    store.dispatch({ type: 'verifySession' });
    await flush();
    expect(store.getState().login.error).toContain('Error while verifying session');
  });
});

describe('handleLoggedIn', () => {
  it('loggedIn triggers a /user data refresh', async () => {
    mockFetch({ '/user': jsonRes(200, userData({ username: 'erin' })) });
    store.dispatch({ type: 'loggedIn' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedIn');
    expect(store.getState().userdata.username).toBe('erin');
  });
});

describe('handleLogout — POST /logout', () => {
  it('logout: 204 logs the user out', async () => {
    mockFetch({ '/logout': noBody(204) });
    store.dispatch({ type: 'logout' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedOut');
  });

  it('logout: a failed request raises an error', async () => {
    mockFetch({ '/logout': noBody(500) });
    store.dispatch({ type: 'logout' });
    await flush();
    expect(store.getState().login.error).toContain('Error while logging out');
  });

  it('resolveError: a failed request still forces a clean logout (no error raised)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch({ '/logout': noBody(500) });
    store.dispatch({ type: 'resolveError' });
    await flush();
    expect(store.getState().login.sessionState).toBe('loggedOut');
    expect(store.getState().login.error).toBe('');
    expect(consoleError).toHaveBeenCalled();
  });
});
