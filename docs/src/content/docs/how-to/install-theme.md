---
title: Add the theme to a Starlight site
description: Install starlight-aurora in a Starlight site that you have already.
sidebar:
  order: 1
---

Use this guide when the site uses Starlight already. For a new site, use
[the starter](../../tutorials/first-site/).

## Procedure

1. Install the theme from its tag:

   ```sh
   npm install github:colliery-io/starlight-aurora#v0.3.0
   ```

2. In `astro.config.mjs`, add the plugin to Starlight:

   ```js
   import starlight from '@astrojs/starlight';
   import starlightAurora from 'starlight-aurora';

   export default defineConfig({
     integrations: [
       starlight({
         title: 'My docs',
         plugins: [starlightAurora()],
       }),
     ],
   });
   ```

3. Remove the colour, font and shadow variables (`--sl-color-*`, `--sl-font`)
   from the site's own `customCss`. The theme sets them from Aurora's tokens.
   The site's CSS loads after the theme, so a value that stays wins.

4. Build the site:

   ```sh
   npx astro build
   ```

## Requirements

| Package | Version |
|---|---|
| `@astrojs/starlight` | 0.42.0 or later |
| Node | 22 or later |
