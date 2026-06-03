import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Column from '../../widgets/column';
import Spacer from '../../widgets/spacer';
import type { AppDispatch, RootState } from '../../types';

const mapStateToProps = (state: RootState) => ({
  explanation: state.login.explanation,
  details: state.login.details,
});

type StateProps = ReturnType<typeof mapStateToProps>;
type Props = StateProps & { dispatch: AppDispatch } & WithTranslation;

const WarningMessage = (props: Props) => {
  const onReturn = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <YiviAppBar title={props.t('header')} />
      <Column>
        <Spacer />
        <p>{props.t(props.explanation ?? '')}</p>
        <p>{props.t(props.details ?? '')}</p>
        <YiviButton theme={'primary'} onClick={onReturn}>
          {props.t('return')}
        </YiviButton>
      </Column>
    </>
  );
};

export default connect(mapStateToProps)(withTranslation('warning-message')(WarningMessage));
