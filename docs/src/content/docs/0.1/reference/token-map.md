---
title: Token map
description: Each Starlight variable and the Aurora token that sets it.
sidebar:
  order: 3
slug: 0.1/reference/token-map
---

`styles/theme.css` sets each Starlight variable to an Aurora token. Aurora's
colour tokens hold a light value and a dark value, so this one map serves each
theme.

## Grey scale

Starlight's `white` is the strongest text and its `black` is the page.

| Starlight | Aurora |
|---|---|
| `--sl-color-white` | `--fg-bright` |
| `--sl-color-gray-1` | `--fg-strong` |
| `--sl-color-gray-2` | `--fg-2` |
| `--sl-color-gray-3` | `--muted` |
| `--sl-color-gray-4` | `--faint` |
| `--sl-color-gray-5` | `--border` |
| `--sl-color-gray-6` | `--sidebar` |
| `--sl-color-gray-7` | `--panel-2` |
| `--sl-color-black` | `--bg` |

## Accent and hues

For each hue, `-low` is a fill, the hue is the hue, and `-high` is text on the fill.

| Starlight | Aurora | Used by |
|---|---|---|
| accent | ice | links, the current page, buttons |
| blue | ice | note asides |
| purple | violet | tip asides |
| orange | gold | caution asides |
| red | bad | danger asides |
| green | ok | success badges |

| Starlight suffix | Aurora suffix |
|---|---|
| `-low` | `-bg` |
| (none) | (none) |
| `-high` | `-fg` |

## Roles

| Starlight | Aurora |
|---|---|
| `--sl-color-text` | `--fg` |
| `--sl-color-text-accent` | `--ice` |
| `--sl-color-text-invert` | `--on-accent` |
| `--sl-color-bg` | `--bg` |
| `--sl-color-bg-nav` | `--sidebar` |
| `--sl-color-bg-sidebar` | `--sidebar` |
| `--sl-color-bg-inline-code` | `--inset` |
| `--sl-color-bg-accent` | `--ice` |
| `--sl-color-hairline-light` | `--border-soft` |
| `--sl-color-hairline` | `--border` |
| `--sl-color-hairline-shade` | `--border` |
| `--sl-color-backdrop-overlay` | `--scrim` |
| `--sl-shadow-sm`, `-md`, `-lg` | `--shadow-sm`, `-md`, `-lg` |
| `--sl-font` | `--font-sans` (IBM Plex Sans) |
| `--sl-font-mono` | `--font-mono` (IBM Plex Mono) |
