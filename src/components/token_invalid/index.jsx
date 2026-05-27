import React from 'react';
import { Trans, withTranslation } from 'react-i18next';

import YiviAppBar from '../../widgets/yivi_app_bar';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';

const TokenInvalid = (props) => {
  const onRetry = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <YiviAppBar title={props.t('header')} />
      <Column>
        <Spacer />
        <p>{props.t('explanation')}</p>
        <p>{props.t('explanation-details')}</p>
        <ul>
          <li>
            <Trans t={props.t} i18nKey="point-1" components={[<a href={undefined} onClick={onRetry} key={0} />]} />
          </li>
          <li>{props.t('point-2')}</li>
          <li>{props.t('point-3')}</li>
          <li>{props.t('point-4')}</li>
        </ul>
        <YiviButton theme={'primary'} onClick={onRetry}>
          {props.t('retry')}
        </YiviButton>
      </Column>
    </>
  );
};
export default withTranslation('token-invalid')(TokenInvalid);
