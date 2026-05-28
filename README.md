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
You will also see any lint errors in the console.

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

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

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

## Container vulnerability scanning

The Delivery workflow (`.github/workflows/delivery.yml`) runs [`anchore/scan-action`](https://github.com/anchore/scan-action) against the built image on every PR / push / release / scheduled run, with SARIF uploaded to GitHub Code Scanning. The scope of the build-failing gate is deliberately narrow — note what does **not** block merges:

- **Severity cutoff is `high`.** Moderate and low CVEs surface in Code Scanning but do not fail the build. Bump `severity-cutoff` in `delivery.yml` if you want a stricter gate.
- **`only-fixed: true`.** Unfixable CVEs (no upstream patch available) are reported via SARIF but don't fail the build — blocking on something we can't actually patch isn't useful. They become "fixable" automatically once a fix is published.
- **`fail-build` is gated to non-PR events.** PR runs always upload a SARIF report but never block the PR on its content. The intent is that a freshly-disclosed upstream CVE shouldn't block every open PR until the base image is bumped. The gate kicks back in on `push` / `release` / `workflow_dispatch` so anything merged or released has to clear the bar.
- **Schedule runs scan the deployed `:edge` image**, not a rebuild of `master`. A new CVE that affects the running image shows up the next Monday at 09:00 UTC even if no code has changed.

Base images are pinned by digest (`joseluisq/static-web-server@sha256:…` for the runtime stage, `node:24-alpine` for the build stage) so an upstream silent re-tag of `:latest` can't shift scan results without a source change. Bump both the tag and the digest together when reviewing CVE fixes.
