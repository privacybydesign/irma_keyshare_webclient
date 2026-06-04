import { Trans, withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

const LoadCards = (props: WithTranslation) => {
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
                window.config?.attributesOverviewUrl?.[props.i18n.language] || window.config?.attributesOverviewUrl?.en
              }
            />,
          ]}
        />
      </p>
    </>
  );
};

export default withTranslation('load-cards')(LoadCards);
