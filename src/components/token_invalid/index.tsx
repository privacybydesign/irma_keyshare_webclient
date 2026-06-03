import { Trans, withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

import YiviAppBar from '../../widgets/yivi_app_bar';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import type { AppDispatch } from '../../types';

interface OwnProps {
  dispatch: AppDispatch;
}

type Props = OwnProps & WithTranslation;

const TokenInvalid = (props: Props) => {
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
            <Trans
              t={props.t}
              i18nKey="point-1"
              components={[
                <button
                  key="retry"
                  type="button"
                  onClick={onRetry}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'inherit',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    font: 'inherit',
                  }}
                />,
              ]}
            />
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
