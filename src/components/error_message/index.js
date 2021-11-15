import React from 'react';
import {withTranslation} from 'react-i18next';

import IrmaAppBar from '../../helpers/irma_app_bar';
import Column from '../../helpers/column';
import IrmaButton from '../../helpers/irma_button';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    error: state.login.error,
  };
};


const ErrorMessage = (props) => {
  const onRetry = () => {
    props.dispatch({type: 'resolveError'});
    props.dispatch({type: 'loggedOut'});
  }

  return (
    <>
      <IrmaAppBar title={props.t('header')}/>,
      <Column>
        <p>
          {props.t('explanation')}
        </p>
        <p>
          {props.t('error-details')}
          <br/>
          <i>{props.error.toString()}</i>
        </p>
        <IrmaButton theme={'primary'} onClick={onRetry}>
          {props.t('retry')}
        </IrmaButton>
      </Column>
    </>
  );
}

export default connect(mapStateToProps)(withTranslation('error-message')(ErrorMessage));
