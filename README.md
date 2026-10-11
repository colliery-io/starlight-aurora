# starlight-aurora

Aurora, the Colliery design system, as a theme for
[Astro Starlight](https://starlight.astro.build). The Colliery docs use it.

The docs: https://colliery-io.github.io/starlight-aurora/ (built with the
theme, hyper on).

## Install

Install the theme from git. Use a tag:

```sh
npm install github:colliery-io/starlight-aurora#v0.2.1
```

Add the plugin to `astro.config.mjs`:

```js
import starlight from '@astrojs/starlight';
import starlightAurora from 'starlight-aurora';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My docs',
      plugins: [starlightAurora()],
    }),
  ],
});
```

## Options

| Option | Default | What it does |
|---|---|---|
| `hyper` | `false` | Loads Aurora's hyper theme and adds Hyper to the theme select |

With `hyper: true` the plugin replaces Starlight's `ThemeProvider` and
`ThemeSelect`. A site that replaces either of them too gets an error. Under
hyper, code blocks use the dark code theme. The plugin works with
[starlight-versions](https://starlight-versions.vercel.app): with hyper on,
its theme select also shows the version select.

## What the theme does

- Maps Starlight's colour, shadow and font variables onto Aurora's tokens
  (`styles/theme.css`). Light, dark and auto all come from one mapping,
  because Aurora's tokens are `light-dark()` pairs.
- Gives code blocks Aurora's fonts and radius. Your own
  `expressiveCode.styleOverrides` win.
- Your own `customCss` loads after the theme, so it wins.

## Starter

`template/` is a docs site to copy into a repository: the theme, the Diátaxis
sections, Mermaid, an angreal task and a Pages workflow. See
[template/README.md](template/README.md).

## Components

`StatusBadge` is Aurora's status badge. Import it in an MDX page:

```mdx
import StatusBadge from 'starlight-aurora/components/StatusBadge.astro';

<StatusBadge status="running" />
<StatusBadge status="healthy" hue="ok" />
```

Aurora's statuses choose their hue: running (ice), completed (ok), failed
(bad), scheduled (violet), pending and paused (muted), cancelled (gold),
skipped (skip). Another status is muted. `hue` sets the hue: ice, teal,
violet, gold, ok, bad, skip or muted.

## Moving from mdBook

`starlight-aurora/mdbook-redirects` is an Astro integration that writes a
redirect page at each old mdBook address (`<path>.html`). See
https://colliery-io.github.io/starlight-aurora/how-to/move-from-mdbook/.

## Aurora CSS

`vendor/aurora/` holds the CSS of Aurora at one tag. See
[vendor/aurora/README.md](vendor/aurora/README.md).

## Develop

```sh
npm test                 # unit tests
npm run check:vendor     # vendored CSS matches the Aurora tag
npm --prefix docs ci     # install the docs site
npm run docs:dev         # serve the docs site
npm run docs:build && npm run docs:check   # needs Chrome
node scripts/check-links.mjs docs/dist     # internal links and anchors
scripts/check-template.sh                  # the starter, end to end
```

## Licence

Apache-2.0. The files in `vendor/aurora/` come from
[Aurora](https://github.com/colliery-io/aurora), also Apache-2.0.
