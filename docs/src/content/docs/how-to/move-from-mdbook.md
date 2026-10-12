---
title: Move a book from mdBook
description: Move an mdBook book to Starlight with the starter, and keep its old addresses working.
sidebar:
  order: 7
---

Six Colliery books moved this way: Kairos (the first, KAIROS-T-0389), Squire,
Arawn, GraphQLite, Mimir and Brokkr. These steps come from those moves.

## Procedure

1. Copy the starter into the repository, as in
   [Start a docs site](../../tutorials/first-site/). Move the old `docs/`
   folder away first, for example to `docs-mdbook/`.

2. Convert the pages with the converter that the theme ships:

   ```sh
   cd docs && npm ci && cd ..
   npx --prefix docs starlight-aurora-from-mdbook docs-mdbook/src docs/src/content/docs > sidebar.json
   ```

   For each page, the converter:

   - makes the first `# Heading` the front-matter `title`, and removes it;
   - removes a `---` rule right after that heading (with front matter, it
     would swallow the first section);
   - rewrites links to other pages (`page.md#anchor`, `page.html`) as relative
     routes (`../page/#anchor`), which work under the Pages base path;
   - writes `README.md` as `index.md`.

   It writes a Starlight sidebar made from `SUMMARY.md` to `sidebar.json`, with
   the parts, the `##` groups and SUMMARY's labels.

3. Put the pages in their Diátaxis sections (tutorials, how-to, reference,
   explanation), and paste the sidebar into `docs/astro.config.mjs`. If a page
   moves to a new folder, change its slug in the sidebar and add its old
   address to the redirects (step 6).

4. Put images in `docs/src/assets/images/`, outside the content folder, and
   change their links. Do not link to a file in `src/assets` with a plain
   link: it does not resolve. Link to the page that shows the image, or put
   files to link to in `docs/public/`.

5. Set the theme's options in `docs/astro.config.mjs`. The starter turns off
   titles taken from a code block's first line (a first-line comment such as
   `# Expected: /home/…` would become the block's title and disappear).

6. Keep the old addresses working. Add the redirect integration:

   ```js
   import mdbookRedirects from 'starlight-aurora/mdbook-redirects';

   integrations: [
     mermaid({ theme: 'dark', autoTheme: true }),
     mdbookRedirects(),
     starlight({ /* ... */ }),
   ],
   ```

   After each build, it writes a small page at each old address
   (`how-to/set-up-a-board.html`) that sends the reader to the new one, and
   keeps the `#anchor`. `introduction.html` and `print.html` go to the home
   page. A `README.md` page needs no redirect: mdBook served it as
   `index.html`, which is still a page.

   Give it more addresses with `extra`. They are added to the defaults, and
   `null` removes a default:

   ```js
   mdbookRedirects({
     extra: {
       'intro.html': './', // the old home page
       'getting-started/installation.html': '../how-to/installation/', // a page that moved
       'print.html': null, // no redirect for print.html
     },
   })
   ```

   Each target is relative to the old address. It never writes over a page of
   the site.

7. If the repository has an `.angreal/task_docs.py` already, merge the
   starter's `docs build` and `docs serve` into it. The starter finds the
   repository root with `Path(angreal.get_root()).parent`; use the
   repository's own root helper if it has one.

8. Remove `book.toml`, `SUMMARY.md` and the old theme folder.

9. Check the build, its links, and the theme:

   ```sh
   cd docs && npm run build && cd ..
   npx --prefix docs starlight-aurora-check-links docs/dist
   DOCS_SITE=https://example.github.io DOCS_BASE=/my-repo npm --prefix docs run build -- --outDir dist-base
   npx --prefix docs starlight-aurora-check-links docs/dist-base --base /my-repo/
   npx --prefix docs starlight-aurora-check-site docs/dist --hyper
   ```

   See [Check a site](../check-a-site/).

## Publish to another repository

The starter's workflow publishes to the repository's own Pages. To publish to
another repository, as Mimir does (`mimir-dm/mimir-dm.github.io`), keep the
build steps and replace the deploy job with `peaceiris/actions-gh-pages`, a
deploy token in the repository's secrets, and `external_repository`. Build
with `DOCS_SITE` set to that site and `DOCS_BASE=/` if it serves at the root.
