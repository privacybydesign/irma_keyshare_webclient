const initialState = {
    sessionState: 'unknown',
    candidates: [],
    error: '',
};

export default function(state = initialState, action) {
    switch(action.type) {
        case 'startSendMail':
            return {
                ...state,
                sessionState: 'waitSendEmail',
            };
        case 'startRegistrationVerify':
            return {
                ...state,
                sessionState: 'waitVerifyEmail',
            };
        case 'registrationVerified':
            return {
                ...state,
                sessionState: 'showPostRegistration',
            };
        case 'emailSent':
            return {
                ...state,
                sessionState: 'emailSent',
            };
        case 'startTokenLogin':
            return {
                ...state,
                sessionState: 'waitCandidates',
            };
        case 'setCandidates':
            return {
                ...state,
                candidates: action.candidates,
                sessionState: 'selectCandidate',
            };
        case 'loggedIn':
            return {
                ...state,
                sessionState: 'loggedIn',
            };
        case 'loggedOut':
            return {
                ...state,
                sessionState: 'loggedOut',
                irmaSession: {
                    url: window.config.server,
                    start: {
                        url: o => `${o.url}/login/irma`,
                    },
                    mapping: {
                        sessionPtr: r => r,
                    },
                    result: false,
                },
            };
        case 'raiseError':
            return {
                ...state,
                error: action.errorMessage,
            };
        default:
            return state;
    }
}