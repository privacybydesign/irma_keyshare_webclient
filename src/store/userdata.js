const initialState = {
    username: '',
    emails: [],
    deleting: false,
    fetching: false,
    addEmailIrmaSession: {
        url: window.config.server,
            start: {
                url: o => `${o.url}/email/add`,
                credentials: 'include',
        },
        result: false,
    },
};

export default function(state = initialState, action) {
    switch(action.type) {
        case 'loggedOut':
            return {
                ...state,
                username: '',
                emails: [],
                deleting: false,
            };
        case 'startUpdateInfo':
            return {
                ...state,
                fetching: true,
            };
        case 'errorUpdateInfo':
            return {
                ...state,
                fetching: false,
            };
        case 'updateInfo':
            return {
                ...state,
                username: action.data.username,
                deleting: action.data.delete_in_progress,
                emails: action.data.emails,
                fetching: false,
            };
        default:
            return state;
    }
}