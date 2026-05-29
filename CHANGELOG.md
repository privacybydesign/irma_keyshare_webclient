# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Changed
- **Workflow split.** `status-checks.yml` is replaced by `ci.yml` (lint / test / build / image-scan jobs in parallel, no image push). The Delivery workflow is now narrowly focused: it pushes `:edge` to GHCR on every merge to `master` and on `workflow_dispatch` from any branch (so a PR branch can be deployed as `:edge` for end-to-end testing). A new `release.yml` handles versioned releases — on a published GitHub Release it builds, scans, and pushes `:X.Y.Z`, `:X.Y`, `:X`, and `:latest`.
- The previous `:pr-<n>` and `:<branch>` (workflow_dispatch) tag rules are gone — `delivery.yml` always tags `:edge`. Running `workflow_dispatch` from a PR branch overwrites the previously-deployed `:edge`.
- The weekly cron that re-scanned the deployed `:edge` image is gone with the split; restore as a separate `scan.yml` if periodic CVE re-checks are still wanted.
- Add a `yarn test` script and a `test` job in `ci.yml`. The script currently wraps Vitest; coverage is intentionally narrow on this first pass (reducers, helpers, and a single component smoke).

## [4.0.0] - 2026-05-28
### Changed
- **Bundler:** Replace the unmaintained `react-scripts@5` with Vite 8 + `@vitejs/plugin-react@6`. Build output directory stays at `build/`; dev server boots in ~100 ms (was 10–15 s); main bundle is 158 kB gzipped (Terser).
- **Package manager:** Migrate from yarn 1.22 to yarn 4.15 via corepack with `nodeLinker: node-modules`. The `yarn-4.15.0.cjs` release is committed under `.yarn/releases/`; CI / Docker pick it up via the `packageManager` field.
- **JSX file extension:** 29 files containing JSX renamed from `.js` to `.jsx` (Vite 8 / Rolldown only parses JSX in `.jsx` files).
- **Default language:** `public/config.js` now picks the first browser-preferred language we support (`nl` / `en`) and falls back to `en` instead of being hard-coded. Users' explicit choices are persisted in `localStorage.lang` and take precedence on subsequent loads. **Operators who relied on the old hard-coded `en` default should pin the language explicitly in their deployed `config.js`.**
- **SCSS:** Migrate every `@import 'src/theme';` to `@use 'src/theme' as *;` (Sass 3 removes `@import`).
- Move `src/fonts/` to `public/fonts/`; `@font-face` URLs use absolute `/fonts/...` paths that Vite's CSS asset pipeline rewrites based on `base` so sub-path deploys work.
- Node bumped 16 → 24 in CI and in the build image (`Dockerfile`).

### Added
- **Major dependency bumps:** React + ReactDOM 18 → 19, Redux 4 → 5, react-redux 8 → 9, i18next 22 → 26, react-i18next 12 → 17.
- **EN/NL language switcher** in `YiviAppBar`. Click flips `i18n.changeLanguage()` + the `<html lang>` attribute + `localStorage.lang`. Active button is `disabled` + `aria-disabled` so screen readers and keyboard users get the right semantics. Wrapper has `role="group"` and a translated `aria-label`.
- **`workflow_dispatch` trigger** on the Delivery workflow so any branch can be built and published as `:edge` manually via the Actions UI.
- **Container vulnerability scanning** via `anchore/scan-action` on every PR, every push to `master`, and every published release. SARIF reports always upload to the Code Scanning UI; `fail-build` only gates non-PR events so a newly-disclosed upstream CVE doesn't block unrelated PRs.

### Fixed
- Language switcher's translated text now actually swaps language — class components were caching `props.t` in their constructor, so post-switch renders still used the stale `t` (react-i18next 17 returns a new `t` reference on language change).
- App-bar layout no longer hides the language switcher behind the absolutely-positioned title on the login page.
- Heading row no longer leaves ~128 px of dead vertical space around the App-ID line on the account overview.
- Mobile header collapses cleanly into a single row instead of stacking three rows with empty gaps.
- Remove broken `https://privacybydesign.foundation/issuance/` link; LoadCards section now points at `https://yivi.app/storing_and_sharing/`.

