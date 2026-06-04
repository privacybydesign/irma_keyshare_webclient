import { connect } from 'react-redux';
import SelectMethod from './select_method';
import SelectCandidate from './select_candidate';
import LoadingSpinner from '../../widgets/loading_spinner';
import EmailSent from './email_sent';
import type { AppDispatch, LoginState, RootState } from '../../types';

const mapStateToProps = (state: RootState) => ({ ...state.login });

type StateProps = LoginState;
type Props = StateProps & { dispatch: AppDispatch };

const Login = (props: Props) => {
  switch (props.sessionState) {
    case 'loggedOut':
      return <SelectMethod dispatch={props.dispatch} yiviSession={props.yiviSession!} />;
    case 'selectCandidate':
      return <SelectCandidate dispatch={props.dispatch} candidates={props.candidates} token={props.token!} />;
    case 'emailSent':
      return <EmailSent dispatch={props.dispatch} />;
    default:
      return <LoadingSpinner />;
  }
};

export default connect(mapStateToProps)(Login);
