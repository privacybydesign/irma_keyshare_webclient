const initialState = {
  username: '',
  emails: [],
  deleting: false,
  fetching: false,
  addEmailYiviSession: {
    url: window.config.server,
    start: {
      url: (o) => `${o.url}/email/add`,
      method: 'POST',
      credentials: 'include',
    },
    result: false,
  },
};

export default function userdata(state = initialState, action) {
  switch (action.type) {
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
        revalidating: action.data.revalidate_in_progress,
        emails: action.data.emails,
        fetching: false,
      };
    case 'removeEmail':
      return {
        ...state,
        fetching: true,
      };
    default:
      return state;
  }
}
