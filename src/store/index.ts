import { configureStore } from '@reduxjs/toolkit';
import type { Middleware, Reducer, UnknownAction } from '@reduxjs/toolkit';
import login from './loginstate';
import logs from './logs';
import userdata from './userdata';
import i18n from '../i18n';
import type {
  AppAction,
  AppDispatch,
  Candidate,
  LogEntry,
  LoginState,
  LogsState,
  RootState,
  UserDataResponse,
  UserdataState,
} from '../types';

type AppMiddlewareAPI = { getState: () => RootState; dispatch: AppDispatch };

function matchAction<T extends AppAction['type']>(
  action: unknown,
  type: T,
): action is Extract<AppAction, { type: T }> {
  return typeof action === 'object' && action !== null && (action as { type?: unknown }).type === type;
}

// When the keyshare session has expired (or the cookie is unknown), the server
// rejects requests to session-protected endpoints with HTTP 400 and a body of
// `{"error":"INVALID_REQUEST","message":"not logged in", ...}`. We detect that
// specific case so the UI can show a clear "your session expired" message
// instead of surfacing a raw, unexplained 400 to the user.
export async function isExpiredSession(res: Response): Promise<boolean> {
  if (res.status !== 400) return false;
  try {
    const body: { message?: string } = await res.clone().json();
    return body?.message === 'not logged in';
  } catch {
    return false;
  }
}

