const initialState = {
  logEntries: [],
  currentIndex: 0,
  haveMore: false,
  loading: false,
};

export default function logs(state = initialState, action) {
  switch (action.type) {
    case 'loggedOut':
      return {
        ...state,
        logEntries: [],
        currentIndex: 0,
        haveMore: false,
      };
    case 'loadedLogs':
      return {
        ...state,
        logEntries: action.entries.slice(0, Math.min(10, action.entries.length)),
        haveMore: action.entries.length > 10,
        loading: false,
      };
    case 'errorLoadingLogs':
      return {
        ...state,
        logEntries: [],
        haveMore: false,
        loading: false,
      };
    case 'loadLogs':
      if (state.loading) return state; // ignore when busy
      return {
        ...state,
        currentIndex: action.index,
        loading: true,
      };
    default:
      return state;
  }
}
