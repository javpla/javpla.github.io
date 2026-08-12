#!/usr/bin/env bash
# Usage: ./publish.sh <owner/repo>
#
# Clones the latest main of <owner/repo>, runs its build_artifacts.sh from
# this repo's root (which writes directly to ./<repo-name>/), then creates a
# branch publish/<repo-name>/<short-hash> and a descriptive commit.
set -euo pipefail

PUBDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <owner/repo>" >&2
  exit 1
fi

ORIGIN_REPO="$1"                          # e.g. javpla/twister-spin
REPO_NAME="${ORIGIN_REPO##*/}"            # e.g. twister-spin
CLONE_URL="https://github.com/${ORIGIN_REPO}.git"
REPO_DIR="$(dirname "$PUBDIR")/$REPO_NAME"

if [[ -d "$REPO_DIR/.git" ]]; then
  echo "==> Found existing clone at $REPO_DIR, fetching latest main..."
  git -C "$REPO_DIR" fetch origin main
  git -C "$REPO_DIR" checkout main
  git -C "$REPO_DIR" reset --hard origin/main
else
  echo "==> Cloning $ORIGIN_REPO..."
  git clone "$CLONE_URL" "$REPO_DIR"
fi

COMMIT_HASH="$(git -C "$REPO_DIR" rev-parse HEAD)"
SHORT_HASH="${COMMIT_HASH:0:5}"

if [[ ! -f "$REPO_DIR/build_artifacts.sh" ]]; then
  echo "Error: $ORIGIN_REPO does not contain build_artifacts.sh" >&2
  exit 1
fi

BRANCH="publish/${REPO_NAME}/${SHORT_HASH}"
echo "==> Creating branch $BRANCH..."
git -C "$PUBDIR" checkout -b "$BRANCH"

echo "==> Running build_artifacts.sh (commit $COMMIT_HASH)..."
chmod +x "$REPO_DIR/build_artifacts.sh"
(cd "$PUBDIR" && "$REPO_DIR/build_artifacts.sh")

echo "==> Committing..."
git -C "$PUBDIR" add "$REPO_NAME"
git -C "$PUBDIR" commit \
  --message "publish: ${REPO_NAME} ${COMMIT_HASH}" \
  --message "Source: https://github.com/${ORIGIN_REPO}/commit/${COMMIT_HASH}"

echo ""
echo "Done. Branch '$BRANCH' is ready."
echo "Push with: git -C '$PUBDIR' push origin $BRANCH"
