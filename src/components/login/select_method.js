import React from 'react';
import {withTranslation} from 'react-i18next';
import irmaFrontend from '@privacybydesign/irma-frontend';

import './select_method.scss';

class SelectMethod extends React.Component {
  t = this.props.t;

  componentDidMount() {
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

  shouldComponentUpdate(nextProps, nextState) {
    // Never update this element, since IrmaFrontend handles state changes itself.
    // When updates need to be enabled, make sure the irma-web-form is excluded from re-render.
    return false;
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
    let prevElement = document.getElementById('irma-web-form');
    if (prevElement) {
      return React.createElement('section', {id: 'irma-web-form', innerHTML: prevElement.innerHTML})
    } else {
      return (
        <section id={'irma-web-form'}/>
      );
    }
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
          <button className={'btn-email'} type={'submit'} id={'sign-in-button-email'}>
            {this.t('email-link')}
          </button>
        </span>
      </form>
    );
  }

  render() {
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
}

export default withTranslation('login-select-method')(SelectMethod);
