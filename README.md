IRMA keyshare webclient
======================

This project contains all the web sources to interact with an [IRMA keyshare server](https://github.com/privacybydesign/irma_keyshare_server). In particular it allows users to

 * register an account with a keyshare server, so that it can benefit from the extra security offered by this server;
 * inspect a log of recent actions; and
 * disable the user's IRMA App.

## Quick start

First setup the development environment:

    npm install -g grunt-cli
    npm install -g bower

by installing grunt and bower. Then run

    npm install
    bower install

to install the node dependencies and JavaScript libraries. Finally run

    grunt build --keyshare_server_url="<KEYSHARE_SERVER_URL>" \
      --api_server_url="<IRMA_SERVER_URL>" \
      --irma_js_url="<IRMA_JS_CLIENT_DIRECTORY>" \
      --language="en"

to compile the web sources. See below for how to setup server URLs for a local or remote server. If you skip the `build` keyword, grunt keeps rebuilding the files as they change. (Make sure that you run `grunt build` at least once to make sure everything gets build, or just run `grunt build watch` to build and keep building.)

Typically, you want `<YOUR_SERVER>` to be publicly reachable, or at least reachable by the IRMA-app that you are using.

### Arguments

 * `--keyshare_server_url`: specifies the URL of the keyshare server to use
 * `--api_server_url`: url of the [API server](https://github.com/privacybydesign/irma_api_server) to use for issuing and verifying email attributes
 * `--irma_js_url`: url of the [irma_js](https://github.com/privacybydesign/irma_js) client.
 * `--new_api_server`: (optional) boolean indicating whether we are talking to an old api server or the new irma server. Defaults to false, indicating the old api server.

## Running a local server

If you are running a local keyshare server using the `irma_keyshare_server` project you might as well use it to host the web pages as too (and thus avoid CORS problems). First, make sure that the assembled output is written to the `webapp` directory. If `irma_keyshare_server` is in the same directory is `irma_keyshare_server` run:

    ln -s ../irma_keyshare_server/src/main/webapp/ build

(please first remove your `build` directory before running this command).
