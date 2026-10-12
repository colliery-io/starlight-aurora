---
title: Troubleshooting
description: Known problems with a Starlight site and the Aurora theme, and what to do.
sidebar:
  order: 5
---

## The build stops with "Invalid URL"

`DOCS_SITE` is set but empty. The starter's `astro.config.mjs` uses
`process.env.DOCS_SITE || undefined`; a config written before starlight-aurora
0.2.0 used `process.env.DOCS_SITE` and fails on a pull request.

## The Pages workflow fails at "configure-pages"

Pages is off for the repository. Set Settings → Pages → Source to "GitHub
Actions", then run the workflow again.

## `npm --prefix <folder> ci` fails with "Missing: … from lock file"

npm can take the folder's name as the package's name. Run `npm ci` inside the
folder: `cd <folder> && npm ci`.

## The lockfile records the theme as `git+ssh://…`

npm saves a GitHub dependency as `git+ssh://git@github.com/…#<commit>`, with
`github:` and with `git+https:` in `package.json`. For a public repository,
`npm ci` falls back to https, so CI needs no SSH key. The commit pins the
exact theme.

## A page with `<`, `{` or `}` breaks the build

An `.mdx` page reads `<` as the start of a tag and `{}` as code. So does
starlight-versions when it copies a version's pages. Escape them in text
(`&lt;`, `\{`, `\}`), or convert with `starlight-aurora-from-mdbook … --escape-mdx`.

## A copied version lost table cells

starlight-versions writes the copied pages again without GitHub tables'
escapes: `\|` in a cell splits the cell. Compare the copy with the source after
each new version, and fix the copy by hand.

## Old version folders disappear after a deploy

A Pages deploy from a workflow replaces the whole site. To keep old version
folders (an old mdBook copy, for example), build them in the workflow on each
deploy, as GraphQLite does.

## An image under `public/` does not show under the base path

A Markdown image `![x](/images/a.png)` points at the site root, without the
base path. Put the image in `src/assets/` and use a relative path, or use an
`<img>` with a relative `src`.

## A change to the config has no effect

Astro keeps a content cache. Remove `docs/.astro` and `docs/node_modules/.astro`,
and build again.

## The build prints warnings

Two are expected: `Entry docs → 404 was not found` (Starlight uses its own 404
page) and, with `DOCS_SITE` empty, the sitemap's `requires the site option`.

## In a full-page screenshot, the sidebar stops partway down

The sidebar is fixed to the window (`position: fixed`), so a full-page
screenshot draws it once, at the top. On the site it fills the window at each
scroll position.
