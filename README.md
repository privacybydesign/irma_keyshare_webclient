IRMA cloud webclient
======================

This project contains all the web sources to interact with an IRMA Cloud server. Currently these pages should be considered a *prototype* implementation of a web interface for the cloud server. In particular it allows users to

 * register an account with a cloud server, so that it can benefit from the extra security offered by this server;
 * inspect a log of recent actions; and
 * disable the user's IRMA App.

# Development

Some notes on development

## Quick start

First setup the development environment:

    npm install -g grunt-cli
    npm install -g bower

by installing grunt and bower. Then run

    npm install
    bower install

to install the node dependencies and JavaScript libraries. Finally run

    grunt build --cloud_server_url="http://<YOUR_SERVER>:8080/irma_cloud_server/api/v1

compile the web sources. See below for how to setup server URLs for a local or remote server. Alternatively, you can just run

    grunt --cloud_server_url="http://<YOUR_SERVER>:8080/irma_cloud_server/api/v1

to keep rebuilding the files as they change. (Make sure that you run `grunt build` at least once to make sure everything gets build, or just run `grunt build watch` to build and keep building.)

Typically, you want `<YOUR_SERVER>` to be publicly reachable, or at least reachable by the IRMA-app that you are using.

## URLs for api web pages and apis

This project relies on the URL of the cloud server, you can specify it using the `--cloud_server_url` option as specified above.

## Running a local verification server

If you are running a local cloud server using the `irma_cloud_server` project you might as well use it to host the web pages as too (and thus avoid CORS problems). First, make sure that the assembled output is written to the `webapp` directory. If `irma_cloud_server` is in the same directory is `irma_cloud_server` run:

    ln -s ../irma_cloud_server/src/main/webapp/ build

(please first remove your `build` directory before running this command).
