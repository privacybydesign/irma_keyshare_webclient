import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';

class YiviAppBar extends React.Component {
  async changeLanguage(lang) {
    if (this.normalizedLanguage() === lang) return;
    try {
      await this.props.i18n.changeLanguage(lang);
    } catch (err) {
      console.error('Language switch failed', err);
      return;
    }
    document.documentElement.setAttribute('lang', lang);
    try {
      window.localStorage.setItem('lang', lang);
    } catch (e) {
      // localStorage unavailable — pick won't survive reload, but the page still works.
    }
  }

  // i18n.language may carry a region tag (e.g. 'nl-NL') if fallbacks are
  // configured upstream. Compare on the base subtag.
  normalizedLanguage() {
    const current = this.props.i18n.language || '';
    return current.toLowerCase().split('-')[0];
  }

  renderLanguageSwitcher() {
    const current = this.normalizedLanguage();
    const langs = ['nl', 'en'];
    return (
      <div className={styles.languageSwitcher} role="group" aria-label={this.props.t('language-switcher-label')}>
        {langs.map((lang, idx) => {
          const isActive = current === lang;
          return (
            <React.Fragment key={lang}>
              {idx > 0 ? <span className={styles.languageDivider}>|</span> : null}
              <button
                type="button"
                className={`${styles.languageButton} ${isActive ? styles.languageButtonActive : ''}`}
                onClick={() => this.changeLanguage(lang)}
                aria-pressed={isActive}
                aria-disabled={isActive}
                disabled={isActive}
              >
                {lang.toUpperCase()}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <header className={styles.bar}>
        {this.renderLanguageSwitcher()}
        <h1>{this.props.title}</h1>
        {this.props.onLogout ? (
          <div className={styles.logout}>
            <YiviButton theme={'primary'} onClick={this.props.onLogout} type={'button'}>
              {this.props.t('logout')}
            </YiviButton>
          </div>
        ) : null}
      </header>
    );
  }
}
export default withTranslation('yivi-app-bar')(YiviAppBar);
