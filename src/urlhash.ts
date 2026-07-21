import type { AppDispatch, SessionState } from './types';

// The email magic-link lands the user on the app with a `#token=<secret>` (login)
// or `#verify=<secret>` (registration) URL fragment. This module consumes that
// fragment exactly once and then scrubs it from the URL + history so the secret
// can't leak via the address bar, a copied/shared URL, the Referer header, or a
// later re-read of location.hash.

/**
 * Read the current URL fragment, dispatch the matching login/verify (or plain
 * session-check) action, and — if a `#token=`/`#verify=` fragment was consumed
 * — strip it from the address bar and history via history.replaceState.
 *
 * replaceState is used deliberately (rather than assigning location.hash = '')
 * because it does NOT emit a fresh 'hashchange' event, so scrubbing the token
 * cannot re-enter this handler.
 */
export function consumeUrlHash(dispatch: AppDispatch): void {
  const fragment = window.location.hash;
  let consumedToken = false;
  if (fragment.startsWith('#token=')) {
    const token = fragment.slice(7);
    if (token) dispatch({ type: 'startTokenLogin', token });
    else dispatch({ type: 'verifySession' });
    consumedToken = true;
  } else if (fragment.startsWith('#verify=')) {
    const token = fragment.slice(8);
    if (token) dispatch({ type: 'startRegistrationVerify', token });
    else dispatch({ type: 'verifySession' });
    consumedToken = true;
  } else {
    dispatch({ type: 'verifySession' });
  }
  if (consumedToken) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

/**
 * Consume the current hash immediately, then keep listening for hash changes —
 * except once the user is authenticated, when hash changes are ignored so a
 * stray or re-inserted `#token=`/`#verify=` fragment can't kick off a fresh
 * login (or session re-verification) over an already-established session.
 */
export function installHashLoginHandler(dispatch: AppDispatch, getSessionState: () => SessionState): void {
  window.addEventListener('hashchange', () => {
    if (getSessionState() === 'loggedIn') return;
    consumeUrlHash(dispatch);
  });
  consumeUrlHash(dispatch);
}
