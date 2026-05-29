import { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import LoadingSpinner from './widgets/loading_spinner';

// Route-level code-splitting. Each top-level "screen" is only fetched when
// the corresponding session state activates, dropping the initial bundle
// well below Vite's 500 kB warning. LoadingSpinner is kept static so the
// Suspense fallback (and the explicit `props.loading` path) can render
// without waiting on another chunk.
const Login = lazy(() => import('./components/login/'));
const AccountOverview = lazy(() => import('./components/account_overview'));
const RegistrationVerified = lazy(() => import('./components/registration_verified'));
const TokenInvalid = lazy(() => import('./components/token_invalid'));
const WarningMessage = lazy(() => import('./components/warning_message'));
const ErrorMessage = lazy(() => import('./components/error_message'));

const mapStateToProps = (state) => {
  return {
    loading: ['unknown', 'loggingOut'].includes(state.login.sessionState),
    loggedIn: state.login.sessionState === 'loggedIn',
    registrationVerified: state.login.sessionState === 'showPostRegistration',
    tokenInvalid: state.login.sessionState === 'tokenInvalid',
    warningRaised: state.login.sessionState === 'warningRaised',
    errorRaised: state.login.error !== '',
  };
};

function pickScreen(props) {
  if (props.errorRaised) return <ErrorMessage />;
  if (props.loading) return <LoadingSpinner />;
  if (props.loggedIn) return <AccountOverview />;
  if (props.registrationVerified) return <RegistrationVerified dispatch={props.dispatch} />;
  if (props.tokenInvalid) return <TokenInvalid dispatch={props.dispatch} />;
  if (props.warningRaised) return <WarningMessage />;
  return <Login />;
}

// TODO: Maybe convert into router to improve URL structure.
const App = (props) => <Suspense fallback={<LoadingSpinner />}>{pickScreen(props)}</Suspense>;

export default connect(mapStateToProps)(App);
