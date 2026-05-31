import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';
import { baseLanguage } from '../i18n';

export class YiviAppBar extends React.Component {
  async changeLanguage(lang) {
    // Compare against the *latest-requested* language, not just i18next's
    // current value — rapid clicks (NL → EN) fire while NL's changeLanguage
    // is still pending and i18n.language is stale, and we want the second
    // click to still proceed.
    const current = YiviAppBar._latestRequestedLang || baseLanguage(this.props.i18n);
    if (current === lang) return;
    YiviAppBar._latestRequestedLang = lang;
    // Persist the user's choice *before* awaiting i18next. A reload between
    // the await and a later persist call would silently lose the pick.
    try {
      window.localStorage.setItem('lang', lang);
    } catch (e) {
      // localStorage unavailable — pick won't survive reload, but the page still works.
    }
    try {
      await this.props.i18n.changeLanguage(lang);
    } catch (err) {
      console.error('Language switch failed', err);
      return;
    }
    // i18next promises can resolve out of order; only the most recent click
    // gets to write `<html lang>`.
    if (YiviAppBar._latestRequestedLang !== lang) return;
    document.documentElement.setAttribute('lang', lang);
  }

  renderLanguageSwitcher() {
    const current = baseLanguage(this.props.i18n);
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
