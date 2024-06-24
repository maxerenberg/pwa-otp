# Scripts

## upload-server

The upload-server script runs a small HTTP server which accepts JSON file
uploads and saves them to a file in the current directory named
"settings.json". If a file with this name already exists it will be
overwritten. This is meant to be used for the "Upload settings" feature
from the Settings page of the app.

### Assumptions

This script is meant to be run from your laptop or PC, which should be
on the same local network as the device which is running the app.

WARNING: only run this script in trusted private networks, i.e.
in your house. Do not run it in public networks such as coffee shops
or airports. Your credentials will be sent in plain text.

### Usage

On Unix-like platforms:

```shell
./upload-server.mjs
```

On Windows:

```shell
node upload-server.mjs
```

On startup, a message like the following will be printed:

```
Listening on http://10.0.0.2:3000
```

You may see multiple URLs if your computer has multiple external network
interfaces. If this happens you will need to know the IP subnet of the
network shared by your computer and the device running the app (e.g. on
iOS, go to Settings -> Wi-Fi, click the blue "i" circle beside the current
Wi-Fi network, and look at the IPv4 subnet).

Once you have determined the correct URL, you can enter this information into
the "Upload settings" page in the app. The settings will be then be saved
to "settings.json" on your computer.
