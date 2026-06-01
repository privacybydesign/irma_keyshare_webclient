import React from 'react';
import { withTranslation } from 'react-i18next';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import styles from './select_method.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import { baseLanguage } from '../../i18n';

// The yivi-web-form section must keep the same DOM node *and* its
// imperatively-appended children (QR canvas, status messages) forever —
// yivi-frontend writes into it via the DOM, outside React's tracking.
//
// React's reconciler already preserves the section's *element identity*
// across re-renders (same type, same id, no React-tracked children), so
// `shouldComponentUpdate => false` is not load-bearing for that on its
// own — the surrounding select_method.test.jsx pins node identity end-
// to-end. The guard's actual job is defense-in-depth: if a future edit
// to the JSX below accidentally adds children to `<section>` (e.g. a
// translated placeholder caption), React would diff those new JSX
// children against the DOM, conclude yivi's imperatively-appended
// canvas is "extra", and rip it out mid-session. `shouldComponentUpdate
// => false` short-circuits render() entirely so no such JSX edit can
// reach reconciliation without also touching this guard, surfacing the
// regression at code-review time instead of runtime.
class YiviWebFormMount extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <section id="yivi-web-form" />;
  }
}

class SelectMethod extends React.Component {
  // Hold the email input via a React ref instead of fishing it back out
  // with `document.getElementById('input-email')`. The id is still useful
  // (it labels the form's submit button for any external automation and
  // matches the autofill convention) but reading via getElementById makes
  // the id load-bearing for correctness — rename it or accidentally mount
  // a second SelectMethod and the submit silently picks up the wrong
  // node. The ref is owned by this instance and is therefore unambiguous.
  _emailInputRef = React.createRef();

  componentDidMount() {
    // React 19 StrictMode runs componentDidMount → componentWillUnmount →
    // componentDidMount on the *same* instance in development to surface
    // unsafe lifecycle patterns. A simple `_unmounted` flag isn't enough:
    // when mount #2 runs it resets the flag, and a still-pending `.then`
    // from mount #1's `start()` would then incorrectly pass the guard.
    // Capture the widget reference in closure scope so each mount's
    // callbacks compare against their own widget; if `this._yiviWeb` no
    // longer matches, the resolution belongs to a stale mount.
    const widget = YiviFrontend.newWeb({
      element: '#yivi-web-form',
      language: baseLanguage(this.props.i18n),
      session: this.props.yiviSession,
    });
    this._yiviWeb = widget;
    widget
      .start()
      .then(() => {
        if (widget !== this._yiviWeb) return;
        // Delay dispatch to make Yivi success animation visible. Stash the
        // timer id so componentWillUnmount can cancel it — otherwise the
        // dispatch fires on an unmounted tree if the user navigates away
        // in this 1s window.
        this._verifyTimer = setTimeout(() => {
          this._verifyTimer = undefined;
          this.props.dispatch({ type: 'verifySession' });
        }, 1000);
      })
      .catch((err) => {
        if (widget !== this._yiviWeb) return;
        if (err !== 'Aborted')
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
        {/* The yivi-frontend widget reads its `language` argument once at
            mount and never refreshes its labels — switching EN↔NL while
            the QR is on screen would leave the widget's own strings in
            the original language. Lock the switcher for the duration of
            SelectMethod so users can't end up in that mismatched state;
            the rest of the app re-renders normally on language change. */}
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
