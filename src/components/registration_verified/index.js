import React from 'react';
import { withTranslation } from 'react-i18next';

import styles from './index.module.scss';
import YiviAppBar from '../../widgets/yivi_app_bar';
import SuccessIcon from '../../widgets/success_icon';
import Column from '../../widgets/column';
import YiviButton from '../../widgets/yivi_button';

class RegistrationVerified extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  continueToMyYivi(e) {
    e.preventDefault();
    this.props.dispatch({ type: 'loggedIn' });
  }

  userAgent() {
    // IE11 doesn't have window.navigator, test differently
    // https://stackoverflow.com/questions/21825157/internet-explorer-11-detection
    if (!!window.MSInputMethodContext && !!document.documentMode) return 'Desktop';

    if (/Android/i.test(window.navigator.userAgent)) {
      return 'Android';
    }

    // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) return 'iOS';

    // https://stackoverflow.com/questions/57776001/how-to-detect-ipad-pro-as-ipad-using-javascript
    if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) return 'iOS';

    // Neither Android nor iOS, assuming desktop
    return 'Desktop';
  }

  isMobile() {
    const agent = this.userAgent();
    return agent === 'iOS' || agent === 'Android';
  }

  launchReturnUrl() {
    if (this.userAgent() === 'Android') {
      // Universal links are not stable in Android webviews and custom tabs, so always use intent links.
      const intent = `Intent;package=org.irmacard.cardemu;scheme=irma;l.timestamp=${Date.now()}`;
      window.location.href = `intent://#${intent};end`;
    } else {
      window.location.href = 'https://irma.app/-/';
    }
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.t('title')} />
        <Column className={styles.center}>
          <SuccessIcon />
          <h2>{this.t('success')}</h2>
          <p>{this.t('explanation')}</p>
          <p>
            {this.isMobile() ? (
              <YiviButton theme={'primary'} onClick={() => this.launchReturnUrl()}>
                {this.t('return-to-yivi')}
              </YiviButton>
            ) : (
              this.t('app-is-ready')
            )}
          </p>
          <p>
            <a href={'/#'} onClick={(e) => this.continueToMyYivi(e)}>
              {this.t('continue-to-myyivi')}
            </a>
          </p>
        </Column>
      </>
    );
  }
}

export default withTranslation('registration-verified')(RegistrationVerified);
