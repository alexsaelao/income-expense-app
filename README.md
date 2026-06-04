# Income Expense App

This repo contains two separate Nuxt apps:

- Root app: the main finance app
- `landing/`: a separate CSR landing site

## Run

Root app:

```bash
npm run dev
```

This starts Nuxt with the default local binding. If the port is busy, pass `--port <number>` after `npm run dev`.

Landing app:

```bash
npm run dev:landing
```

This starts the landing app with the default local binding. If the port is busy, pass `--port <number>` after `npm run dev:landing`.

## Build

Root app:

```bash
npm run build
```

Landing app:

```bash
npm run build:landing
```

## Notes

- Generated folders like `.nuxt`, `.output`, `dist`, `landing/.nuxt`, `landing/.output`, and `landing/dist` are ignored and should not be committed.
- The landing app should use root-relative links, not `localhost` URLs.
