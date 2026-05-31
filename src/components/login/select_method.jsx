import React from 'react';
import { withTranslation } from 'react-i18next';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import styles from './select_method.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import { baseLanguage } from '../../i18n';

// The yivi-web-form section must keep the same DOM node forever — the
// underlying yivi-frontend widget writes its QR code / status messages into
// it imperatively and would lose all state on a re-render. Isolating that
// node in its own component with `shouldComponentUpdate => false` lets the
// rest of SelectMethod (intro text, login-method labels, email form) react
// to language changes normally.
class YiviWebFormMount extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <section id="yivi-web-form" />;
  }
}

class SelectMethod extends React.Component {
  componentDidMount() {
    this._yiviWeb = YiviFrontend.newWeb({
      element: '#yivi-web-form',
      language: baseLanguage(this.props.i18n),
      session: this.props.yiviSession,
    });
    this._yiviWeb
      .start()
      .then(() => {
        // Delay dispatch to make Yivi success animation visible.
        setTimeout(() => {
          this.props.dispatch({ type: 'verifySession' });
        }, 1000);
      })
      .catch((err) => {
        if (err !== 'Aborted')
          this.props.dispatch({ type: 'raiseError', errorMessage: `Error while logging in with Yivi: ${err}` });
      });
  }

  componentWillUnmount() {
    if (this._yiviWeb) {
      this._yiviWeb.abort();
    }
  }

  handleEmailLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('input-email');
    this.props.dispatch({ type: 'startEmailLogin', email: emailInput.value });
  }

  renderLoginMethods() {
    return (
      <>
        <p>
          <b>{this.props.t('login-method-yivi-title')}</b>
          <br />
          {this.props.t('login-method-yivi-description')}
        </p>
        <Spacer size={'small'} />
        <YiviWebFormMount />
        <Spacer />
        <p>
          <b>{this.props.t('login-method-email-title')}</b>
          <br />
          {this.props.t('login-method-email-description')}
        </p>
        <Spacer size={'small'} />
        {this.renderEmailLogin()}
      </>
    );
  }

  renderEmailLogin() {
    return (
      <form id={'login-form-email'} className={styles.inputGroup} onSubmit={(e) => this.handleEmailLogin(e)}>
        <input
          type={'email'}
          id={'input-email'}
          className={styles.groupEmail}
          placeholder={this.props.t('email-address')}
          required
          autoFocus
        />
        <YiviButton theme={'primary'} className={styles.groupButton} type={'submit'} id={'sign-in-button-email'}>
          {this.props.t('email-link')}
        </YiviButton>
      </form>
    );
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.props.t('title')} />
        <Column>
          <Spacer />
          <p>{this.props.t('intro-par1')}</p>
          <p>{this.props.t('intro-par2')}</p>

          <p>{this.props.t('login-methods')}</p>
          <Spacer size={'small'} />
          {this.renderLoginMethods()}
        </Column>
      </>
    );
  }
}

export default withTranslation('login-select-method')(SelectMethod);
