import React from 'react';
import connect from 'react-redux/lib/connect/connect';
import {useTranslation} from 'react-i18next';
import IrmaAppBar from '../helpers/irma_app_bar';

import '../templates/column.css';

const mapStateToProps = state => {
  return {
    sessionState: state.login.sessionState,
  };
};

const Login = () => {
  const { t } = useTranslation(['login']);

  const renderLoginMethods = () => {
    return (
      <div className={'container'} style={{textAlign: 'center'}}>
        <h2>{t('login-using')}</h2>
        <div>IRMA (TODO)</div>
        <div>{t('or')}</div>
        <div>Email (TODO)</div>
      </div>
    )
  };

  return (
    <div>
      <IrmaAppBar title={t('title')}/>
      <div className={'column'}>
        <p>{t('intro-par1')}</p>
        <p>{t('intro-par2')}</p>

        <p>{t('login-methods')}</p>
        <ul>
          <li key={'login-method-irma'}>{t('login-method-irma')}</li>
          <li key={'login-method-email'}>{t('login-method-email')}</li>
        </ul>
        { renderLoginMethods() }
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(Login);
