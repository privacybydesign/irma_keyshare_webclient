import React from 'react';
import { withTranslation } from 'react-i18next';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import styles from './select_method.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';

// yivi-frontend rejects with this string on user cancel (not an error).
const YIVI_CANCELLED_SENTINEL = 'Aborted';

// yivi-frontend writes into this section via the DOM directly. Never re-render
// it so React doesn't clobber the imperatively-appended QR canvas.
class YiviWebFormMount extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <section id="yivi-web-form" />;
  }
}

class SelectMethod extends React.Component {
  _emailInputRef = React.createRef();

  componentDidMount() {
    const widget = YiviFrontend.newWeb({
      element: '#yivi-web-form',
      language: this.props.i18n.language,
      session: this.props.yiviSession,
    });
    this._yiviWeb = widget;
    widget
      .start()
      .then(() => {
        if (widget !== this._yiviWeb) return;
        // Delay to let the Yivi success animation play; cancel on unmount.
        this._verifyTimer = setTimeout(() => {
          this._verifyTimer = undefined;
          this.props.dispatch({ type: 'verifySession' });
        }, 1000);
      })
      .catch((err) => {
        if (widget !== this._yiviWeb) return;
        if (err !== YIVI_CANCELLED_SENTINEL)
          this.props.dispatch({ type: 'raiseError', errorMessage: `Error while logging in with Yivi: ${err}` });
      });
  }

  componentWillUnmount() {
    if (this._verifyTimer) {
      clearTimeout(this._verifyTimer);
      this._verifyTimer = undefined;
    }
    if (this._yiviWeb) {
      this._yiviWeb.abort();
      this._yiviWeb = undefined;
    }
  }

  handleEmailLogin(e) {
    e.preventDefault();
    this.props.dispatch({ type: 'startEmailLogin', email: this._emailInputRef.current.value });
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
          ref={this._emailInputRef}
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
        <YiviAppBar title={this.props.t('title')} lockLanguageSwitcher />
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
