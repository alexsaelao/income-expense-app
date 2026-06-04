# Wallet Code Sabai Landing

Nuxt CSR landing page for the app.

## Run

```bash
cd landing
npm run dev
```

Nuxt will use its default local binding. If the port is busy, pass `--port <number>` after `npm run dev`.

## Build

```bash
cd landing
npm run build
```

## Cloudflare Pages deploy

Use this build command in Cloudflare Pages:

```bash
npm run generate
```

And set the output directory to:

```bash
.output/public
```

## Notes

- This landing page is isolated from the main app.
- It uses Nuxt in CSR mode and generates a static `dist/` output for deployment.
- Fonts and logos are served from `public/`.
