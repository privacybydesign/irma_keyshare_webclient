import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Column from '../../widgets/column';
import Spacer from '../../widgets/spacer';

const mapStateToProps = (state) => {
  return {
    explanation: state.login.explanation,
    details: state.login.details,
  };
};

// TODO: Maybe convert WarninMessage and ErrorMessage into a single component.
const WarningMessage = (props) => {
  const onReturn = () => {
    props.dispatch({ type: 'resolveError' });
  };

  return (
    <>
      <YiviAppBar title={props.t('header')} />
      <Column>
        <Spacer />
        <p>{props.t(props.explanation)}</p>
        <p>{props.t(props.details)}</p>
        <YiviButton theme={'primary'} onClick={onReturn}>
          {props.t('return')}
        </YiviButton>
      </Column>
    </>
  );
};
export default connect(mapStateToProps)(withTranslation('warning-message')(WarningMessage));
