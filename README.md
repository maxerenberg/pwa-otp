<p align="center">
  <img src="./public/favicon.svg" width="120" alt="pwa-otp logo" />
</p>

<p align="center">An offline-only web-based TOTP application</p>

[![](https://github.com/maxerenberg/pwa-otp/workflows/CI/badge.svg)](https://github.com/maxerenberg/pwa-otp/actions?query=workflow%3ACI)

# pwa-otp

This is an offline-only [Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
to store [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) codes.
It is an alternative to Microsoft Authenticator, Google Authenticator, etc.

## How it works

- TOTP secrets are stored in the browser's localStorage and may be optionally
  encrypted with a password which must be entered on startup.
- TOTP codes are calculated using the TOTP secrets and displayed on the screen.
- TOTP accounts may be added, deleted, reordered, etc. just like any other TOTP app.

## How to install it

Visit https://maxerenberg.github.io/pwa-otp from the device on which you would
like to install the app and click "Get started".

## Advantages over other TOTP apps

- No need to trust someone else's server because there is no server.
- No minimum iOS/Android version. Should work on older devices as long as
  a reasonably up-to-date browser is present.

## Disadvantages over other TOTP apps

- No backups. Users are responsible for manually exporting their settings
  and making their own backup.
- Currently there is no QR code scanner so users need to manually type the
  TOTP secret. This may be added in the future if I end up needing it.

## Motivation

This project was born out of frustration with the iOS version of
Microsoft Authenticator. One day the iOS requirements were bumped to iOS 14,
but I could not upgrade my iPhone to that OS version because my phone
was too old. Unfortunately the app iCloud backups eventually stopped working;
I assume that the developers made backwards-incompatible changes to
their backend API or something similar.

Unfortunately the Microsoft Authenticator app does not allow you to export
your TOTP secrets offline. You must use the built-in app backups, which, in
my case, did not even work. Eventually I figured out how to jailbreak my
iPhone and decrypt the iOS keychain to manually extract the TOTP secrets
for the app. However, it was a very painful experience. I wanted a TOTP app
which did not have minimum iOS requirements, and allowed me to easily
export the secrets if necessary. Thus this project was born.
