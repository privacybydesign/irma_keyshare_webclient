import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';
import { baseLanguage } from '../i18n';

export class YiviAppBar extends React.Component {
  // Pending-language marker, shared across all instances (only one app bar
  // is mounted at a time). `undefined` means "no switch in flight; trust
  // i18next's own state". The explicit field declaration documents the
  // invariant — tests reset it in beforeEach.
  static _latestRequestedLang = undefined;

  async changeLanguage(lang) {
    // Compare against the *latest-requested* language, not just i18next's
    // current value — rapid clicks (NL → EN) fire while NL's changeLanguage
    // is still pending and i18n.language is stale, and we want the second
    // click to still proceed.
    const previousLatest = YiviAppBar._latestRequestedLang;
    // `??` not `||` — an accidentally-set empty-string marker would
    // otherwise incorrectly fall through to baseLanguage().
    const current = previousLatest ?? baseLanguage(this.props.i18n);
    if (current === lang) return;
    // Capture rollback target from the *logical* previous language (the
    // last-requested or, if no request is in flight, the live i18n value).
    // Reading baseLanguage(i18n) directly here would catch a stale value
    // mid-flight, and a rollback would then write a language nobody asked
    // for to localStorage.
    const rollbackLang = current;
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
      // Roll back so detectLanguage() on next reload doesn't read a language
      // we never successfully switched to — but only if no later click has
      // already overwritten our state (that newer click owns localStorage).
      // Restore _latestRequestedLang to the prior pending value rather than
      // clearing it, so a still-pending earlier request retains ownership
      // of the convergence step.
      if (YiviAppBar._latestRequestedLang === lang) {
        try {
          window.localStorage.setItem('lang', rollbackLang);
        } catch (e) {
          // see above
        }
        YiviAppBar._latestRequestedLang = previousLatest;
      }
      return;
    }
    // i18next's promises can resolve out of order. If our awaited promise
    // resolved *after* a later click's promise already finished, i18next
    // will have stamped `language` with our (now-stale) value, even though
    // a newer click has logically superseded us. Force convergence: if
    // i18next disagrees with the latest-requested language, re-issue.
    // Fire-and-forget — whichever convergence call resolves last will hit
    // this branch with i18n.language already matching latest and stop.
    //
    // `_latestRequestedLang` is intentionally *not* cleared on success.
    // Clearing it after the latest click would let an out-of-order stale
    // resolution from an earlier click see `latest === undefined` and skip
    // the convergence, leaving i18next pinned at the wrong language. The
    // trade-off is that an *external* `i18n.changeLanguage` call (not via
    // this switcher) could leave `_latestRequestedLang` stale, but nothing
    // in this codebase calls changeLanguage outside the switcher.
    //
    // Guard against `latest === undefined` (all in-flight requests rolled
    // back via the catch path above) — calling `i18n.changeLanguage(undefined)`
    // tells i18next to re-run language detection, which is non-deterministic.
    if (YiviAppBar._latestRequestedLang !== undefined && this.props.i18n.language !== YiviAppBar._latestRequestedLang) {
      this.props.i18n.changeLanguage(YiviAppBar._latestRequestedLang).catch(() => {});
    }
    // Only the most recent click writes `<html lang>`. Stale resolutions
    // return silently.
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
