import React from 'react';
import { withTranslation } from 'react-i18next';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Column from '../../widgets/column';
import Spacer from '../../widgets/spacer';
import styles from './email_sent.module.scss';

const EmailSent = (props) => {
  const onBack = () => {
    props.dispatch({ type: 'loggedOut' });
  };

  return (
    <>
      <YiviAppBar title={props.t('title')} />
      <Column className={styles.center}>
        <Spacer />
        <p>{props.t('explanation')}</p>
        <Spacer />
        <YiviButton theme={'primary'} onClick={onBack}>
          {props.t('back')}
        </YiviButton>
      </Column>
    </>
  );
};

export default withTranslation('login-email-sent')(EmailSent);
