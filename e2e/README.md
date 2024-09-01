# E2E tests

We use [Playwright](https://playwright.dev) for E2E testing.

## Install a browser

See https://playwright.dev/docs/browsers

## Use an existing browser

Run the `server.js` script on the machine where the browser will run. It will
print a URL which starts with "ws://". By default, it will listen on a random
port; set the PORT environment variable to change this. Here's an example
invocation for chromium:

```shell
PORT=50000 node e2e/server.js
```

Here's an example with Firefox (note: there doesn't seem to be a way to disable
the prompt which asks for camera access, so you will need to click it manually
during the tests):

```shell
PORT=50000 BROWSER=firefox node e2e/server.js
```

If you want to run the browser on your laptop and run the tests on a remote
server via SSH, use the following flags:

```shell
ssh -L 5173:localhost:5173 -R 50000:localhost:50000 ...
```

## Run the tests

See https://playwright.dev/docs/running-tests

```shell
npx playwright test
```

If you are running the tests on a remote server and Chromium on your laptop,
use the following arguments:

```shell
WS_ENDPOINT="ws://localhost:50000/abc123" npx playwright test --project chromium
```

Replace the value of WS_ENDPOINT with the URL printed by the server.js script
earlier.
