# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[3.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.3...v3.0.0
[2.0.3]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/privacybydesign/irma_keyshare_webclient/tree/v1.0.0
