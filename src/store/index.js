import { createStore, applyMiddleware, combineReducers } from 'redux';

import login from './loginstate';
import logs from './logs';
import userdata from './userdata';

// Catch and deal with log loading
function handleLoadLogs({getState, dispatch}) {
    return next => action => {
        if (action.type === 'loadLogs' && !getState().logs.loading) {
            // load logs if needed
            const result = next(action)
            const offset = getState().logs.currentIndex;
            fetch(window.config.server + '/user/logs/' + offset, {
                method: 'GET',
                credentials: 'include',
            }).then(res => {
                if (res.status !== 200)
                    throw res.status;
                return res.json();
            }).then(resjson => {
                dispatch({type: 'loadedLogs', entries: resjson});
            }).catch(err => {
                dispatch({type: 'errorLoadingLogs'});
                dispatch({type: 'raiseError', errorMessage: 'Error on loading log entries. ('+err+')'});
            });

            return result
        }

        return next(action);
    };
}

function handleUpdateData({getState, dispatch}) {
    return next => action => {
        if (action.type === 'startUpdateInfo' && !getState().userdata.fetching) {
            fetch(window.config.server + '/user', {
                method: 'GET',
                credentials: 'include',
            }).then(res => {
                if (res.status !== 200)
                    throw res.status;
                return res.json();
            }).then(resjson => {
                dispatch({type: 'updateInfo', data: resjson});
            }).catch(err => {
                dispatch({type: 'errorUpdateInfo'});
                dispatch({type: 'raiseError', errorMessage: 'Error on loading user data. ('+err+')'});
            });
        }
        return next(action);
    };
}

function handleEmail({dispatch}) {
    return next => action => {
        if (action.type === 'addEmail') {
            fetch(window.config.server + '/email/add', {
                method: 'POST',
                credentials: 'include',
            }).then(res => {
                if (res.status !== 200)
                    throw res.status;
                // TODO: Decide how to use info here to start irma session
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on starting irma session to add email. ('+err+')'});
            });
        }
        if (action.type === 'removeEmail') {
            fetch(window.config.server + '/email/remove', {
                method: 'POST',
                body: action.email,
                credentials: 'include',
            }).then(res => {
                if (res.status !== 204) throw res.status;
                dispatch({type: 'startUpdateInfo'});
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on removing email. ('+err+')'});
            });
        }
        return next(action);
    }
}

function handleDeleteAccount({dispatch}) {
    return next => action => {
        if (action.type === 'removeAccount') {
            fetch(window.config.server + '/user/delete', {
                method: 'POST',
                credentials: 'include',
            }).then(res => {
                if (res.status !== 204) throw res.status;
                dispatch({type: 'startUpdateInfo'});
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on deleting account. ('+err+')'});
            });
        }
        return next(action);
    };
}

function handleTokenLogin({dispatch}) {
    return next => action => {
        if (action.type === 'startTokenLogin') {
            fetch(window.config.server + '/login/token/candidates', {
                method: 'POST',
                body: action.token,
                credentials: 'include',
            }).then(res => {
                if (res.status !== 200) throw res.status;
                return res.json();
            }).then(resjson => {
                if (resjson.length === 1) {
                    dispatch({type: 'finishTokenLogin', token: action.token, username: resjson[0].username});
                } else if (resjson.length === 0) {
                    throw Error('no candidates returned');
                } else {
                    dispatch({type: 'setCandidates', candidates: resjson, token: action.token});
                }
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error whilst fetching login candidates. ('+err+')'});
                dispatch({type: 'loggedOut'});
            });
        }
        if (action.type === 'finishTokenLogin') {
            fetch(window.config.server + '/login/token', {
                method: 'POST',
                body: JSON.stringify({token: action.token, username: action.username}),
                credentials: 'include',
            }).then(res => {
                if (res.status !== 204) throw res.status;
                dispatch({type: 'loggedIn'});
                dispatch({type: 'startUpdateInfo'});
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on login in with token. ('+err+')'});
                dispatch({type: 'loggedOut'});
            });
        }
        return next(action);
    };
}

function handleEmailLogin({dispatch}) {
    return next => action => {
        if (action.type === 'startEmailLogin') {
            fetch(window.config.server + '/login/email', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    email: action.email,
                    language: window.config.lang,
                }),
            }).then(res => {
                if (res.status !== 204) throw res.status;
                dispatch({type: 'emailSent'});
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on logging in with email. ('+err+')'});
                dispatch({type: 'loggedOut'});
            });
        }
        return next(action);
    };
}

function handleRegistrationVerify({dispatch}) {
    return next => action => {
        if (action.type === 'startRegistrationVerify') {
            fetch(window.config.server + '/verify', {
                method: 'POST',
                body: action.token,
                credentials: 'include',
            }).then(res => {
                if (res.status !== 204) throw res.status;
                dispatch({type: 'registrationVerified'});
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: 'Error on verifying email. ('+err+')'});
                dispatch({type: 'loggedOut'});
            });
        }
        return next(action);
    };
}

function handleVerifySession({dispatch}) {
    return next => action => {
        if (action.type === 'verifySession') {
            fetch(window.config.server + '/checksession', {
                method: 'POST',
                credentials: 'include',
            }).then (res => {
                if (res.status !== 200) throw res.status;
                return res.text();
            }).then (res => {
                if (res === 'ok') {
                    dispatch({type: 'loggedIn'});
                    dispatch({type: 'startUpdateInfo'});
                } else if (res === 'expired') {
                    dispatch({type: 'loggedOut'});
                } else {
                    throw res;
                }
            }).catch(err => {
                dispatch({type: 'raiseError', errorMessage: err});
                dispatch({type: 'loggedOut'});
            });
        }
        return next(action);
    }
}

export default function() {
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
        ),
    );
}