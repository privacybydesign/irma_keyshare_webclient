import React from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withTranslation} from 'react-i18next';
import IrmaAppBar from '../../helpers/irma_app_bar';
import SelectMethod from './select_method';
import SelectCandidate from './select_candidate';
import LoadingSpinner from '../../helpers/loading_spinner';

const mapStateToProps = state => {
  return {
    ...state.login,
  };
};

const Login = (props) => {
  const renderState = () => {
    switch (props.sessionState) {
      case 'loggedOut':
        return <SelectMethod dispatch={props.dispatch} irmaSession={props.irmaSession}/>
      case 'selectCandidate':
        return <SelectCandidate dispatch={props.dispatch} candidates={props.candidates} token={props.token}/>
      default:
        // TODO: Other pages still have to be implemented.
        return <LoadingSpinner/>
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
