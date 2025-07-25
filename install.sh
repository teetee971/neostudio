#!/bin/bash

echo "🛠️ NeoStudio Deploy Manager"
echo "----------------------------"
echo "1. Déploiement Firebase CI (avec clé)"
echo "2. Déploiement Firebase manuel"
echo "3. Push Git auto"
echo "4. Tout faire"
echo "----------------------------"
read -p "👉 Choix (1-4) : " choice

case $choice in
  1)
    echo "🔐 Lancement déploiement CI..."
    ./deploy_ci.sh
    ;;
  2)
    echo "👤 Lancement déploiement manuel..."
    ./deploy.sh
    ;;
  3)
    echo "📤 Git auto push..."
    ./git_push_auto.sh
    ;;
  4)
    echo "🔄 Push Git + Déploiement Firebase CI..."
    ./git_push_auto.sh
    ./deploy_ci.sh
    ;;
  *)
    echo "❌ Choix invalide."
    ;;
esac