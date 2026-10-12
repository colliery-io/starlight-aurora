---
title: Keep the docs of each release
description: Keep the docs of earlier releases, with a version select, through starlight-versions.
sidebar:
  order: 5
---

The theme works with the Starlight plugin
[starlight-versions](https://starlight-versions.vercel.app). The docs of each
earlier release stay at `/<version>/`, and a version select shows next to the
theme select. This site uses it: the select shows Latest and v0.1.

## Procedure

1. Install the plugin in the site:

   ```sh
   npm install starlight-versions
   ```

2. In `src/content.config.ts`, add the `versions` collection:

   ```ts
   import { docsVersionsLoader } from 'starlight-versions/loader';

   export const collections = {
     docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
     versions: defineCollection({ loader: docsVersionsLoader() }),
   };
   ```

3. In `astro.config.mjs`, add the plugin after `starlightAurora()`. Give it the
   release that the docs show now:

   ```js
   import starlightVersions from 'starlight-versions';

   plugins: [
     starlightAurora({ hyper: true }),
     starlightVersions({ versions: [{ slug: '1.0' }] }),
   ],
   ```

4. Build the site. The first build with a new version copies the current docs
   into `src/content/docs/1.0/` and writes `src/content/versions/1.0.json`.
5. Compare the copy with the current pages, and commit the new files. From now
   on, change only the current docs.

   starlight-versions writes the copied pages again without GitHub tables'
   escapes, and reads them as MDX: `\|` in a table cell splits the cell, and
   `<`, `{` or `}` in text stops the build. Fix the copy by hand, or copy the
   source pages over it and add the `slug:` line that it wrote.
6. At the next release, add its slug at the start of `versions` and build again.

## Old versions from before the move

A Pages deploy from a workflow replaces the whole site. To keep an old
version folder that the new site does not build (an mdBook copy, for example),
build it in the docs workflow on each deploy and put it in the uploaded site,
as GraphQLite does for its v0.9.2 mdBook docs.

## With hyper

starlight-versions and hyper both replace Starlight's theme select. With
`hyper: true`, starlight-aurora shows the version select in its own theme
select, in either order of the two plugins. The build then prints this warning
from starlight-versions. You can ignore it:

```text
A `<ThemeSelect>` component override is already defined in your Starlight configuration.
```
