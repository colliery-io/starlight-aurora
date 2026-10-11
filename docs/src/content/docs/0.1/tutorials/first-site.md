---
title: Start a docs site
description: Make a docs site for a repository from the starter, and see it in the browser.
slug: 0.1/tutorials/first-site
---

In this tutorial, you add a docs site to a repository. At the end, the site
runs on your computer in the Aurora theme.

## Before you start

You need:

* Node 22 or later.
* Git.
* A repository with no `docs/` folder. To try the starter, make a new one:

  ```sh
  mkdir my-project && cd my-project && git init
  ```

## 1. Copy the starter

Get the starter and copy its three parts into the repository:

```sh
git clone --depth 1 --branch v0.1.0 https://github.com/colliery-io/starlight-aurora /tmp/starlight-aurora
cp -R /tmp/starlight-aurora/template/docs /tmp/starlight-aurora/template/.github /tmp/starlight-aurora/template/.angreal .
rm -rf /tmp/starlight-aurora
```

You now have:

```text
docs/                        the site
.github/workflows/docs.yml   the GitHub Pages workflow
.angreal/task_docs.py        angreal docs build and angreal docs serve
```

## 2. Name the project

Open `docs/astro.config.mjs`. Change these two lines:

```js
const PROJECT = 'Project';
const REPO = 'https://github.com/colliery-io/project';
```

## 3. Start the site

```sh
cd docs
npm install
npm run dev
```

If you use angreal, `angreal docs serve` does the same from the root of the
repository.

Open http://localhost:4321. You see the home page with four cards: Tutorials,
How-to guides, Reference and Explanation.

## 4. Change a page

Open `docs/src/content/docs/index.mdx`. Replace the text after `CHANGE —` and
save the file. The browser shows the change.

## 5. Try the themes

Use the theme select at the top right. Choose Light, then Dark. Auto follows
the setting of your operating system.

## Next steps

* Write the pages: [the Diátaxis sections](../../explanation/how-it-works/#the-starter).
* Publish the site: in GitHub, set Settings → Pages → Source to "GitHub Actions", and push to `main`.
* [Turn on hyper](../../how-to/turn-on-hyper/).
