import React from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withTranslation} from 'react-i18next';
import IrmaAppBar from '../../helpers/irma_app_bar';
import SelectLoginMethod from './select_login_method';

const mapStateToProps = state => {
  return {
    sessionState: state.login.sessionState,
    irmaSession: state.login.irmaSession,
  };
};

const Login = (props) => {
  const renderState = () => {
    switch (props.sessionState) {
      case 'loggedOut':
        return <SelectLoginMethod context={props.context} irmaSession={props.irmaSession}/>
      default:
        // TODO: Other pages still have to be implemented.
        return <div className={'column'}>{props.sessionState}</div>
    }
  }

  return (
    <div>
      <IrmaAppBar title={props.t('title')}/>
      {renderState()}
    </div>
  );
}

export default connect(mapStateToProps)(withTranslation('login')(Login));
