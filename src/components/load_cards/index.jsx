import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { baseLanguage } from '../../i18n';

const LoadCards = (props) => {
  return (
    <>
      <h2>{props.t('header')}</h2>
      <p>
        <Trans
          t={props.t}
          i18nKey="explanation"
          // eslint-disable-next-line
          components={[ <a href={window.config.attributesOverviewUrl[baseLanguage(props.i18n)]} /> ]}
        />
      </p>
    </>
  );
};

export default withTranslation('load-cards')(LoadCards);
