# Income Expense Note - Concept

## Product idea

Income Expense Note is a native-like mobile PWA for tracking money across wallets, categories, and reports.

## Core principles

- Mobile-first UI
- Works offline
- Syncs in the background when online
- Feels like a native app on iPhone and Android
- Simple login with email or phone + PIN

## Authentication concept

- Register with email or phone number.
- Create a 6-digit PIN.
- Sign in with the same account on the same device or a new device.
- Remembered devices can unlock faster.

## Data concept

- Local data is the primary source for the current device.
- Cloud data is the backup and cross-device sync layer.
- Dexie/IndexedDB stores data locally.
- Turso stores account and sync data in the cloud.

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
