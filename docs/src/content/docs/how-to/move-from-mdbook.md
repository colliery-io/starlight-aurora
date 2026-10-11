---
title: Move a book from mdBook
description: Move an mdBook book to Starlight with the starter, and keep its old addresses working.
sidebar:
  order: 7
---

The Kairos book was the first to move (KAIROS-T-0389). These steps come from
that move.

## Procedure

1. Copy the starter into the repository, as in
   [Start a docs site](../../tutorials/first-site/). Move the old `docs/`
   folder away first, for example to `docs-mdbook/`.
2. Move each page from `docs-mdbook/src/` into
   `docs/src/content/docs/`, in its Diátaxis section. Make the old
   `introduction.md` the home page, `index.md`.
3. In each page, make the first `# Heading` the `title` in the front matter,
   and remove the heading line:

   ```md
   ---
   title: Set up a board
   ---
   ```

4. Write the sidebar out in `docs/astro.config.mjs`, in the order of the old
   `SUMMARY.md`. Use groups for SUMMARY's parts. A written-out sidebar keeps
   SUMMARY's groups and short labels; `sidebar.order` in the front matter
   does not.
5. Change each link to another page from `page.md` (or `page.html`) to a
   relative route: `../../how-to/set-up-a-board/`. A relative link works
   under the Pages base path.
6. Put images in `docs/src/assets/images/`, outside the content folder, and
   change their links.
7. Keep the old addresses working. Add the redirect integration to
   `docs/astro.config.mjs`:

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
   page. To change those, give `mdbookRedirects({ extra: { 'old.html': 'new/' } })`.
   It never writes over a page of the site.

8. If the repository has an `.angreal/task_docs.py` already, merge the
   starter's `docs build` and `docs serve` into it. The starter finds the
   repository root with `Path(angreal.get_root()).parent`; use the
   repository's own root helper if it has one.
9. Remove `book.toml`, `SUMMARY.md` and the old theme folder.
10. Check the build, its links, and the theme:

    ```sh
    cd docs && npm run build && cd ..
    node path/to/starlight-aurora/scripts/check-links.mjs docs/dist
    DOCS_SITE=https://example.github.io DOCS_BASE=/my-repo npx --prefix docs astro build --root docs --outDir dist-base
    node path/to/starlight-aurora/scripts/check-links.mjs docs/dist-base --base /my-repo/
    node path/to/starlight-aurora/scripts/check-site.mjs docs/dist
    ```

    The scripts are in a clone of starlight-aurora; run `npm ci` there first.
