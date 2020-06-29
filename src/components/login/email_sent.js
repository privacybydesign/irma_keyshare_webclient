import React from 'react';
import {withTranslation} from 'react-i18next';

import '../../templates/column.scss';
import IrmaAppBar from '../../helpers/irma_app_bar';

const EmailSent = (props) => {
  return (
    <>
      <IrmaAppBar title={props.t('title')}/>,
      <div className={'column'}>
        <p>
          {props.t('explanation')}
        </p>
      </div>
    </>
  );
}

export default withTranslation('login-email-sent')(EmailSent);
