Yivi keyshare webclient
======================

This project contains the web interface to interact with the [irmago MyIRMA backend server](https://github.com/privacybydesign/irmago/tree/master/server/keyshare/myirmaserver). In particular it allows users to

 * edit the email addresses that are linked to the account;
 * inspect a log of recent actions; and
 * disable the user's Yivi app.

Instructions on how to run the MyIRMA backend server can be found in the [irmago README](https://github.com/privacybydesign/irmago#running).

## Running
In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in a browser.

The page will reload if you make edits.<br />
Lint is not run inline by the Vite dev server — use `yarn lint` (or the CI workflow) to surface ESLint and Stylelint findings.

If you want your local React app to communicate with the MyIRMA backend, you will face CORS issues in your browser.
Even if you use a local setup, the MyIRMA backend server will use another port to host its endpoints on.
You can either resolve this by running your browser in insecure mode, or you can check the running instructions for
a combined local setup [below](#yarn-build).

Below some examples on how to start a browser in insecure mode.

* MacOS

      open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome-disable-web-security" --disable-web-security

* Linux

      chromium --user-data-dir=/tmp/chromium-disable-web-security --disable-web-security

Warnings about using an unsupported browser option can be ignored.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

You can easily test the React app using Docker and Go:

1. Clone the [irmago project](https://github.com/privacybydesign/irmago) and go to this directory in a shell
2. Run `docker-compose up -d` and wait until all services are running
3. Run `go install ./irma`
4. Run `irma keyshare myirmaserver --static-path /path/to/irma_keyshare_webclient/build -c ./testdata/configurations/myirmaserver.yml`
5. Open [http://localhost:8081](http://localhost:8081) to view it in a browser.

## Configuration

The deployed app reads its runtime config from `public/config.js`, which sets `window.config`. The file in this repo is the local-development template; deployments (e.g. the Kubernetes manifests in `irma-keyshare-ops`) overwrite it with environment-specific values.

### `lang`

The `lang` field decides which translation the app starts in. Starting in 4.0.0 the shipped template runs a small `detectLanguage()` helper at script-load time:

1. If `localStorage.lang` holds `nl` or `en` (set by a previous click on the in-app language switcher), that wins.
2. Otherwise, walk `navigator.languages` in preference order and pick the first base subtag (`nl` or `en`) we support.
3. Otherwise, fall back to `en`.

This is a behavior change from earlier versions where `lang` was hard-coded to `'en'`. **Operators who want to keep the old "always start in English" behavior** should replace the `detectLanguage()` call with a literal in the deployed `config.js`:

```js
window.config = {
  ...
  lang: 'en',
  ...
};
```

The in-app EN/NL switcher in the header writes the user's pick to `localStorage.lang` regardless of how the initial language was chosen, so subsequent loads honour the explicit pick.

## CI / Delivery / Release

Three workflows split the work:

- **`ci.yml`** runs on every PR and every push to `master`. Four parallel jobs: `lint`, `test`, `build`, `image-scan`. The image-scan job builds the production Docker image locally and runs `anchore/scan-action`, but never pushes. This is the PR gate.
- **`delivery.yml`** runs on push to `master` and on `workflow_dispatch`. Builds, scans, and pushes `:edge` to GHCR — same scan as `ci.yml` / `release.yml`, with `fail-build: true` since publishing has no PR-style escape hatch. Dispatch is restricted to `master`: re-publishing `:edge` from the current `master` commit is supported, but dispatching from a PR branch hard-fails at the first job step with an explanatory message (so a stray "Run workflow" click can't masquerade as a successful republish). This keeps `master` as the single source of truth for the deployed `:edge` tag — for pre-merge end-to-end testing of a PR branch, build and push the image to your own GHCR namespace instead.
- **`release.yml`** runs on `release: published`. Builds + scans + pushes `:X.Y.Z`, `:X.Y`, `:X`, and `:latest` based on the release tag.

## Container vulnerability scanning

All three workflows run [`anchore/scan-action`](https://github.com/anchore/scan-action) against the built image, with SARIF uploaded to GitHub Code Scanning. The scope of the build-failing gate is deliberately narrow — note what does **not** block merges or releases:

- **Severity cutoff is `high`.** Moderate and low CVEs surface in Code Scanning but do not fail the build. Bump `severity-cutoff` in all three workflows if you want a stricter gate.
- **`only-fixed: true`.** Unfixable CVEs (no upstream patch available) are reported via SARIF but don't fail the build — blocking on something we can't actually patch isn't useful. They become "fixable" automatically once a fix is published.
- **`fail-build` is gated to non-PR events.** PR runs in `ci.yml` always upload a SARIF report but never block the PR on its content. The intent is that a freshly-disclosed upstream CVE shouldn't block every open PR until the base image is bumped. The gate is unconditional on `delivery.yml` (master push or workflow_dispatch) and `release.yml` (published release) — anything that publishes to GHCR has to clear the bar.

The runtime base image is pinned by manifest-list digest (`joseluisq/static-web-server:2.42.0@sha256:…`) so an upstream silent re-tag of `:latest` can't shift scan results without a source change — bump both the tag and the digest together when reviewing CVE fixes. The build-stage image (`node:24-alpine`) is intentionally **not** digest-pinned: its output never ships, and pinning would slow CVE patches in the build toolchain without changing the scanned artefact.
