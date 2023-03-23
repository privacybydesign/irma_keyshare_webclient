const initialState = {
  sessionState: 'unknown',
  candidates: [],
  error: '',
};

export default function login(state = initialState, action) {
  switch (action.type) {
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
        token: action.token,
        sessionState: 'selectCandidate',
      };
    case 'loggedIn':
      return {
        ...state,
        sessionState: 'loggedIn',
      };
    case 'logout':
      return {
        ...state,
        sessionState: 'loggingOut',
      };
    case 'loggedOut':
      return {
        ...state,
        sessionState: 'loggedOut',
        yiviSession: {
          url: window.config.server,
          start: {
            url: (o) => `${o.url}/login/irma`,
            method: 'POST',
            credentials: 'include',
          },
          result: false,
        },
      };
    case 'tokenInvalid':
      return {
        ...state,
        sessionState: 'tokenInvalid',
      };
    case 'raiseError':
      return state.error
        ? state
        : {
            ...state,
            error: action.errorMessage,
          };
    case 'resolveError':
      return {
        ...state,
        sessionState: 'loggingOut',
        error: '',
      };
    default:
      return state;
  }
}
