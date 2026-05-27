import React from 'react';
import { withTranslation } from 'react-i18next';

import YiviAppBar from '../../widgets/yivi_app_bar';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import { connect } from 'react-redux';
import Spacer from '../../widgets/spacer';

const mapStateToProps = (state) => {
  return {
    error: state.login.error,
  };
};

const ErrorMessage = (props) => {
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
          <i>{props.error.toString()}</i>
        </p>
        <YiviButton theme={'primary'} onClick={onRetry}>
          {props.t('retry')}
        </YiviButton>
      </Column>
    </>
  );
};

export default connect(mapStateToProps)(withTranslation('error-message')(ErrorMessage));
