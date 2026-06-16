import { describe, it, expect, vi, afterEach } from 'vitest';
import buildStore, { isExpiredSession } from './index';

// Body the keyshare server returns for a session-protected endpoint when the
// session cookie has expired or is unknown (HTTP 400).
const NOT_LOGGED_IN = JSON.stringify({
  status: 400,
  error: 'INVALID_REQUEST',
  description: 'Invalid HTTP request',
  message: 'not logged in',
});

const mockFetchOnce = (body: string, status: number) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isExpiredSession', () => {
  it('detects the 400 "not logged in" body as an expired session', async () => {
    expect(await isExpiredSession(new Response(NOT_LOGGED_IN, { status: 400 }))).toBe(true);
  });

  it('ignores non-400 responses', async () => {
    expect(await isExpiredSession(new Response(NOT_LOGGED_IN, { status: 500 }))).toBe(false);
  });

  it('ignores a 400 with a different message (e.g. a genuinely malformed request)', async () => {
    const body = JSON.stringify({ status: 400, error: 'INVALID_REQUEST', message: 'invalid offset' });
    expect(await isExpiredSession(new Response(body, { status: 400 }))).toBe(false);
  });

  it('ignores a 400 with a non-JSON body', async () => {
    expect(await isExpiredSession(new Response('not json', { status: 400 }))).toBe(false);
  });
});

describe('loadLogs middleware', () => {
  it('shows the session-expired screen instead of a raw 400 when the session timed out', async () => {
    mockFetchOnce(NOT_LOGGED_IN, 400);
    const store = buildStore();

    store.dispatch({ type: 'loadLogs', index: 0 });

    await vi.waitFor(() => {
      expect(store.getState().login.sessionState).toBe('sessionExpired');
    });
    expect(store.getState().login.error).toBe('');
    expect(store.getState().logs.loading).toBe(false);
  });

  it('still raises a generic error for other (non-session) failures', async () => {
    mockFetchOnce(JSON.stringify({ status: 500, message: 'boom' }), 500);
    const store = buildStore();

    store.dispatch({ type: 'loadLogs', index: 0 });

    await vi.waitFor(() => {
      expect(store.getState().login.error).toContain('500');
    });
    expect(store.getState().login.sessionState).not.toBe('sessionExpired');
    expect(store.getState().logs.loading).toBe(false);
  });

  it('loads entries normally on a 200 response', async () => {
    mockFetchOnce(JSON.stringify([{ timestamp: 1, event: 'IRMA_SESSION' }]), 200);
    const store = buildStore();

    store.dispatch({ type: 'loadLogs', index: 0 });

    await vi.waitFor(() => {
      expect(store.getState().logs.logEntries).toHaveLength(1);
    });
    expect(store.getState().login.sessionState).not.toBe('sessionExpired');
  });
});
