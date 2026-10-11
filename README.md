# starlight-aurora

Aurora, the Colliery design system, as a theme for
[Astro Starlight](https://starlight.astro.build). The Colliery docs use it.

## Install

Install the theme from git. Use a tag:

```sh
npm install github:colliery-io/starlight-aurora#v0.1.0
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
hyper, code blocks use the dark code theme.

## What the theme does

- Maps Starlight's colour, shadow and font variables onto Aurora's tokens
  (`styles/theme.css`). Light, dark and auto all come from one mapping,
  because Aurora's tokens are `light-dark()` pairs.
- Gives code blocks Aurora's fonts and radius. Your own
  `expressiveCode.styleOverrides` win.
- Your own `customCss` loads after the theme, so it wins.

## Aurora CSS

`vendor/aurora/` holds the CSS of Aurora at one tag. See
[vendor/aurora/README.md](vendor/aurora/README.md).

## Develop

```sh
npm test                 # unit tests
npm run check:vendor     # vendored CSS matches the Aurora tag
npm --prefix demo ci     # install the demo site
npm run demo:dev         # serve the demo site
npm run demo:build && npm run demo:check   # needs Chrome
```

## Licence

Apache-2.0. The files in `vendor/aurora/` come from
[Aurora](https://github.com/colliery-io/aurora), also Apache-2.0.
