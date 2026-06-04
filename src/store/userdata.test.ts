import { describe, it, expect } from 'vitest';
import userdata from './userdata';
import type { AppAction } from '../types';

const initial = userdata(undefined, { type: '@@INIT' } as unknown as AppAction);

describe('userdata reducer', () => {
  it('starts blank with no emails and a seeded Yivi add-email session', () => {
    expect(initial.username).toBe('');
    expect(initial.emails).toEqual([]);
    expect(initial.deleting).toBe(false);
    expect(initial.fetching).toBe(false);
    expect(initial.addEmailYiviSession.url).toBe(window.config!.server);
    expect(initial.addEmailYiviSession.start.method).toBe('POST');
    expect(initial.addEmailYiviSession.start.url({ url: 'http://x' })).toBe('http://x/email/add');
  });

  it('startUpdateInfo flips fetching on', () => {
    expect(userdata(initial, { type: 'startUpdateInfo' }).fetching).toBe(true);
  });

  it('errorUpdateInfo flips fetching off', () => {
    const busy = userdata(initial, { type: 'startUpdateInfo' });
    expect(userdata(busy, { type: 'errorUpdateInfo' }).fetching).toBe(false);
  });

  it('updateInfo populates username, emails, deleting + revalidating from the payload', () => {
    const next = userdata(initial, {
      type: 'updateInfo',
      data: {
        username: 'alice',
        emails: [{ email: 'a@b.c', delete_in_progress: false, revalidate_in_progress: false }],
        delete_in_progress: true,
        revalidate_in_progress: false,
      },
    });
    expect(next.username).toBe('alice');
    expect(next.emails).toEqual([{ email: 'a@b.c', delete_in_progress: false, revalidate_in_progress: false }]);
    expect(next.deleting).toBe(true);
    expect(next.revalidating).toBe(false);
    expect(next.fetching).toBe(false);
  });

  it('removeEmail sets fetching (the actual remove is handled by middleware)', () => {
    expect(userdata(initial, { type: 'removeEmail', email: 'a@b.c' }).fetching).toBe(true);
  });

  it('loggedOut clears identity but leaves the Yivi session config intact', () => {
    const populated = userdata(initial, {
      type: 'updateInfo',
      data: {
        username: 'alice',
        emails: [{ email: 'a@b.c', delete_in_progress: false, revalidate_in_progress: false }],
        delete_in_progress: false,
        revalidate_in_progress: false,
      },
    });
    const next = userdata(populated, { type: 'loggedOut' });
    expect(next.username).toBe('');
    expect(next.emails).toEqual([]);
    expect(next.deleting).toBe(false);
    expect(next.addEmailYiviSession).toEqual(initial.addEmailYiviSession);
  });

  it('ignores unknown actions and returns the same state reference', () => {
    expect(userdata(initial, { type: 'unrelated' } as unknown as AppAction)).toBe(initial);
  });
});
