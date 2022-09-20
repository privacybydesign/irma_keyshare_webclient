import React from 'react';
import { withTranslation } from 'react-i18next';
import IrmaAppBar from '../../widgets/irma_app_bar';
import IrmaButton from '../../widgets/irma_button';
import Column from '../../widgets/column';

const EmailSent = (props) => {
  const onBack = () => {
    props.dispatch({ type: 'loggedOut' });
  };

  return (
    <>
      <IrmaAppBar title={props.t('title')} />,
      <Column>
        <p>{props.t('explanation')}</p>
        <IrmaButton theme={'primary'} onClick={onBack}>
          {props.t('back')}
        </IrmaButton>
      </Column>
    </>
  );
};

export default withTranslation('login-email-sent')(EmailSent);
