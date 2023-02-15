import React from 'react';
import { connect } from 'react-redux';
import Login from './components/login/';
import LoadingSpinner from './widgets/loading_spinner';
import AccountOverview from './components/account_overview';
import RegistrationVerified from './components/registration_verified';
import TokenInvalid from './components/token_invalid';
import ErrorMessage from './components/error_message';

const mapStateToProps = (state) => {
  return {
    loading: ['unknown', 'loggingOut'].includes(state.login.sessionState),
    loggedIn: state.login.sessionState === 'loggedIn',
    registrationVerified: state.login.sessionState === 'showPostRegistration',
    tokenInvalid: state.login.sessionState === 'tokenInvalid',
    errorRaised: state.login.error !== '',
  };
};

// TODO: Maybe convert into router to improve URL structure.
const App = (props) => {
  if (props.errorRaised) {
    return <ErrorMessage />;
  } else if (props.loading) {
    return <LoadingSpinner />;
  } else if (props.loggedIn) {
    return <AccountOverview />;
  } else if (props.registrationVerified) {
    return <RegistrationVerified dispatch={props.dispatch} />;
  } else if (props.tokenInvalid) {
    return <TokenInvalid dispatch={props.dispatch} />;
  } else {
    return <Login />;
  }
};

export default connect(mapStateToProps)(App);
