---
title: Update the copied Starlight components
description: Bring hyper's copies of Starlight's ThemeProvider and ThemeSelect up to date after a Starlight release changes them.
sidebar:
  order: 6
---

With `hyper: true`, starlight-aurora replaces two Starlight components with
copies that add hyper: `ThemeProvider` and `ThemeSelect`.
`components/upstream.json` records the Starlight version that they came from
and a SHA-256 hash of each upstream file.

CI runs `npm run check:upstream` on each pull request and each week. It
downloads the newest Starlight release and fails when either file differs from
the recorded hash:

```text
@astrojs/starlight 0.43.0 changed, since 0.42.6: dist/components/ThemeSelect.astro.
```

## Procedure

1. Install the new Starlight release in a clone of starlight-aurora:

   ```sh
   npm --prefix docs install @astrojs/starlight@0.43.0
   ```

2. Compare the upstream files with the copies:

   ```sh
   diff docs/node_modules/@astrojs/starlight/dist/components/ThemeSelect.astro components/ThemeSelect.astro
   diff docs/node_modules/@astrojs/starlight/dist/components/ThemeProvider.astro components/ThemeProvider.astro
   ```

3. Put the upstream changes into the copies. Keep the hyper parts: the
   `hyper` value, the `syncCode` function, and the order Light, Dark, Hyper,
   Auto.
4. Write the new version and the new hashes into `components/upstream.json`:

   ```sh
   shasum -a 256 docs/node_modules/@astrojs/starlight/dist/components/ThemeProvider.astro docs/node_modules/@astrojs/starlight/dist/components/ThemeSelect.astro
   ```

5. Check the result:

   ```sh
   npm run check:upstream
   npm run docs:build && npm run docs:check
   ```

6. Open a pull request, and release a new version of starlight-aurora.
