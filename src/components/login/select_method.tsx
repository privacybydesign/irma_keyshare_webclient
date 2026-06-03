import React from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import type { YiviWidget } from '@privacybydesign/yivi-frontend';
import styles from './select_method.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import type { AppDispatch, YiviSessionConfig } from '../../types';

const YIVI_CANCELLED_SENTINEL = 'Aborted';

class YiviWebFormMount extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <section id="yivi-web-form" />;
  }
}

interface OwnProps {
  dispatch: AppDispatch;
  yiviSession: YiviSessionConfig;
}

type Props = OwnProps & WithTranslation;

class SelectMethod extends React.Component<Props> {
  private _emailInputRef = React.createRef<HTMLInputElement>();
  private _yiviWeb?: YiviWidget;
  private _verifyTimer?: ReturnType<typeof setTimeout>;

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
        this._verifyTimer = setTimeout(() => {
          this._verifyTimer = undefined;
          this.props.dispatch({ type: 'verifySession' });
        }, 1000);
      })
      .catch((err: unknown) => {
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

  handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = this._emailInputRef.current?.value ?? '';
    this.props.dispatch({ type: 'startEmailLogin', email });
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
