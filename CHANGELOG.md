# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
