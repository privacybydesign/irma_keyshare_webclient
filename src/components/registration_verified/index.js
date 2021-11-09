import React from 'react';
import { withTranslation } from 'react-i18next';

import './index.scss';
import IrmaAppBar from '../../helpers/irma_app_bar';
import SuccessIcon from '../../helpers/success_icon';
import Column from '../../helpers/column';

const RegistrationVerified = (props) => {
  const continueToMyIrma = (e) => {
    e.preventDefault();
    window.location.hash = '';
    props.dispatch({ type: 'loggedIn' });
  };

  const userAgent = () => {
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
  };

  const isMobile = () => {
    const agent = userAgent();
    return agent === 'iOS' || agent === 'Android';
  };

  const getReturnUrl = () => {
    const universalLink = 'https://irma.app/-/';
    if (userAgent() === 'Android') {
      // Universal links are not stable in Android webviews and custom tabs, so always use intent links.
      const intent = `Intent;package=org.irmacard.cardemu;scheme=irma;l.timestamp=${Date.now()}`;
      const fallback = `S.browser_fallback_url=${encodeURIComponent(universalLink)}`;
      return `intent://#${intent};${fallback};end`;
    }
    return universalLink;
  };

  return (
    <>
      <IrmaAppBar title={props.t('title')} />,
      <Column className={'center'}>
        <SuccessIcon className={'success-icon'} />
        <h2>{props.t('success')}</h2>
        <p>{props.t('explanation')}</p>
        <p>
          {isMobile() ? (
            <a className={'return-button'} href={getReturnUrl()}>
              <img src={`${process.env.PUBLIC_URL}/assets/irma-logo.svg`} className={'irma-logo'} alt={'irma-logo'} />
              <span>{props.t('return-to-irma')}</span>
            </a>
          ) : (
            props.t('app-is-ready')
          )}
        </p>
        <p>
          <a href={'/#'} onClick={continueToMyIrma}>
            {props.t('continue-to-myirma')}
          </a>
        </p>
      </Column>
    </>
  );
};

export default withTranslation('registration-verified')(RegistrationVerified);
