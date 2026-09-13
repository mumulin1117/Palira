#!/bin/sh
set -eu
cd "$(dirname "$0")"

# Prefer a regular Node installation; fall back to this Mac's bundled runtime.
if command -v node >/dev/null 2>&1; then
  NODE="$(command -v node)"
else
  NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$NODE" ]; then
  printf '%s\n' 'Node.js 22.13+ is required. Install Node.js LTS, then retry.' >&2
  exit 1
fi
export PATH="$(dirname "$NODE"):$PATH"
"$NODE" -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 13)) { console.error("Node.js 22.13+ is required"); process.exit(1) }'

COMMAND="${1:-dev}"
if [ "$COMMAND" = install ]; then
  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm install --frozen-lockfile --store-dir .paliro-pnpm-store
  fi
  PNPM="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pnpm/bin/pnpm.cjs"
  if [ -f "$PNPM" ]; then
    exec "$NODE" "$PNPM" install --frozen-lockfile --store-dir .paliro-pnpm-store
  fi
  printf '%s\n' 'Install pnpm 11.19.0 (npm install -g pnpm@11.19.0), then retry.' >&2
  exit 1
fi
if [ ! -d node_modules/fastify ]; then
  printf '%s\n' 'Install dependencies first: ./paliro-local.sh install' >&2
  exit 1
fi
case "$COMMAND" in
  dev) exec "$NODE" --env-file-if-exists=.env --import tsx src/paliroServer.ts ;;
  build) exec "$NODE" node_modules/typescript/bin/tsc -p tsconfig.json ;;
  start) exec "$NODE" --env-file-if-exists=.env dist/paliroServer.js ;;
  test) exec "$NODE" --import tsx --test --test-concurrency=1 test/*.test.ts ;;
  smoke) exec "$NODE" scripts/paliroSmoke.mjs ;;
  *) printf '%s\n' 'Usage: ./paliro-local.sh [install|dev|build|start|test|smoke]' >&2; exit 1 ;;
esac
