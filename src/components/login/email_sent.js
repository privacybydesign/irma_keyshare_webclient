import React from 'react';
import {withTranslation} from 'react-i18next';
import IrmaAppBar from '../../helpers/irma_app_bar';
import Column from '../../helpers/column';

const EmailSent = (props) => {
  return (
    <>
      <IrmaAppBar title={props.t('title')}/>,
      <Column>
        <p>
          {props.t('explanation')}
        </p>
      </Column>
    </>
  );
}

export default withTranslation('login-email-sent')(EmailSent);
