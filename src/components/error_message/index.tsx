import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import YiviAppBar from '../../widgets/yivi_app_bar';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import type { AppDispatch, RootState } from '../../types';

const mapStateToProps = (state: RootState) => ({
  error: state.login.error,
});

type StateProps = ReturnType<typeof mapStateToProps>;
type Props = StateProps & { dispatch: AppDispatch } & WithTranslation;

const ErrorMessage = (props: Props) => {
  const onRetry = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <YiviAppBar title={props.t('header')} />
      <Column>
        <Spacer />
        <p>{props.t('explanation')}</p>
        <p>
          {props.t('error-details')}
          <br />
          {/* props.error is a stable i18n key (ErrorMessageKey), never a raw
              exception string — the underlying detail is logged to the console
              only, so nothing sensitive is rendered here. */}
          <i>{props.t(props.error)}</i>
        </p>
        <YiviButton theme={'primary'} onClick={onRetry}>
          {props.t('retry')}
        </YiviButton>
      </Column>
    </>
  );
};

export default connect(mapStateToProps)(withTranslation('error-message')(ErrorMessage));