function handleLoadLogs({ getState, dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'loadLogs') && !getState().logs.loading) {
      fetch(`${window.config?.server}/user/logs/${action.index}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (res.status === 200) {
            const entries: LogEntry[] = await res.json();
            dispatch({ type: 'loadedLogs', entries });
            return;
          }
          dispatch({ type: 'errorLoadingLogs' });
          if (await isExpiredSession(res)) {
            dispatch({ type: 'sessionExpired' });
            return;
          }
          dispatch({ type: 'raiseError', errorMessage: 'error-loading-logs' });
        })
        .catch((err: unknown) => {
          console.error('Error while loading log entries:', err);
          dispatch({ type: 'errorLoadingLogs' });
          dispatch({ type: 'raiseError', errorMessage: 'error-loading-logs' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleUpdateData({ getState, dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (
      (matchAction(action, 'startUpdateInfo') && !getState().userdata.fetching) ||
      matchAction(action, 'emailRemoved')
    ) {
      fetch(`${window.config?.server}/user`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (res.status === 200) {
            const data: UserDataResponse = await res.json();
            dispatch({ type: 'updateInfo', data });
            return;
          }
          dispatch({ type: 'errorUpdateInfo' });
          if (await isExpiredSession(res)) {
            dispatch({ type: 'sessionExpired' });
            return;
          }
          dispatch({ type: 'raiseError', errorMessage: 'error-loading-userdata' });
        })
        .catch((err: unknown) => {
          console.error('Error while loading user data:', err);
          dispatch({ type: 'errorUpdateInfo' });
          dispatch({ type: 'raiseError', errorMessage: 'error-loading-userdata' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleEmail({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'removeEmail')) {
      fetch(`${window.config?.server}/email/remove`, {
        method: 'POST',
        body: action.email,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 204) {
            dispatch({ type: 'emailRemoved' });
            return;
          }
          return res.json().then((resjson: { error?: string }) => {
            if (res.status === 500 && resjson.error === 'REVALIDATE_EMAIL') {
              dispatch({
                type: 'raiseWarning',
                explanation: 'delete-mail-explanation',
                details: 'delete-mail-details',
              });
            } else {
              throw res.status;
            }
          });
        })
        .catch((err: unknown) => {
          console.error('Error while removing email:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-removing-email' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleDeleteAccount({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'removeAccount')) {
      fetch(`${window.config?.server}/user/delete`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 204) {
            dispatch({ type: 'logout' });
            return;
          }
          return res.json().then((resjson: { error?: string }) => {
            if (res.status === 500 && resjson.error === 'REVALIDATE_EMAIL') {
              dispatch({
                type: 'raiseWarning',
                explanation: 'delete-account-mail-explanation',
                details: 'delete-account-mail-details',
              });
            } else {
              throw res.status;
            }
          });
        })
        .catch((err: unknown) => {
          console.error('Error while deleting account:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-deleting-account' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleTokenLogin({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'startTokenLogin')) {
      fetch(`${window.config?.server}/login/token/candidates`, {
        method: 'POST',
        body: action.token,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 200) throw res.status;
          return res.json();
        })
        .then((resjson: Candidate[]) => {
          if (resjson.length === 1) {
            dispatch({ type: 'finishTokenLogin', token: action.token, username: resjson[0].username });
          } else if (resjson.length === 0) {
            throw new Error('no candidates returned');
          } else {
            dispatch({ type: 'setCandidates', candidates: resjson, token: action.token });
          }
        })
        .catch((err: unknown) => {
          console.error('Error while fetching login candidates:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-login-candidates' });
        });
    }
    if (matchAction(action, 'finishTokenLogin')) {
      const { token, username } = action;
      fetch(`${window.config?.server}/login/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username }),
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'loggedIn' });
        })
        .catch((err: unknown) => {
          console.error('Error while logging in with token:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-token-login' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleEmailLogin({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'startEmailLogin')) {
      fetch(`${window.config?.server}/login/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: action.email, language: i18n.language }),
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'emailSent' });
        })
        .catch((err: unknown) => {
          console.error('Error while logging in with email:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-email-login' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleRegistrationVerify({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'startRegistrationVerify')) {
      fetch(`${window.config?.server}/verify`, {
        method: 'POST',
        body: action.token,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 204) {
            dispatch({ type: 'registrationVerified' });
          } else if (res.status === 403) {
            dispatch({ type: 'tokenInvalid' });
          } else {
            throw res.status;
          }
        })
        .catch((err: unknown) => {
          console.error('Error while verifying email:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-verifying-email' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleVerifySession({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'verifySession')) {
      fetch(`${window.config?.server}/checksession`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 200) throw res.status;
          return res.text();
        })
        .then((res) => {
          if (res === 'ok') {
            dispatch({ type: 'loggedIn' });
          } else if (res === 'expired') {
            dispatch({ type: 'loggedOut' });
          } else {
            throw res;
          }
        })
        .catch((err: unknown) => {
          console.error('Error while verifying session:', err);
          dispatch({ type: 'raiseError', errorMessage: 'error-verifying-session' });
        });
    }
    return next(action as UnknownAction);
  };
}

function handleLoggedIn({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'loggedIn')) {
      dispatch({ type: 'startUpdateInfo' });
    }
    return next(action as UnknownAction);
  };
}

function handleLogout({ dispatch }: AppMiddlewareAPI): ReturnType<Middleware> {
  return (next) => (action) => {
    if (matchAction(action, 'logout') || matchAction(action, 'resolveError')) {
      const isResolve = matchAction(action, 'resolveError');
      fetch(`${window.config?.server}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'loggedOut' });
        })
        .catch((err: unknown) => {
          console.error('Error while logging out:', err);
          if (!isResolve) {
            dispatch({ type: 'raiseError', errorMessage: 'error-logout' });
          } else {
            dispatch({ type: 'loggedOut' });
          }
        });
    }
    return next(action as UnknownAction);
  };
}

export default function buildStore() {
  return configureStore({
    reducer: {
      login: login as Reducer<LoginState>,
      logs: logs as Reducer<LogsState>,
      userdata: userdata as Reducer<UserdataState>,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredPaths: ['login.yiviSession.start.url', 'userdata.addEmailYiviSession.start.url'],
        },
      }).concat(
        handleLoadLogs as Middleware,
        handleUpdateData as Middleware,
        handleEmail as Middleware,
        handleDeleteAccount as Middleware,
        handleTokenLogin as Middleware,
        handleEmailLogin as Middleware,
        handleRegistrationVerify as Middleware,
        handleVerifySession as Middleware,
        handleLoggedIn as Middleware,
        handleLogout as Middleware,
      ),
  });
}
