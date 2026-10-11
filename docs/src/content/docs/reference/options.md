---
title: Options
description: The options of the starlight-aurora plugin, and what the plugin changes in Starlight.
sidebar:
  order: 1
---

## Plugin options

```js
starlightAurora({ hyper: false })
```

| Option | Type | Default | What it does |
|---|---|---|---|
| `hyper` | boolean | `false` | Loads Aurora's hyper theme and adds Hyper to the theme select |

## What the plugin changes

| Starlight option | Change |
|---|---|
| `customCss` | Adds the theme's stylesheets before the site's own |
| `expressiveCode.styleOverrides` | Adds Aurora's fonts and radius to code blocks. The site's own values win. With `expressiveCode: false`, nothing changes. |
| `components` | With `hyper: true` only: replaces `ThemeProvider` and `ThemeSelect`. With starlight-versions too, the theme select also shows the version select. |

## Stylesheets

In this order:

| Stylesheet | What it holds |
|---|---|
| `styles/layers.css` | Puts Aurora's vendored CSS in a layer below Starlight's |
| `styles/aurora.css` | Aurora's `fonts.css` and `tokens.css`, unedited |
| `styles/hyper.css` | Aurora's `hyper.css`, unedited. With `hyper: true` only. |
| `styles/theme.css` | Starlight's variables from Aurora's tokens |

## Theme choice

The choice of theme is kept in `localStorage`, in Starlight's key
`starlight-theme`. Auto is kept as an empty value.
