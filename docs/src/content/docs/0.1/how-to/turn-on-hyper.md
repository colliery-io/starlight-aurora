---
title: Turn on hyper
description: Offer Aurora's hyper theme in the theme select of a site.
sidebar:
  order: 2
slug: 0.1/how-to/turn-on-hyper
---

Hyper is Aurora's neon theme on a dark base. A site opts in. This site has
hyper on.

## Procedure

1. In `astro.config.mjs`, give the plugin the option `hyper: true`:

   ```js
   plugins: [starlightAurora({ hyper: true })],
   ```

2. Build the site. The theme select shows Light, Dark, Hyper and Auto.

## What changes

* The plugin loads Aurora's `hyper.css`.
* The plugin replaces two Starlight components: `ThemeProvider` and
  `ThemeSelect`. If the site replaces one of them too, the build stops with an
  error. Remove one of the two.
* Code blocks use the dark code theme under hyper.
* With `hyper: false`, the site is the same as a site with no `hyper` option.

:::caution
The two components are copies of the components of Starlight 0.42.6, with
hyper added. A Starlight release that changes them needs a new release of
starlight-aurora.
:::
