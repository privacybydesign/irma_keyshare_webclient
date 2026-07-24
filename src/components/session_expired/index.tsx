import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import YiviAppBar from '../../widgets/yivi_app_bar';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import type { AppDispatch } from '../../types';

type Props = { dispatch: AppDispatch } & WithTranslation;

const SessionExpired = (props: Props) => {
  // `resolveError` clears the (now dead) session cookie via /logout and returns
  // the user to the login screen. It tolerates a failing /logout call, which is
  // expected here since the session has already expired server-side.
  const onLogin = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <YiviAppBar title={props.t('header')} />
      <Column>
        <Spacer />
        <p>{props.t('explanation')}</p>
        <YiviButton theme={'primary'} onClick={onLogin}>
          {props.t('login-again')}
        </YiviButton>
      </Column>
    </>
  );
};

export default connect()(withTranslation('session-expired')(SessionExpired));
