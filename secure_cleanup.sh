#!/bin/bash

echo "🧹 Nettoyage de l'historique Git pour supprimer les secrets..."

# Vérifie si git-filter-repo est installé
if ! command -v git-filter-repo &> /dev/null
then
    echo "❌ git-filter-repo n'est pas installé. Installe-le avec:"
    echo "    pip install git-filter-repo"
    exit 1
fi

# Supprimer toute trace de .env de l'historique Git
git filter-repo --path .env --invert-paths

# Réinitialiser les remotes si besoin
git remote remove origin
git remote add origin https://github.com/teetee971/neostudio.git

# Réajouter le .gitignore s’il a sauté
echo ".env" > .gitignore
git add .gitignore
git commit -m "🔒 Ajout de .env au .gitignore (sécurisé)"

# Push forcé maintenant que le token est effacé de l’historique
git push --force origin main

echo "✅ Secret supprimé de l’historique et push final effectué avec succès."