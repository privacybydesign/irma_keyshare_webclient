import connect from 'react-redux/lib/connect/connect';
import React from 'react';
import Login from './components/login';

const mapStateToProps = state => {
  return {
    loading: state.login.sessionState === 'unknown',
    loggedIn: state.login.sessionState === 'loggedIn',
  };
};

// TODO: Maybe convert into router to improve URL structure.
const App = (props) => {
  if (props.loading) {
    return <p>Loading...</p>; // TODO: Improve
  } else if (props.loggedIn) {
    return <p>Logged in.</p>; // TODO: Make screen
  } else {
    return <Login context={props.context}/>;
  }
};

export default connect(mapStateToProps)(App);
