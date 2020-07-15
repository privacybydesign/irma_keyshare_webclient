import React from 'react';
import { connect } from 'react-redux';
import Login from './components/login/';
import LoadingSpinner from './helpers/loading_spinner';
import AccountOverview from './components/account-overview';

const mapStateToProps = state => {
  return {
    loading: state.login.sessionState === 'unknown',
    loggedIn: state.login.sessionState === 'loggedIn',
  };
};

// TODO: Maybe convert into router to improve URL structure.
const App = (props) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  } else if (props.loggedIn) {
    return <AccountOverview/>;
  } else {
    return <Login/>;
  }
};

export default connect(mapStateToProps)(App);
