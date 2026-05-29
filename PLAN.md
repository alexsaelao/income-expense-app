# Income Expense Note - Project Plan

## Current direction

This app is built as a mobile-first Nuxt PWA with offline-first local storage and optional cloud sync.

## Auth flow

- Users sign up with email or phone number.
- Each account uses a 6-digit PIN for device unlock.
- The server stores account identity and PIN hash.
- Login is verified against the cloud database.
- "Remember this device" keeps the account available on the same device for fast unlock.

## Data flow

- Local-first data is stored in Dexie/IndexedDB.
- Wallets, transactions, categories, currency settings, and UI preferences are available offline.
- When the device is online, changes sync back to Turso in the background.
- Cloud data is used as backup and cross-device restore.

## Free vs Pro

- Free users keep data local on one device.
- Pro users can enable cloud sync and restore their data on new devices.
- Cloud sync is tied to the account, not to the device.

## Offline UX

- Users can keep using the app without internet after the first sign-in.
- Changes are saved locally first.
- Sync status is shown in the UI as Offline, Waiting to sync, Syncing, or Synced.

## Next steps

1. Keep improving sync reliability and conflict handling.
2. Add Pro entitlement / redeem code flow if cloud sync is paid.
3. Add visible sync retry and last-updated details.
4. Keep the mobile UI compact and native-like.