### Security
- `yarn npm audit --severity high --all` returns no findings (was 32 across critical/high/moderate/low under `react-scripts`' devDep subtree).
- Pin every GitHub Action to a full commit SHA with a `# vX.Y.Z` trailer.
- Drop `contents: write` permission from the Delivery workflow (reduces blast radius).
- `github.repository` value interpolated via `env:` rather than directly into a `run:` script — eliminates one expression-injection vector.
- Stylelint deprecation `scss/at-import-no-partial-leading-underscore` replaced with its successor `scss/load-no-partial-leading-underscore`.
- Runtime base image pinned by manifest-list digest (`joseluisq/static-web-server:2.42.0@sha256:2d67e47…`) so a silent upstream re-tag of `:latest` can't flip Anchore scan results without a source change.
- README "Container vulnerability scanning" section documents the scope of the build-failing gate (cutoff `high`, `only-fixed: true`, PR runs scan-only) so future maintainers don't assume merges block on all known CVEs.

### Internal
- CI no longer runs a standalone `yarn build`; the image-scan job's Docker build exercises the same code path and also produces a vulnerability report.

## [3.1.3] - 2024-04-18
### Fixed
- JSON parsing error is shown when deleting account

### Security
- chore(deps): bump webpack-dev-middleware from 5.3.3 to 5.3.4 by @dependabot in #53
- chore(deps): bump express from 4.18.2 to 4.19.2 by @dependabot in #54

## [3.1.2] - 2024-03-20
### Security
- chore(deps): bump @babel/traverse from 7.22.8 to 7.23.2 by @dependabot in #46
- chore(deps-dev): bump postcss from 8.4.19 to 8.4.31 by @dependabot in #45
- chore(deps): bump follow-redirects from 1.15.2 to 1.15.6 by @dependabot in #51

### Internal
- Added Dockerfile

## [3.1.1] - 2023-09-12

### Fixed
- Deleting an e-mail address results in an error

## [3.1.0] - 2023-08-10
### Added
- E-mail address 'being revalidated' indicator icon with tooltip
- E-mail address 'being deleted' indicator icon with tooltip
- Custom warnings when and invalid e-mail address is marked for revalidation while deleting e-mail address or account

**Note:** This version recommends myirmaserver [v0.13.0](https://github.com/privacybydesign/irmago/releases/tag/v0.13.0) or above to be used as backend.

## [3.0.0] - 2023-03-23
### Added
- New Yivi look & feel
- Changelog

## [2.0.3] - 2023-03-06
- Upgraded dependencies by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/27
- chore(deps): bump loader-utils from 2.0.3 to 2.0.4 by @dependabot in https://github.com/privacybydesign/irma_keyshare_webclient/pull/29
- Removal of annoying comma in the error_message UI  by @bobhageman in https://github.com/privacybydesign/irma_keyshare_webclient/pull/28
- chore(deps): bump json5 from 1.0.1 to 1.0.2 by @dependabot in https://github.com/privacybydesign/irma_keyshare_webclient/pull/30
- Fix: intent browser fallback does not work on Firefox for Android by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/31
- Improved user experience when e-mail token is expired by @bobhageman in https://github.com/privacybydesign/irma_keyshare_webclient/pull/32
- Docs: add running instructions on how to circumvent CORS issues by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/33

## [2.0.2] - 2022-10-04
- Fix: typo in translation key continue-to-myirma by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/24
- Fix: userdata is not fetched when logging in via registration email by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/25
- Improvement: add back button in EmailSent component by @ivard in https://github.com/privacybydesign/irma_keyshare_webclient/pull/26

## [2.0.1] - 2022-08-24
- Fix: don't strip location hash in url to prevent hashchange events by @ivard in #23

## [2.0.0] - 2022-08-22
- Initial release of the new React implementation of the webclient. This webclient is designed to work with the irma keyshare myirmaserver backend. Breaking changes have been made in the backend API, so this implementation is not backwards compatible with the Java keyshare server.

## [1.0.0] - 2021-10-21
- Merge pull request #9 from privacybydesign/firefox-fix
- Fix: remove invalid fallback URL to solve issues on Firefox for Android

[3.1.3]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v3.1.2...v3.1.3
[3.1.2]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.3...v3.0.0
[2.0.3]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/tree/v1.0.0
