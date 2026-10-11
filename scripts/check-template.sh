#!/usr/bin/env bash
# Copies template/ into a new empty repository, as the template README tells a
# person to, with the theme from this checkout. Then it builds the site with
# the angreal task (when angreal is installed) or npm, checks it in Chrome, and
# builds it again under a Pages base path to check the links.
#
#   scripts/check-template.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$WORK"
git init -q
echo "# A repository" > README.md
# The copy step of template/README.md.
cp -R "$ROOT/template/docs" "$ROOT/template/.github" "$ROOT/template/.angreal" .
grep -q "^# A repository" README.md || { echo "the copy changed README.md" >&2; exit 1; }
node -e '
  const fs = require("fs");
  const p = "docs/package.json";
  const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
  pkg.dependencies["starlight-aurora"] = "file:" + process.argv[1];
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
' "$ROOT"

if command -v angreal >/dev/null; then
  echo "build: angreal docs build"
  angreal docs build
else
  echo "build: npm (no angreal)"
  (cd docs && npm install --no-audit --no-fund && npm run build)
fi

node "$ROOT/scripts/check-build.mjs" docs/dist
(cd "$ROOT" && node scripts/check-site.mjs "$WORK/docs/dist")

# Under a Pages base path, the links of the home page keep the base.
(cd docs && DOCS_SITE=https://example.github.io DOCS_BASE=/project npx astro build >/dev/null)
for href in /project/tutorials/first-steps/ /project/how-to/example/ /project/reference/ /project/explanation/; do
  grep -q "href=\"$href\"" docs/dist/index.html || { echo "base path: no link to $href" >&2; exit 1; }
done
echo "base path: the home page links keep /project/"

# The Mermaid block is a diagram, not a code block.
grep -q 'class="mermaid"' docs/dist/how-to/example/index.html || { echo "mermaid: no diagram" >&2; exit 1; }
echo "mermaid: the how-to page has a diagram"
