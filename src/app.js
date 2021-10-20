import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

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
class App extends React.Component {
  componentDidMount() {
    document.documentElement.setAttribute('lang', this.props.i18n.language);
    document.title = this.props.t('title');
  }

  render() {
    if (this.props.loading) {
      return <LoadingSpinner/>;
    } else if (this.props.errorRaised) {
      return <ErrorMessage/>;
    } else if (this.props.loggedIn) {
      return <AccountOverview/>;
    } else if (this.props.registrationVerified) {
      return <RegistrationVerified dispatch={this.props.dispatch}/>;
    } else {
      return <Login/>;
    }
  }
}

export default connect(mapStateToProps)(withTranslation('app')(App));
