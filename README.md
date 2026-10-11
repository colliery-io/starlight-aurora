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
| `hyper` | `false` | Loads Aurora's hyper theme |

## Aurora CSS

`vendor/aurora/` holds the CSS of Aurora at one tag. See
[vendor/aurora/README.md](vendor/aurora/README.md).

## Develop

```sh
npm test                 # unit tests
npm run check:vendor     # vendored CSS matches the Aurora tag
npm --prefix demo ci     # install the demo site
npm run demo:dev         # serve the demo site
npm run demo:build && npm run demo:check
```

## Licence

Apache-2.0. The files in `vendor/aurora/` come from
[Aurora](https://github.com/colliery-io/aurora), also Apache-2.0.
