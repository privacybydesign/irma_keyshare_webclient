import React from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

import styles from './index.module.scss';
import YiviAppBar from '../../widgets/yivi_app_bar';
import SuccessIcon from '../../widgets/success_icon';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';
import type { AppDispatch } from '../../types';

interface OwnProps {
  dispatch: AppDispatch;
}

type Props = OwnProps & WithTranslation;

class RegistrationVerified extends React.Component<Props> {
  continueToMyYivi(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    this.props.dispatch({ type: 'loggedIn' });
  }

  userAgent(): 'Android' | 'iOS' | 'Desktop' {
    if (/Android/i.test(window.navigator.userAgent)) {
      return 'Android';
    }
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return 'iOS';
    if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) return 'iOS';
    return 'Desktop';
  }

  isMobile() {
    const agent = this.userAgent();
    return agent === 'iOS' || agent === 'Android';
  }

  launchReturnUrl() {
    if (this.userAgent() === 'Android') {
      const intent = `Intent;package=org.irmacard.cardemu;scheme=irma;l.timestamp=${Date.now()}`;
      window.location.href = `intent://#${intent};end`;
    } else {
      window.location.href = 'https://irma.app/-/';
    }
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.props.t('title')} />
        <Column className={styles.center}>
          <SuccessIcon />
          <h2>{this.props.t('success')}</h2>
          <p>{this.props.t('explanation')}</p>
          <p>
            {this.isMobile() ? (
              <YiviButton theme={'primary'} onClick={() => this.launchReturnUrl()}>
                {this.props.t('return-to-yivi')}
              </YiviButton>
            ) : (
              this.props.t('app-is-ready')
            )}
          </p>
          <p>
            <a href={'#'} onClick={(e) => this.continueToMyYivi(e)}>
              {this.props.t('continue-to-myyivi')}
            </a>
          </p>
        </Column>
      </>
    );
  }
}

export default withTranslation('registration-verified')(RegistrationVerified);
