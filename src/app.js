import React from 'react';
import { connect } from 'react-redux';
import Login from './components/login/';
import LoadingSpinner from './helpers/loading_spinner';
import AccountOverview from './components/account_overview';
import RegistrationVerified from './components/registration_verified';
import ErrorMessage from './components/error_message';

const mapStateToProps = state => {
  return {
    loading: state.login.sessionState === 'unknown',
    loggedIn: state.login.sessionState === 'loggedIn',
    registrationVerified: state.login.sessionState === 'showPostRegistration',
    errorRaised: state.login.error !== '',
  };
};

// TODO: Maybe convert into router to improve URL structure.
const App = (props) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  } else if (props.errorRaised) {
    return <ErrorMessage/>;
  } else if (props.loggedIn) {
    return <AccountOverview/>;
  } else if (props.registrationVerified) {
    return <RegistrationVerified dispatch={props.dispatch}/>;
  } else {
    return <Login/>;
  }
};

export default connect(mapStateToProps)(App);
