import { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import LoadingSpinner from './widgets/loading_spinner';
import type { AppDispatch, RootState } from './types';

const Login = lazy(() => import('./components/login/'));
const AccountOverview = lazy(() => import('./components/account_overview'));
const RegistrationVerified = lazy(() => import('./components/registration_verified'));
const TokenInvalid = lazy(() => import('./components/token_invalid'));
const WarningMessage = lazy(() => import('./components/warning_message'));
const ErrorMessage = lazy(() => import('./components/error_message'));

const mapStateToProps = (state: RootState) => ({
  loading: ['unknown', 'loggingOut'].includes(state.login.sessionState),
  loggedIn: state.login.sessionState === 'loggedIn',
  registrationVerified: state.login.sessionState === 'showPostRegistration',
  tokenInvalid: state.login.sessionState === 'tokenInvalid',
  warningRaised: state.login.sessionState === 'warningRaised',
  errorRaised: state.login.error !== '',
});

type StateProps = ReturnType<typeof mapStateToProps>;
type Props = StateProps & { dispatch: AppDispatch };

function pickScreen(props: Props) {
  if (props.errorRaised) return <ErrorMessage />;
  if (props.loading) return <LoadingSpinner />;
  if (props.loggedIn) return <AccountOverview />;
  if (props.registrationVerified) return <RegistrationVerified dispatch={props.dispatch} />;
  if (props.tokenInvalid) return <TokenInvalid dispatch={props.dispatch} />;
  if (props.warningRaised) return <WarningMessage />;
  return <Login />;
}

const App = (props: Props) => <Suspense fallback={<LoadingSpinner />}>{pickScreen(props)}</Suspense>;

export default connect(mapStateToProps)(App);
