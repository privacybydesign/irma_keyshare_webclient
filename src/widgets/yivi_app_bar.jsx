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
  //
  // Note we deliberately *don't* clear the marker on agreement here.
  // Clearing it would let an out-of-order stale resolution from an
  // earlier click (which sees `marker === undefined` and short-circuits
  // its own _converge before flipping i18next back) leave i18next pinned
  // at the wrong language. The trade-off is that a successful click
  // leaves the marker lit until the next click — relevant only if some
  // code path outside the switcher calls `i18n.changeLanguage` (which
  // nothing in this codebase does in production; tests reset the marker
  // in `beforeEach` because they call changeLanguage externally for
  // setup). See changeLanguage()'s cascading-rollback comments for the
  // mirror invariant on the failure path.
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
      //
      // The pending-marker mirrors the same logic: it gets cleared on a
      // fully-failed cascade (no in-flight clicks left) so the next click
      // sees `previousLatest === undefined` and falls through to the live
      // i18n.language for its comparison. Setting it to `previousLatest`
      // (which can itself be a never-applied language) would soft-lock
      // the switcher — the `if (current === lang) return` guard at the
      // top of the function would no-op a click that *should* succeed,
      // because `current` would be the stale marker rather than the
      // language i18next actually applied.
      if (YiviAppBar._latestRequestedLang === lang) {
        const liveLang = baseLanguage(this.props.i18n);
        try {
          window.localStorage.setItem('lang', liveLang);
        } catch (e) {
          // see above
        }
        // If `previousLatest` already matches the live language, restore
        // it (an earlier in-flight click is still expected to converge
        // and owns the marker); otherwise reset to undefined so the next
        // click reads `i18n.language` directly via the `??` fallback.
        YiviAppBar._latestRequestedLang = previousLatest === liveLang ? previousLatest : undefined;
      }
      return;
    }
    // i18next's promises can resolve out of order. If our awaited promise
    // resolved *after* a later click's promise already finished, i18next
    // will have stamped `language` with our (now-stale) value, even though
    // a newer click has logically superseded us. Bounded recursive
    // re-convergence (`_converge`, cap = MAX_CONVERGENCE_PASSES): each
    // pass awaits i18next and re-checks; chaining another check after
    // the convergence's await keeps closing the gap until either (a)
    // i18next agrees with the latest-requested language (and `_converge`
    // clears the marker) or (b) the pass cap is hit. Realistic rapid-
    // click sequences resolve in one to two passes; the cap guards
    // against pathological loops if i18next ever resolved without
    // actually applying. The guard against `latest === undefined` inside
    // `_converge` keeps it from calling `i18n.changeLanguage(undefined)`,
    // which triggers non-deterministic language detection.
    this._converge();
    // Only the most recent click writes `<html lang>`. Stale resolutions
    // return silently (marker holds the lang of a newer click).
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
                // changeLanguage returns a promise (it's async). The internal
                // try/catch + convergence handler already log every failure
                // mode, so the only thing an unawaited promise can leak is
                // an unhandled-rejection from the fire-and-forget convergence
                // call inside _converge() — which itself swallows via its
                // .then's onRejected. Belt-and-suspenders: explicit .catch
                // on the click path so any future regression where a code
                // path inside changeLanguage forgets to handle a rejection
                // surfaces in our log instead of as an unhandled rejection
                // on React's synthetic event handler.
                onClick={() => {
                  this.changeLanguage(lang).catch((err) => {
                    console.error('Unhandled rejection in language switcher click', err);
                  });
                }}
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
