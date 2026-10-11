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

1. Copy the starter into the root of your repository:

   ```sh
   git clone --depth 1 https://github.com/colliery-io/starlight-aurora /tmp/starlight-aurora
   cp -R /tmp/starlight-aurora/template/docs /tmp/starlight-aurora/template/.github /tmp/starlight-aurora/template/.angreal .
   rm -rf /tmp/starlight-aurora
   ```

   If your repository has a `docs/` folder, a `.github/workflows/docs.yml` or an
   `.angreal/task_docs.py` already, move them first.

2. In `docs/astro.config.mjs`, change `PROJECT` and `REPO`.
3. Find each `CHANGE` in `docs/src/content/docs/` and replace it.
4. Build the site:

   ```sh
   angreal docs build    # or: cd docs && npm install && npm run build
   ```

5. Serve the site with live reload:

   ```sh
   angreal docs serve    # or: cd docs && npm run dev
   ```

   In a terminal, the server runs until you stop it with Ctrl+C. From a
   script or an agent, Astro starts it in the background: stop it with
   `npx astro dev stop` in `docs/`.

6. On GitHub, set Settings → Pages → Source to "GitHub Actions".
7. Commit `docs/package-lock.json`. The workflow then uses `npm ci`, and each
   build is the same. In the lockfile, the theme is a git commit of its tag.
8. Change `docs/public/favicon.svg` to the project's icon, or keep Aurora's.

## Warnings you can ignore

Each build prints these. They are expected:

- `Entry docs → 404 was not found.` Starlight uses its own 404 page.
- `The Sitemap integration requires the site astro.config option.` Only on a
  local build and on a pull request, where `DOCS_SITE` is empty. On `main` the
  workflow sets it.

## The theme version

`docs/package.json` installs the theme from a tag:

```json
"starlight-aurora": "github:colliery-io/starlight-aurora#v0.2.1"
```

To update the theme, change the tag and run `npm install` in `docs/`.

## Hyper

To offer Aurora's hyper theme, give the plugin the option `hyper: true` in
`docs/astro.config.mjs`:

```js
plugins: [starlightAurora({ hyper: true })],
```

## Move a book from mdBook

See https://colliery-io.github.io/starlight-aurora/how-to/move-from-mdbook/.

## Versioned docs

To keep the docs of each release, with a version select, add
[starlight-versions](https://starlight-versions.vercel.app). See
https://colliery-io.github.io/starlight-aurora/how-to/versioned-docs/.

## API reference

Do not put the rustdoc or the Python API docs in this site. Link to them from
`reference/index.md`.
