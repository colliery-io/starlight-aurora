---
title: Move to a new Aurora release
description: Update the vendored Aurora CSS of starlight-aurora to a new Aurora tag.
sidebar:
  order: 4
slug: 0.1/how-to/update-aurora
---

starlight-aurora keeps a copy of Aurora's CSS in `vendor/aurora/`, from one
Aurora tag. Use this guide when Aurora makes a release.

## Procedure

1. In a clone of starlight-aurora, make a branch.

2. Download the CSS of the new tag:

   ```sh
   npm run vendor:update -- v0.6.0
   ```

   The command writes `tokens.css`, `fonts.css` and `hyper.css`, and writes the
   tag and its commit into `vendor/aurora/source.json`.

3. Check the copy:

   ```sh
   npm run check:vendor
   ```

4. Build this site and check it in Chrome:

   ```sh
   npm --prefix docs ci
   npm run docs:build
   npm run docs:check
   ```

5. If Aurora added or renamed a token, change `styles/theme.css`.

6. Open a pull request. CI does the same checks.
