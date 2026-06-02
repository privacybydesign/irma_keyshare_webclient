import { Trans, withTranslation } from 'react-i18next';

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
                // Optional chaining mirrors the defensive pattern used at module
                // load in i18n.js / store/userdata.js / store/loginstate.js so a
                // missing or malformed /config.js doesn't crash the render here
                // either. Falls through to `undefined`, which renders as an
                // empty href — degrades gracefully rather than throwing.
                window.config?.attributesOverviewUrl?.[props.i18n.language] || window.config?.attributesOverviewUrl?.en
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
