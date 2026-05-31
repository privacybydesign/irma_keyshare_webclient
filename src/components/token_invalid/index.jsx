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
            <Trans
              t={props.t}
              i18nKey="point-1"
              components={[
                // Inline button styled as a link — the prior `<a href={undefined}>`
                // wasn't keyboard-focusable and broke WCAG focus order.
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
                >
                  {/* Trans fills in the link text from the translation. */}
                </button>,
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
