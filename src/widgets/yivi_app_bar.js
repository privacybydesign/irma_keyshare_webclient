import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';
import Column from './column';

class YiviAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  changeLanguage(lang) {
    if (this.props.i18n.language === lang) return;
    this.props.i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
  }

  renderLanguageSwitcher() {
    const current = this.props.i18n.language;
    const langs = ['nl', 'en'];
    return (
      <div className={styles.languageSwitcher} aria-label="Language">
        {langs.map((lang, idx) => (
          <React.Fragment key={lang}>
            {idx > 0 ? <span className={styles.languageDivider}>|</span> : null}
            <button
              type="button"
              className={`${styles.languageButton} ${current === lang ? styles.languageButtonActive : ''}`}
              onClick={() => this.changeLanguage(lang)}
              aria-pressed={current === lang}
            >
              {lang.toUpperCase()}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  }

  render() {
    return (
      <header className={styles.bar}>
        <Column className={styles.content}>
          {this.renderLanguageSwitcher()}
          <h1>{this.props.title}</h1>
          {this.props.onLogout ? (
            <div className={styles.logout}>
              <YiviButton theme={'primary'} onClick={this.props.onLogout} type={'button'}>
                {this.t('logout')}
              </YiviButton>
            </div>
          ) : null}
        </Column>
      </header>
    );
  }
}
export default withTranslation('yivi-app-bar')(YiviAppBar);
