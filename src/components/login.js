import React from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withTranslation} from 'react-i18next';
import IrmaAppBar from '../helpers/irma_app_bar';
import irmaFrontend from '@privacybydesign/irma-frontend';

import './login.scss';
import '../templates/column.scss';

const mapStateToProps = state => {
  return {
    sessionState: state.login.sessionState,
    irmaSession: state.login.irmaSession,
  };
};

class Login extends React.Component {
  t = this.props.t;

  componentDidMount() {
    this.initIrma();
  }

  componentDidUpdate() {
    this.initIrma();
  }

  initIrma() {
    let irmaElement = document.querySelector('#irma-web-form');
    if (irmaElement != null && !irmaElement.hasChildNodes()) {
      irmaFrontend.newWeb({
        element: '#irma-web-form',
        language: this.props.i18n.language,
        translations: {
          header: `${this.t('login-using')} <i class="irma-web-logo">IRMA</i>`,
        },

        session: this.props.irmaSession,
      })
      .start()
      .then(() => {
        // Delay dispatch to make IRMA success animation visible.
        setTimeout(() => {
          this.props.dispatch({type: 'verifySession'});
        }, 1000);
      });
    }
  }

  handleEmailLogin(event) {
    event.preventDefault();
    let emailInput = document.getElementById('input-email');
    console.log();
    this.props.dispatch({type: 'startEmailLogin', email: emailInput.value});
  }

  renderLoginMethods() {
    return (
      <div className={'form-sign-in'}>
        {this.renderIrmaLogin()}
        <p>{this.t('or')}</p>
        {this.renderEmailLogin()}
      </div>
    )
  };

  renderIrmaLogin() {
    return (
      <section id={'irma-web-form'}/>
    );
  }

  renderEmailLogin() {
    return (
      <form id={'login-form-email'}
            className={'input-group'}
            onSubmit={(e) => this.handleEmailLogin(e)}
      >
        <input type={'email'} id={'input-email'} placeholder={this.t('email-address')}
               required autoFocus
        />
        <span className={'input-group-btn'}>
          <button className={'btn-primary'} type={'submit'} id={'sign-in-button-email'}>
            {this.t('email-link')}
          </button>
        </span>
      </form>
    );
  }

  renderLogin() {
    return (
      <div className={'column'}>
        <p>{this.t('intro-par1')}</p>
        <p>{this.t('intro-par2')}</p>

        <p>{this.t('login-methods')}</p>
        <ul>
          <li key={'login-method-irma'}>{this.t('login-method-irma')}</li>
          <li key={'login-method-email'}>{this.t('login-method-email')}</li>
        </ul>
        {this.renderLoginMethods()}
      </div>
    );
  }

  renderState() {
    switch (this.props.sessionState) {
      case 'loggedOut':
        return this.renderLogin();
      default:
        // TODO: Other pages still have to be implemented.
        return <div className={'column'}>{this.props.sessionState}</div>
    }
  }

  render() {
    return (
      <div>
        <IrmaAppBar title={this.t('title')}/>
        {this.renderState()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('login')(Login));
