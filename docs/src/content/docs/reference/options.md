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
| `expressiveCode.frames` | `extractFileNameFromCode: false`: a first-line comment with a path is not taken as the block's title. The site turns it on with `frames: { extractFileNameFromCode: true }`. |
| Integrations | Adds a page script (`c4-colours.js`) that gives Mermaid's C4 diagrams Aurora's colours |
| `components` | With `hyper: true` only: replaces `ThemeProvider` and `ThemeSelect`. With starlight-versions too, the theme select also shows the version select. |

## Stylesheets

In this order:

| Stylesheet | What it holds |
|---|---|
| `styles/layers.css` | Puts Aurora's vendored CSS in a layer below Starlight's |
| `styles/aurora.css` | Aurora's `fonts.css` and `tokens.css`, unedited |
| `styles/hyper.css` | Aurora's `hyper.css`, unedited. With `hyper: true` only. |
| `styles/theme.css` | Starlight's variables from Aurora's tokens |
| `styles/mermaid.css` | Mermaid diagrams in Aurora's colours |
| `styles/badges.css` | The status badge class, `sa-status-badge` |

## Other exports

| Import | What it is |
|---|---|
| `starlight-aurora/mdbook-redirects` | Redirect pages for old mdBook addresses (`page.html`) |
| `starlight-aurora/redirects` | Redirect pages for any old address, such as MkDocs and Hugo folder addresses |
| `starlight-aurora/components/StatusBadge.astro` | Aurora's status badge |

## Commands

| Command | What it does |
|---|---|
| `starlight-aurora-check-links` | Checks a built site's internal links and anchors |
| `starlight-aurora-check-site` | Checks a built site in Chrome in each theme (needs `playwright-core` and `axe-core`) |
| `starlight-aurora-from-mdbook` | Converts mdBook pages, and makes a sidebar from `SUMMARY.md` |

See [Check a site](../../how-to/check-a-site/).

## Theme choice

The choice of theme is kept in `localStorage`, in Starlight's key
`starlight-theme`. Auto is kept as an empty value.
