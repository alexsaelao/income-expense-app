# Wallet Code Sabai - Concept

## Product idea

Wallet Code Sabai is a native-like mobile PWA for tracking money across wallets, categories, and reports.

## Core principles

- Mobile-first UI
- Works offline
- Syncs account data to the cloud when online
- Feels like a native app on iPhone and Android
- Simple login with email or phone + PIN

## Authentication concept

- Register with email or phone number.
- Create a 6-digit PIN.
- Sign in with the same account on the same device or a new device.
- Remembered devices can unlock faster.

## Data concept

- Turso stores account and sync data in the cloud.
- The browser keeps only lightweight preferences such as theme, language, and remembered login.
- Cloud data is the source of truth for wallets, transactions, categories, and currency state.

## Free and Pro concept

- Free: local-only finance data on one device.
- Pro: cloud sync and restore across devices.
- Pro can be activated with a redeem code or account entitlement.

## User experience

- Immediate saving on every edit.
- Clear sync state in the UI.
- No blocking when offline.
- Clean, compact mobile layouts with bottom navigation and quick actions.

## Future direction

- Better sync progress and retry handling
- Account plan management
- Subscription or redeem-code upgrade flow
- More detailed conflict resolution for multi-device editing
