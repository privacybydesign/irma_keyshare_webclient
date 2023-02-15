import React from 'react';
import { Trans, withTranslation } from 'react-i18next';

import './index.scss';
import IrmaAppBar from '../../widgets/irma_app_bar';
import Column from '../../widgets/column';
import IrmaButton from '../../widgets/irma_button';

const TokenInvalid = (props) => {
  const onRetry = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <IrmaAppBar title={props.t('header')} />
      <Column>
        <p>{props.t('explanation')}</p>
        <p>{props.t('explanation-details')}</p>
        <ul>
          <li>
            <Trans
              t={props.t}
              i18nKey="point-1"
              // eslint-disable-next-line
              components={[<a href={undefined}
              onClick={onRetry} />]}
            />
          </li>
          <li>{props.t('point-2')}</li>
          <li>{props.t('point-3')}</li>
          <li>{props.t('point-4')}</li>
        </ul>
        <IrmaButton theme={'primary'} onClick={onRetry}>
          {props.t('retry')}
        </IrmaButton>
      </Column>
    </>
  );
};
export default withTranslation('token-invalid')(TokenInvalid);
