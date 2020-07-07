import React from 'react';
import {withTranslation} from 'react-i18next';

import './registration_verified.scss';
import IrmaAppBar from '../../helpers/irma_app_bar';
import SuccessIcon from '../../helpers/success_icon';

const RegistrationVerified = (props) => {
  function continueToMyIrma(event) {
    event.preventDefault();
    window.location.hash = '';
    props.dispatch({type: 'loggedIn'});
  }

  return (
    <>
      <IrmaAppBar title={props.t('title')}/>,
      <div className={'column-center'}>
        <SuccessIcon className={'success-icon'}/>
        <h2>
          {props.t('success')}
        </h2>
        <p>
          {props.t('explanation')}
        </p>
        <p>
          <a className={'return-button'} href={'https://irma.app/-/'}>
            <img src={process.env.PUBLIC_URL + '/assets/irma-logo.svg'}
                 className={'irma-logo'}
                 alt={'irma-logo'}
            />
            <span>
              {props.t('return-to-irma')}
            </span>
          </a>
        </p>
        <p>
          {props.t('app-is-ready')}
        </p>
        <p><a href={'/#'} onClick={continueToMyIrma}>
          {props.t('continue-to-myirma')}
        </a></p>
      </div>
    </>
  );
}

export default withTranslation('login-registration-verified')(RegistrationVerified);
