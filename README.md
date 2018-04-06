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

    grunt build --keyshare_server_url="http://<YOUR_SERVER>:8080/irma_keyshare_server/api/v1" \
      --api_server_url="http://<YOUR_SERVER>:8088/irma_api_server" \
      --language="en"

to compile the web sources. See below for how to setup server URLs for a local or remote server. If you skip the `build` keyword, grunt keeps rebuilding the files as they change. (Make sure that you run `grunt build` at least once to make sure everything gets build, or just run `grunt build watch` to build and keep building.)

Typically, you want `<YOUR_SERVER>` to be publicly reachable, or at least reachable by the IRMA-app that you are using.

### Arguments

 * `--keyshare_server_url`: specifies the URL of the keyshare server to use
 * `--api_server_url`: url of the [API server](https://github.com/privacybydesign/irma_api_server) to use for issuing and verifying email attributes
 * `--api_web_url` (optional): url of the disclosing or issuance HTML popup for for [irma_js](https://github.com/privacybydesign/irma_js). (If absent, will be derived from the `--api_server_url` parameter.)
 * `--irma_js` (optional): url of the [irma_js](https://github.com/privacybydesign/irma_js) client. (If absent, will be derived from the `--api_server_url` parameter.)

## Running a local server

If you are running a local keyshare server using the `irma_keyshare_server` project you might as well use it to host the web pages as too (and thus avoid CORS problems). First, make sure that the assembled output is written to the `webapp` directory. If `irma_keyshare_server` is in the same directory is `irma_keyshare_server` run:

    ln -s ../irma_keyshare_server/src/main/webapp/ build

(please first remove your `build` directory before running this command).
