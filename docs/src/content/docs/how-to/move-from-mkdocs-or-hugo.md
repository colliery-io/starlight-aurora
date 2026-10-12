---
title: Move a site from MkDocs or Hugo
description: Move an MkDocs Material or Hugo site to Starlight with the starter, and keep its old addresses working.
sidebar:
  order: 8
---

Weir, Hlin, Skadi, angreal, plissken and Fidius moved from MkDocs Material, and
Cloacina from Hugo. These steps come from those moves.

## Procedure

1. Copy the starter into the repository, as in
   [Start a docs site](../../tutorials/first-site/). Move the old site's pages
   away first.

2. Move each page into `docs/src/content/docs/`, in its Diátaxis section. Make
   the first `# Heading` the front-matter `title`, and change links to other
   pages to relative routes (`../page/`). The mdBook converter does this for
   plain Markdown pages: `npx --prefix docs starlight-aurora-from-mdbook <old pages> docs/src/content/docs`.

3. Change the markup that Starlight does not know:

   | MkDocs Material | Starlight |
   |---|---|
   | `!!! note "Title"` | `:::note[Title]` (`warning` → `caution`, `danger` and `bug` → `danger`, `tip` and `success` → `tip`) |
   | `??? note "Title"` | `<details><summary>Title</summary>…</details>` |
   | `=== "Tab"` | `<Tabs>` and `<TabItem label="Tab">` (the page becomes `.mdx`) |
   | Mermaid in `superfences` | a ```` ```mermaid ```` block |
   | `--8<--` snippets | the content itself |
   | `nav:` in `mkdocs.yml` | a sidebar written out in `docs/astro.config.mjs` |

   | Hugo | Starlight |
   |---|---|
   | `{{< ref "x" >}}`, `relref` | a relative route |
   | `{{< hint >}}` | `:::note`, `:::tip`, `:::caution` or `:::danger` |
   | `{{< tabs >}}`, `{{< tab >}}` | `<Tabs>`, `<TabItem>` (the page becomes `.mdx`) |
   | `weight` | `sidebar: { order }` |
   | `aliases` | old addresses for the redirects (step 4) |

   Cloacina converted about 1,200 shortcodes with a script: see
   `docs/scripts/hugo_to_starlight.py` in the Cloacina repository.

4. Keep the old addresses working. MkDocs and Hugo serve each page at a folder
   address (`/guides/install/`). For each page whose address changes, add a
   redirect:

   ```js
   import pageRedirects from 'starlight-aurora/redirects';

   integrations: [
     pageRedirects({
       'guides/install/': 'how-to/install/',
       'api/': 'reference/',
     }),
     starlight({ /* ... */ }),
   ],
   ```

   Keys and values are addresses without the base path. After each build, it
   writes a page at each old address that sends the reader to the new one,
   with a relative target, so it works under the Pages base path. Astro's own
   `redirects` option does not add the base to the target: do not use it for
   this.

5. If the site has API docs from plissken, follow
   [Add the API docs from plissken](../api-docs/).

6. Remove `mkdocs.yml` or `hugo.toml` and the files only they used. Move
   static files to `docs/public/`, so their addresses stay the same.

7. Check the build, its links, and the theme, as in
   [Check a site](../check-a-site/).
