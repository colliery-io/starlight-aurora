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

6. On GitHub, set Settings → Pages → Source to "GitHub Actions".

## The theme version

`docs/package.json` installs the theme from a tag:

```json
"starlight-aurora": "github:colliery-io/starlight-aurora#v0.1.0"
```

To update the theme, change the tag and run `npm install` in `docs/`.

## Hyper

To offer Aurora's hyper theme, give the plugin the option `hyper: true` in
`docs/astro.config.mjs`:

```js
plugins: [starlightAurora({ hyper: true })],
```

## API reference

Do not put the rustdoc or the Python API docs in this site. Link to them from
`reference/index.md`.
