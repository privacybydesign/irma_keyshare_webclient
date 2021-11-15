import React from 'react';
import connect from 'react-redux/lib/connect/connect';
import SelectMethod from './select_method';
import SelectCandidate from './select_candidate';
import LoadingSpinner from '../../helpers/loading_spinner';
import EmailSent from './email_sent';

const mapStateToProps = state => {
  return {
    ...state.login,
  };
};

const Login = (props) => {
  switch (props.sessionState) {
    case 'loggedOut':
      return <SelectMethod dispatch={props.dispatch} irmaSession={props.irmaSession}/>
    case 'selectCandidate':
      return <SelectCandidate dispatch={props.dispatch} candidates={props.candidates} token={props.token}/>
    case 'emailSent':
      return <EmailSent/>
    default:
      // TODO: Other pages still have to be implemented.
      return <LoadingSpinner/>
  }
}

export default connect(mapStateToProps)(Login);
