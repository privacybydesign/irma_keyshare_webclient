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

  // Cap on chained convergence calls. Two is enough to settle every
  // resolution order in the existing tests; the cap guards against an
  // i18next bug that could otherwise spin forever (changeLanguage resolves
  // without setting `language`).
  static MAX_CONVERGENCE_PASSES = 4;

  // Fire-and-forget bounded convergence loop. Each pass awaits i18next and
  // re-checks; we stop when the language settles, the latest-requested
  // marker is cleared (all clicks rolled back), or the pass cap is hit.
  _converge(depth = 0) {
    if (depth >= YiviAppBar.MAX_CONVERGENCE_PASSES) return;
    const target = YiviAppBar._latestRequestedLang;
    if (target === undefined) return;
    if (this.props.i18n.language === target) return;
    this.props.i18n.changeLanguage(target).then(
      () => this._converge(depth + 1),
      // Log the failure rather than swallow it silently — if convergence
      // itself rejects, i18next stays at the stale language while DOM and
      // localStorage already advertise the new one, and translations would
      // render mismatched with no audit trail.
      (err) => console.error('Language convergence failed', err),
    );
  }

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
      //
      // Rollback target is `i18n.language` *now* (the language i18next has
      // actually applied), not the `previousLatest` captured at call time.
      // With a cascade of failing rapid clicks (A then B both reject), the
      // captured `previousLatest` for B is A — itself a never-applied
      // language. Persisting that would mean the next reload starts in a
      // state the user never reached. Reading the live `i18n.language`
      // instead always points at the last *successful* switch (or the
      // initial language, if none succeeded).
      if (YiviAppBar._latestRequestedLang === lang) {
        try {
          window.localStorage.setItem('lang', baseLanguage(this.props.i18n));
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
    //
    // `_latestRequestedLang` is intentionally *not* cleared on success.
    // Clearing it after the latest click would let an out-of-order stale
    // resolution from an earlier click see `latest === undefined` and skip
    // the convergence, leaving i18next pinned at the wrong language. The
    // trade-off is that an *external* `i18n.changeLanguage` call (not via
    // this switcher) could leave `_latestRequestedLang` stale, but nothing
    // in this codebase calls changeLanguage outside the switcher.
    //
    // Bounded recursive re-convergence (cap = MAX_CONVERGENCE_PASSES): the
    // convergence call is itself a promise that can resolve out of order
    // against another in-flight call. A single fire-and-forget pass would
    // leave i18next drifting again until the next user click; chaining
    // another check after the convergence's await keeps closing the gap
    // until either (a) i18next agrees with the latest-requested language
    // or (b) we hit the pass cap. Realistic rapid-click sequences resolve
    // in one to two passes; the cap guards against pathological infinite
    // loops if i18next ever resolved without actually applying.
    //
    // Guard against `latest === undefined` (all in-flight requests rolled
    // back via the catch path above) — calling `i18n.changeLanguage(undefined)`
    // tells i18next to re-run language detection, which is non-deterministic.
    this._converge();
    // Only the most recent click writes `<html lang>`. Stale resolutions
    // return silently.
    if (YiviAppBar._latestRequestedLang !== lang) return;
    document.documentElement.setAttribute('lang', lang);
  }

  renderLanguageSwitcher() {
    const current = baseLanguage(this.props.i18n);
    const langs = ['nl', 'en'];
    // `lock` disables both buttons during a yivi-frontend session: the
    // widget reads `language` at mount and never re-reads it, so a switch
    // mid-session would leave the QR/status labels stuck in the original
    // language until the next navigation. Disabling the switcher avoids
    // that mismatched-language pitfall; tooltip explains why for sighted
    // users, the same string sits in `aria-label` of the group when
    // locked so screen readers also get the reason.
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
