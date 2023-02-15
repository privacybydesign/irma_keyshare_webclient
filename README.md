IRMA keyshare webclient
======================

This project contains the web interface to interact with the [irmago MyIRMA backend server](https://github.com/privacybydesign/irmago/tree/master/server/keyshare/myirmaserver). In particular it allows users to

 * edit the email addresses that are linked to the account;
 * inspect a log of recent actions; and
 * disable the user's IRMA app.

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
