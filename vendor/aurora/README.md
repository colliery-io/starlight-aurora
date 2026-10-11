# Vendored Aurora CSS

These files are copies of the CSS of Aurora, the Colliery design system
(https://github.com/colliery-io/aurora, Apache-2.0). `source.json` records
the tag and the commit that they come from.

Do not edit these files. CI (`npm run check:vendor`) fails when a file is
different from the file at the recorded tag.

To move to a new Aurora release:

```sh
npm run vendor:update -- v0.6.0
```

The command downloads the files at the tag, writes them here, and writes the
tag and its commit into `source.json`.
