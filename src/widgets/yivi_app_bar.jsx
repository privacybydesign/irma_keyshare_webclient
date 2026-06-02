import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';

export class YiviAppBar extends React.Component {
  async changeLanguage(lang) {
    if (this.props.i18n.language === lang) return;
    try {
      window.localStorage.setItem('lang', lang);
    } catch (_) {
      // localStorage unavailable — pick won't survive reload, but the page still works.
    }
    await this.props.i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
  }

  renderLanguageSwitcher() {
    const current = this.props.i18n.language;
    const langs = ['nl', 'en'];
    const lock = !!this.props.lockLanguageSwitcher;
    const lockTitle = lock ? this.props.t('language-switcher-locked-title') : undefined;
    const groupLabel = lock
      ? `${this.props.t('language-switcher-label')} — ${this.props.t('language-switcher-locked-title')}`
      : this.props.t('language-switcher-label');
    return (
      <div className={styles.languageSwitcher} role="group" aria-label={groupLabel} title={lockTitle}>
        {langs.map((lang, idx) => {
          const isActive = current === lang;
          const isDisabled = isActive || lock;
          return (
            <React.Fragment key={lang}>
              {idx > 0 ? <span className={styles.languageDivider}>|</span> : null}
              <button
                type="button"
                className={`${styles.languageButton} ${isActive ? styles.languageButtonActive : ''}`}
                onClick={() => this.changeLanguage(lang)}
                aria-pressed={isActive}
                disabled={isDisabled}
                title={lockTitle}
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
