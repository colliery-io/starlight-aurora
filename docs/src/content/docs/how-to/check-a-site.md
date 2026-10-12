---
title: Check a site
description: Check a built site's links and anchors, and its look in each theme, with the scripts that the theme ships.
sidebar:
  order: 10
---

The theme ships two checks as commands. Run them on the built site (`dist`),
from the docs folder or with `npx --prefix docs`.

## Check the links

```sh
npx starlight-aurora-check-links dist
npx starlight-aurora-check-links dist-base --base /my-repo/
```

It reads each page as Pages serves it under the base path, and checks each
internal `href`, `src`, redirect target and `#anchor`. It exits with 1 when a
link is broken. Check a build made with the real base path too: a site that is
right at `/` can be wrong under `/my-repo/`.

## Check the theme

The theme check opens each page in Chrome. It needs Chrome, and two packages
in the site:

```sh
npm install --save-dev playwright-core axe-core
npx starlight-aurora-check-site dist --hyper
```

For each page, in the light, dark, auto (light and dark) and hyper themes, it
checks that:

- the page background and the body font are Aurora's;
- text meets WCAG AA contrast (axe);
- each Mermaid diagram is drawn, and, for the types the theme colours by CSS
  (flowchart, sequence, class, state), its nodes and lines have Aurora's
  colours.

With `--hyper` it also checks the theme select and the code blocks under hyper.
With `--versions` it checks the version select of starlight-versions. It
writes a screenshot of the top of each page to `screenshots/`. It skips
redirect pages.

| Option | What it does |
|---|---|
| `--base /my-repo/` | Serves the site under the base path it was built for |
| `--jobs=4` | Pages checked at a time (default 4) |
| `--shard=1/3` | Checks every third page, from the first; run `2/3` and `3/3` elsewhere for the rest |

On a big site, raise `--jobs`, or run the shards in parallel jobs in CI.
