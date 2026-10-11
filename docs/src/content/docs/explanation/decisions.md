---
title: Why Starlight and Aurora
description: The decisions behind the Colliery docs standard.
sidebar:
  order: 2
---

The Colliery products had their docs in mdBook, MkDocs and Hugo, each with its
own look. The products themselves share one design system, Aurora. This theme
gives the docs that same look.

## The decisions

| Decision | Why |
|---|---|
| Astro Starlight | Its theme is CSS variables, which Aurora's tokens fill directly. The colliery.io site is Astro too. Search, tabs and asides are built in. |
| Aurora's look | A person who goes from a product to its docs sees one system. |
| Light, dark and auto, with hyper as an opt-in | The same themes as the products. Aurora makes hyper an opt-in for each product, and the theme does the same for each site. |
| A plugin and a starter in one repository | A theme change reaches each site with a new tag. The starter changes with the theme. |
| Aurora's CSS vendored at a tag, checked in CI | Aurora is a Rust crate, so npm cannot see its CSS. The copy is unedited, and CI fails when it differs from the tag. |
| Installed from git, not npm | One less place to publish. |
| API reference stays where it is | rustdoc and the Python API docs are generated with the code, and the site links to them. |

## The cost

Each repository's docs build needs Node, also in Rust and Python repositories.
Starlight's hyper components are copies of Starlight's own, and a Starlight
release that changes them needs a new release of this theme.
