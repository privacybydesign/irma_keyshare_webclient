import React from 'react';
import { withTranslation } from 'react-i18next';
import YiviFrontend from '@privacybydesign/yivi-frontend';
import styles from './select_method.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';

class SelectMethod extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  componentDidMount() {
    this._yiviWeb = YiviFrontend.newWeb({
      element: '#yivi-web-form',
      language: this.props.i18n.language,
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

  shouldComponentUpdate(nextProps, nextState) {
    // Never update this element, since YiviFrontend handles state changes itself.
    // When updates need to be enabled, make sure the yivi-web-form is excluded from re-render.
    return false;
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
      <div className={styles.wrapper}>
        {this.renderYiviLogin()}
        <p>{this.t('or')}</p>
        {this.renderEmailLogin()}
      </div>
    );
  }

  renderYiviLogin() {
    const prevElement = document.getElementById('yivi-web-form');
    if (prevElement) {
      return React.createElement('section', { id: 'yivi-web-form', innerHTML: prevElement.innerHTML });
    } else {
      return <section id={'yivi-web-form'} />;
    }
  }

  renderEmailLogin() {
    return (
      <form id={'login-form-email'} className={styles.inputGroup} onSubmit={(e) => this.handleEmailLogin(e)}>
        <input
          type={'email'}
          id={'input-email'}
          className={styles.groupEmail}
          placeholder={this.t('email-address')}
          required
          autoFocus
        />
        <YiviButton theme={'primary'} className={styles.groupButton} type={'submit'} id={'sign-in-button-email'}>
          {this.t('email-link')}
        </YiviButton>
      </form>
    );
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.t('title')} />
        <Column>
          <Spacer />
          <p>{this.t('intro-par1')}</p>
          <p>{this.t('intro-par2')}</p>

          <p>{this.t('login-methods')}</p>
          <ul>
            <li>{this.t('login-method-yivi')}</li>
            <li>{this.t('login-method-email')}</li>
          </ul>
          {this.renderLoginMethods()}
        </Column>
      </>
    );
  }
}

export default withTranslation('login-select-method')(SelectMethod);
