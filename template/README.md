# Docs starter

A docs site for a Colliery repository: Astro Starlight with the Aurora theme,
the four Diátaxis sections, Mermaid diagrams, an angreal task and a GitHub
Pages workflow.

## Contents

| Path | What it is |
|---|---|
| `docs/` | The Starlight site |
| `docs/src/content/docs/` | The pages: `tutorials/`, `how-to/`, `reference/`, `explanation/` |
| `.github/workflows/docs.yml` | Builds the site on each pull request; publishes it to Pages on a push to `main` |
| `.angreal/task_docs.py` | `angreal docs build` and `angreal docs serve` |

## Use it

You need Node 22 or later.

1. On GitHub, set Settings → Pages → Source to "GitHub Actions". The
   workflow's deploy fails while Pages is off.
2. Copy the starter into the root of your repository:

   ```sh
   git clone --depth 1 https://github.com/colliery-io/starlight-aurora /tmp/starlight-aurora
   cp -R /tmp/starlight-aurora/template/docs /tmp/starlight-aurora/template/.github /tmp/starlight-aurora/template/.angreal .
   rm -rf /tmp/starlight-aurora
   ```

   If your repository has a `docs/` folder, a `.github/workflows/docs.yml` or an
   `.angreal/task_docs.py` already, move them first.

3. In `docs/astro.config.mjs`, change `PROJECT` and `REPO`.
4. Find each `CHANGE` in `docs/src/content/docs/` and replace it.
5. Build the site:

   ```sh
   angreal docs build    # or: cd docs && npm install && npm run build
   ```

6. Serve the site with live reload:

   ```sh
   angreal docs serve    # or: cd docs && npm run dev
   ```

   In a terminal, the server runs until you stop it with Ctrl+C. From a
   script or an agent, Astro starts it in the background: stop it with
   `npx astro dev stop` in `docs/`.

7. Commit `docs/package-lock.json`. The workflow then uses `npm ci`, and each
   build is the same. In the lockfile, the theme is a `git+ssh://` URL with
   the commit of its tag: npm saves GitHub dependencies so, and falls back to
   https for a public repository, so CI needs no SSH key. Run `npm ci` inside
   `docs/`, not with `npm --prefix`.
8. Change `docs/public/favicon.svg` to the project's icon, or keep Aurora's.
9. Check the site: https://colliery-io.github.io/starlight-aurora/how-to/check-a-site/.

The theme turns off titles taken from a code block's first line (a first-line
comment with a path otherwise becomes the block's title and disappears). To
turn them on: `expressiveCode: { frames: { extractFileNameFromCode: true } }`.

## Warnings you can ignore

Each build prints these. They are expected:

- `Entry docs → 404 was not found.` Starlight uses its own 404 page.
- `The Sitemap integration requires the site astro.config option.` Only on a
  local build and on a pull request, where `DOCS_SITE` is empty. On `main` the
  workflow sets it.

## The theme version

`docs/package.json` installs the theme from a tag:

```json
"starlight-aurora": "github:colliery-io/starlight-aurora#v0.3.0"
```

To update the theme, change the tag and run `npm install` in `docs/`.

## Hyper

To offer Aurora's hyper theme, give the plugin the option `hyper: true` in
`docs/astro.config.mjs`:

```js
plugins: [starlightAurora({ hyper: true })],
```

## Move a site from mdBook, MkDocs or Hugo

See https://colliery-io.github.io/starlight-aurora/how-to/move-from-mdbook/ and
https://colliery-io.github.io/starlight-aurora/how-to/move-from-mkdocs-or-hugo/.
Known problems: https://colliery-io.github.io/starlight-aurora/reference/troubleshooting/.

## Versioned docs

To keep the docs of each release, with a version select, add
[starlight-versions](https://starlight-versions.vercel.app). See
https://colliery-io.github.io/starlight-aurora/how-to/versioned-docs/.

## API reference

Put the API docs that [plissken](https://colliery-io.github.io/plissken/)
generates into the site, under Reference: see
https://colliery-io.github.io/starlight-aurora/how-to/api-docs/. Link to the
rustdoc on docs.rs from `reference/index.md`.
