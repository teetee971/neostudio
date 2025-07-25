#!/bin/bash

BRANCH="main"

if [ ! -d ".git" ]; then
  echo "❌ Ce dossier n'est pas un dépôt Git."
  exit 1
fi

if git diff --quiet && git diff --cached --quiet; then
  echo "✅ Aucun changement à pousser."
  exit 0
fi

git add .

COMMIT_MSG="Auto push - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

git push origin "$BRANCH"

echo "🚀 Push effectué sur la branche '$BRANCH'."