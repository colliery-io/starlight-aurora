---
title: Add the API docs from plissken
description: Put the API reference that plissken generates into the site, under Reference.
sidebar:
  order: 9
---

[plissken](https://colliery-io.github.io/plissken/) 0.1.0 and later writes API
docs for Rust and Python (PyO3) code as Starlight pages. They go into the site,
under Reference. rustdoc stays on docs.rs; link to it from the reference page.

## Procedure

1. In the repository's `plissken.toml`, set the Starlight template and the
   output folder:

   ```toml
   [output]
   format = "markdown"
   path = "docs/src/content/docs/reference/api"
   template = "starlight"

   [rust]
   crates = ["crates/my-lib"]
   ```

   List the library crates. A binary's items are private, so its pages are
   almost empty.

2. Render the pages:

   ```sh
   plissken render
   ```

   plissken writes the pages and `_sidebar.mjs`, a Starlight sidebar group
   named "API reference".

3. Add the group to the Reference section in `docs/astro.config.mjs`:

   ```js
   import { existsSync } from 'node:fs';

   // The API pages come from plissken. Without them the site still builds.
   const apiSidebarFile = new URL('./src/content/docs/reference/api/_sidebar.mjs', import.meta.url);
   const apiGroups = existsSync(apiSidebarFile) ? [(await import(apiSidebarFile.href)).default] : [];

   sidebar: [
     // ...
     { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }, ...apiGroups] },
   ],
   ```

   The pages have `sidebar: { hidden: true }`, so the Reference autogenerate
   does not list them a second time.

4. Choose: commit the pages, or make them in the docs build.

   - **Commit them**: run `plissken render` after a code change, and commit
     the result.
   - **Make them in the build**: add `docs/src/content/docs/reference/api/` to
     `.gitignore`, and in `.github/workflows/docs.yml` download the plissken
     release binary (check its sha256) and run `plissken render` before the
     Astro build. Add the crates' source folders to the workflow's `paths`.
     The pages are not in git, so drop the "Edit page" link for them.

## Known gaps in plissken 0.1.0

The plissken task PLSKN-T-0057 lists them. The main ones: rustdoc links such as
`[x](crate::path)` become broken links (write `` [`crate::path`] `` instead);
signatures keep spaces between tokens; two items with one name can get each
other's cross-links.
