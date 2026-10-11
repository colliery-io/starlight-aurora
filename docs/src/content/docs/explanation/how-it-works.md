---
title: How the theme works
description: Why one token map serves each theme, why Aurora's CSS sits in a layer, and what hyper changes.
sidebar:
  order: 1
---

## One map for each theme

Aurora's colour tokens are `light-dark()` pairs:

```css
--bg: light-dark(#f3f5f8, #0e1116);
```

The browser picks the value from the `color-scheme` of the element. Aurora's
`tokens.css` sets `color-scheme` from the `data-theme` attribute of `<html>`,
and Starlight already writes that attribute when a person chooses a theme. So
the theme needs no script for light and dark, and `styles/theme.css` sets each
Starlight variable once, to a token, with no rule for each theme. Hyper sets
the same tokens to its own values, so the same map serves hyper too.

## Aurora's CSS in a layer

Aurora's `tokens.css` is written for Aurora's products. Besides the tokens, it
sets a few base rules: `body { font-size: 14px }`, `html, body { height: 100% }`.
In a docs site, those rules would fight Starlight's.

The theme does not edit Aurora's files: CI checks that they are the same as
the Aurora tag. It imports them into a cascade layer, `aurora-vendor`, that is
below Starlight's layers. Aurora's variables still apply, because no Starlight
rule sets them, and Starlight's base rules win. `styles/theme.css` is not in a
layer, so it wins over Starlight's variables, and the site's own CSS comes
after it and wins over it.

## Hyper and code blocks

Starlight's code blocks (Expressive Code) know two themes, light and dark.
Their CSS gives the light code theme to each `data-theme` that is not `dark`,
and so hyper got light code colours on a dark page.

A code block can carry its own `data-theme`, and Expressive Code honours it.
Under hyper, the theme provider marks each code block `data-theme="dark"`
while the page loads, and removes the mark when a person leaves hyper.

## Mermaid

The starter uses `astro-mermaid` with `autoTheme`. It maps `light` to Mermaid's
default theme and `dark` to Mermaid's dark theme. For a theme that it does not
know, it uses the theme in the config. The starter sets that to `dark`, so
hyper gets dark diagrams.

The edge labels of Mermaid's dark theme do not meet WCAG AA. The theme gives
them Aurora's panel colour and text colour.

## The starter

The starter in `template/` divides the pages into the four
[Diátaxis](https://diataxis.fr) sections:

| Section | It answers |
|---|---|
| Tutorials | "Teach me." The reader does each step and sees a result. |
| How-to guides | "Help me do this task." |
| Reference | "Tell me the facts." |
| Explanation | "Help me understand why." |

API reference (rustdoc, the Python API docs) stays where the code publishes
it. The reference section links to it.
