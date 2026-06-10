#!/usr/bin/env bash
#
# Sync the public Cardugo static site from the private Cardugo repo's Docs/
# folder into ./site, ready to commit and push to this public repo.
#
# Only the public web assets are copied (index.html, privacy.html, i18n.js) —
# internal product notes (CHANGES.md, PRODUCT_INTRODUCTION.md) are deliberately
# left out.
#
# Usage:
#   scripts/sync-from-cardugo.sh [SOURCE_DOCS_DIR] [--commit]
#
#   SOURCE_DOCS_DIR  Path to the Cardugo repo's Docs/ folder.
#                    Defaults to ../cardugo/Cardugo/Docs (relative to this repo).
#   --commit         Stage and commit the synced files if anything changed.
#
# Examples:
#   scripts/sync-from-cardugo.sh
#   scripts/sync-from-cardugo.sh ~/project/cardugo/Cardugo/Docs
#   scripts/sync-from-cardugo.sh --commit
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SRC=""
COMMIT=0
for arg in "$@"; do
  case "$arg" in
    --commit) COMMIT=1 ;;
    *)        SRC="$arg" ;;
  esac
done
SRC="${SRC:-$REPO_ROOT/../cardugo/Cardugo/Docs}"
DEST="$REPO_ROOT/site"

FILES=(index.html privacy.html i18n.js)

if [ ! -d "$SRC" ]; then
  echo "error: source Docs directory not found: $SRC" >&2
  echo "Pass it explicitly, e.g. scripts/sync-from-cardugo.sh /path/to/Cardugo/Docs" >&2
  exit 1
fi

mkdir -p "$DEST"
for f in "${FILES[@]}"; do
  if [ ! -f "$SRC/$f" ]; then
    echo "error: missing $SRC/$f" >&2
    exit 1
  fi
  cp "$SRC/$f" "$DEST/$f"
  echo "synced  $f"
done

echo "Done. Source: $SRC"

if [ "$COMMIT" -eq 1 ]; then
  cd "$REPO_ROOT"
  git add site
  if git diff --cached --quiet; then
    echo "No changes to commit."
  else
    git commit -m "chore: sync static site from Cardugo/Docs"
    echo "Committed. Push with: git push"
  fi
else
  echo "Review with 'git -C \"$REPO_ROOT\" status', then commit and push,"
  echo "or re-run with --commit to do it automatically."
fi
