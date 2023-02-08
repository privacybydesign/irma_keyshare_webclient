import { createStore, applyMiddleware, combineReducers } from 'redux';

import login from './loginstate';
import logs from './logs';
import userdata from './userdata';

// Catch and deal with log loading
function handleLoadLogs({ getState, dispatch }) {
  return (next) => (action) => {
    if (action.type === 'loadLogs' && !getState().logs.loading) {
      // load logs if needed
      fetch(`${window.config.server}/user/logs/${action.index}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 200) throw res.status;
          return res.json();
        })
        .then((resjson) => {
          dispatch({ type: 'loadedLogs', entries: resjson });
        })
        .catch((err) => {
          dispatch({ type: 'errorLoadingLogs' });
          dispatch({ type: 'raiseError', errorMessage: `Error while loading log entries: ${err}` });
        });
    }
    return next(action);
  };
}

function handleUpdateData({ getState, dispatch }) {
  // The removal of an email address is not processed into the Redux state directly. Therefore, we fully update
  // the user data after an email address is removed. In this way we know for sure the viewed state is a correct
  // representation of the current back-end state, and we can rely on the error handling of this function.
  // It would be nice to reduce this overhead when more functionality is being introduced.
  return (next) => (action) => {
    if ((action.type === 'startUpdateInfo' && !getState().userdata.fetching) || action.type === 'emailRemoved') {
      fetch(`${window.config.server}/user`, {
        method: 'GET',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 200) throw res.status;
          return res.json();
        })
        .then((resjson) => {
          dispatch({ type: 'updateInfo', data: resjson });
        })
        .catch((err) => {
          dispatch({ type: 'errorUpdateInfo' });
          dispatch({ type: 'raiseError', errorMessage: `Error while loading user data: ${err}` });
        });
    }
    return next(action);
  };
}

function handleEmail({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'removeEmail') {
      fetch(`${window.config.server}/email/remove`, {
        method: 'POST',
        body: action.email,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'emailRemoved' });
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while removing email: ${err}` });
        });
    }
    return next(action);
  };
}

function handleDeleteAccount({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'removeAccount') {
      fetch(`${window.config.server}/user/delete`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'logout' });
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while deleting account: ${err}` });
        });
    }
    return next(action);
  };
}

function handleTokenLogin({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'startTokenLogin') {
      fetch(`${window.config.server}/login/token/candidates`, {
        method: 'POST',
        body: action.token,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 200) throw res.status;
          return res.json();
        })
        .then((resjson) => {
          if (resjson.length === 1) {
            dispatch({ type: 'finishTokenLogin', token: action.token, username: resjson[0].username });
          } else if (resjson.length === 0) {
            throw Error('no candidates returned');
          } else {
            dispatch({ type: 'setCandidates', candidates: resjson, token: action.token });
          }
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while fetching login candidates: ${err}` });
        });
    }
    if (action.type === 'finishTokenLogin') {
      fetch(`${window.config.server}/login/token`, {
        method: 'POST',
        body: JSON.stringify({ token: action.token, username: action.username }),
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'loggedIn' });
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while logging in with token: ${err}` });
        });
    }
    return next(action);
  };
}

function handleEmailLogin({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'startEmailLogin') {
      fetch(`${window.config.server}/login/email`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: action.email,
          language: window.config.lang,
        }),
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'emailSent' });
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while logging in with email: ${err}` });
        });
    }
    return next(action);
  };
}

function handleRegistrationVerify({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'startRegistrationVerify') {
      fetch(`${window.config.server}/verify`, {
        method: 'POST',
        body: action.token,
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 204) {
            dispatch({ type: 'registrationVerified' });
          } else if (res.status === 400) {
            dispatch({ type: 'tokenInvalid' });
          } else {
            throw res.status;
          }
        })
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while verifying email: ${err}` });
        });
    }
    return next(action);
  };
}

function handleVerifySession({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'verifySession') {
      fetch(`${window.config.server}/checksession`, {
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
        .catch((err) => {
          dispatch({ type: 'raiseError', errorMessage: `Error while verifying session: ${err}` });
        });
    }
    return next(action);
  };
}

function handleLoggedIn({ dispatch }) {
  return (next) => (action) => {
    if (action.type === 'loggedIn') {
      dispatch({ type: 'startUpdateInfo' });
    }
    return next(action);
  };
}

function handleLogout({ dispatch }) {
  return (next) => (action) => {
    // When resolving an error, logout is performed without raising an error if it fails.
    // This is done to prevent errors being raised recursively.
    if (action.type === 'logout' || action.type === 'resolveError') {
      fetch(`${window.config.server}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => {
          if (res.status !== 204) throw res.status;
          dispatch({ type: 'loggedOut' });
        })
        .catch((err) => {
          const errorMessage = `Error while logging out: ${err}`;
          if (action.type === 'logout') {
            dispatch({ type: 'raiseError', errorMessage: errorMessage });
          } else {
            console.error(errorMessage);
            dispatch({ type: 'loggedOut' });
          }
        });
    }
    return next(action);
  };
}

export default function buildStore() {
  return createStore(
    combineReducers({
      login: login,
      logs: logs,
      userdata: userdata,
    }),
    applyMiddleware(
      handleLoadLogs,
      handleUpdateData,
      handleEmail,
      handleDeleteAccount,
      handleTokenLogin,
      handleEmailLogin,
      handleRegistrationVerify,
      handleVerifySession,
      handleLoggedIn,
      handleLogout
    )
  );
}
