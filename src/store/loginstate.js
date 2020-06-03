const initialState = {
    sessionState: 'unknown',
    candidates: [],
    error: '',
};

export default function(state = initialState, action) {
    switch(action.type) {
        case 'startIrmaLogin':
            return {
                ...state,
                sessionState: 'waitIrmaLoginSession',
            };
        case 'startSendMail':
            return {
                ...state,
                sessionState: 'waitSendEmail',
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