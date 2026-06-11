# Wallet Code Sabai - Project Plan

## Current direction

This app is built as a mobile-first Nuxt PWA with cloud-first account data and lightweight local preferences.

## Auth flow

- Users sign up with email or phone number.
- Each account uses a 6-digit PIN for device unlock.
- The server stores account identity and PIN hash.
- Login is verified against the cloud database.
- "Remember this device" keeps the account available on the same device for fast unlock.

## Data flow

- Wallets, transactions, categories, currency settings, and account state are stored in Turso.
- UI preferences like theme and language can stay on the device for convenience.
- When the device is online, changes sync to Turso automatically.
- Cloud data is the source of truth for the account.

## Free vs Pro

- Free users use the same cloud-backed account model with a locked cloud-sync flow.
- Pro users can unlock cloud sync and restore their data on new devices.
- Cloud sync is tied to the account, not to the device.

## Offline UX

- Users can keep using the app shell without internet, but account data is centered on cloud state.
- UI can still show online/offline status for connection feedback.
- Sync status is shown in the UI as Connected, Locked, or Offline where relevant.

## Next steps

1. Keep improving sync reliability and conflict handling.
2. Add Pro entitlement / redeem code flow if cloud sync is paid.
3. Add visible sync retry and last-updated details.
4. Keep the mobile UI compact and native-like.
