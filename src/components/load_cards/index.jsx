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
          components={[
            <a
              key="overview-link"
              href={
                window.config.attributesOverviewUrl[baseLanguage(props.i18n)] || window.config.attributesOverviewUrl.en
              }
            >
              {/* Trans fills in the link text from the translation. */}
            </a>,
          ]}
        />
      </p>
    </>
  );
};

export default withTranslation('load-cards')(LoadCards);
