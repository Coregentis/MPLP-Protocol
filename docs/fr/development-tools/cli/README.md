# MPLP CLI - Guide d'Utilisation Complet

> **🌐 Navigation Linguistique**: [English](../../../en/development-tools/cli/README.md) | [中文](../../../zh-CN/development-tools/cli/README.md) | [日本語](../../../ja/development-tools/cli/README.md) | [한국어](../../../ko/development-tools/cli/README.md) | [Español](../../../es/development-tools/cli/README.md) | [Français](README.md) | [Русский](../../../ru/development-tools/cli/README.md) | [Deutsch](../../../de/development-tools/cli/README.md)


> **Package**: @mplp/cli  
> **Version**: v1.1.0  
> **Dernière Mise à Jour**: 2025-09-20  
> **Statut**: ✅ Prêt pour la Production  

## 📚 **Aperçu**

MPLP CLI est une interface en ligne de commande complète pour la Plateforme de Cycle de Vie des Protocoles Multi-Agents. Il fournit des outils puissants pour la création de projets, la gestion des flux de travail de développement, la génération de code, les tests et le déploiement avec des fonctionnalités de niveau entreprise et des options de personnalisation étendues.

### **🎯 Fonctionnalités Principales**

- **🚀 Échafaudage de Projet**: Créer de nouveaux projets MPLP avec plusieurs modèles (Basique, Avancé, Entreprise)
- **📋 Génération de Code**: Générer des agents, des flux de travail, des configurations et d'autres composants
- **🔧 Serveur de Développement**: Serveur de développement intégré avec rechargement à chaud et support de débogage
- **🏗️ Système de Construction**: Outils de construction et d'optimisation prêts pour la production
- **🧪 Intégration de Tests**: Utilitaires de test complets et rapports de couverture
- **📊 Qualité du Code**: Vérifications de qualité du code, linting et formatage automatique
- **📦 Gestion des Packages**: Support pour npm, yarn et pnpm avec détection automatique
- **🌐 Intégration Git**: Initialisation automatique du dépôt Git et support des flux de travail
- **📚 Système de Modèles**: Système de modèles extensible avec des structures de projet personnalisées
- **🔍 Analyse de Projet**: Informations détaillées sur le projet et analyse des dépendances

### **📦 Installation**

```bash
# Installation globale (recommandée)
npm install -g @mplp/cli

# Utilisation de yarn
yarn global add @mplp/cli

# Utilisation de pnpm
pnpm add -g @mplp/cli

# Vérifier l'installation
mplp --version
```

## 🚀 **Démarrage Rapide**

### **Créer Votre Premier Projet**

```bash
# Créer un projet basique
mplp init my-first-agent

# Naviguer vers le projet
cd my-first-agent

# Commencer le développement
mplp dev

# Construire pour la production
mplp build
```

### **Utiliser Différents Modèles**

```bash
# Modèle basique (par défaut)
mplp init simple-agent --template basic

# Modèle avancé avec orchestration
mplp init complex-system --template advanced

# Modèle entreprise avec chaîne d'outils complète
mplp init production-system --template enterprise
```

## 📋 **Référence des Commandes**

### **mplp init**

Créer un nouveau projet MPLP avec des modèles et configurations personnalisables.

#### **Syntaxe**

```bash
mplp init <nom-projet> [options]
```

#### **Options**

- `--template, -t <modèle>`: Modèle de projet (basic, advanced, enterprise)
- `--description, -d <description>`: Description du projet
- `--author, -a <auteur>`: Auteur du projet
- `--license, -l <licence>`: Licence du projet (MIT, Apache-2.0, etc.)
- `--package-manager, -pm <gestionnaire>`: Gestionnaire de packages (npm, yarn, pnpm)
- `--git, -g`: Initialiser le dépôt Git (par défaut: true)
- `--install, -i`: Installer les dépendances après création (par défaut: true)
- `--typescript, -ts`: Utiliser TypeScript (par défaut: true)
- `--eslint`: Ajouter la configuration ESLint (par défaut: true)
- `--prettier`: Ajouter la configuration Prettier (par défaut: true)
- `--jest`: Ajouter le framework de test Jest (par défaut: true)
- `--force, -f`: Écraser le répertoire existant
- `--dry-run`: Montrer ce qui serait créé sans créer réellement

#### **Exemples**

```bash
# Création de projet basique
mplp init my-agent

# Projet avancé avec paramètres personnalisés
mplp init enterprise-bot \
  --template enterprise \
  --description "Système de chatbot d'entreprise" \
  --author "Votre Nom" \
  --license MIT \
  --package-manager yarn

# Configuration rapide sans invites
mplp init quick-agent --template basic --force --no-git

# Exécution à sec pour prévisualiser la structure
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

Générer des composants de code, des configurations et du code boilerplate.

#### **Syntaxe**

```bash
mplp generate <type> <nom> [options]
```

#### **Types**

- `agent`: Générer une nouvelle classe d'agent
- `workflow`: Générer une configuration de flux de travail
- `adapter`: Générer un adaptateur de plateforme
- `config`: Générer des fichiers de configuration
- `test`: Générer des fichiers de test
- `component`: Générer des composants personnalisés

#### **Options**

- `--output, -o <chemin>`: Répertoire de sortie
- `--template, -t <modèle>`: Modèle de génération
- `--overwrite, -w`: Écraser les fichiers existants
- `--dry-run`: Prévisualiser le code généré

#### **Exemples**

```bash
# Générer un nouvel agent
mplp generate agent ChatBot --output src/agents

# Générer un flux de travail
mplp generate workflow DataProcessing --template advanced

# Générer un adaptateur de plateforme
mplp generate adapter CustomPlatform --output src/adapters

# Générer des fichiers de test
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

Démarrer le serveur de développement avec rechargement à chaud et support de débogage.

#### **Syntaxe**

```bash
mplp dev [options]
```

#### **Options**

- `--port, -p <port>`: Port du serveur de développement (par défaut: 3000)
- `--host, -h <hôte>`: Hôte du serveur de développement (par défaut: localhost)
- `--open, -o`: Ouvrir le navigateur automatiquement
- `--watch, -w <chemins>`: Chemins supplémentaires à surveiller
- `--ignore, -i <motifs>`: Motifs à ignorer
- `--debug, -d`: Activer le mode débogage
- `--verbose, -v`: Journalisation détaillée
- `--no-reload`: Désactiver le rechargement à chaud
- `--inspect`: Activer l'inspecteur Node.js

#### **Exemples**

```bash
# Démarrer le serveur de développement
mplp dev

# Port et hôte personnalisés
mplp dev --port 8080 --host 0.0.0.0

# Mode débogage avec inspecteur
mplp dev --debug --inspect

# Surveiller des répertoires supplémentaires
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

Construire le projet pour la production avec optimisation et empaquetage.

#### **Syntaxe**

```bash
mplp build [options]
```

#### **Options**

- `--output, -o <répertoire>`: Répertoire de sortie (par défaut: dist)
- `--mode, -m <mode>`: Mode de construction (production, development)
- `--target, -t <cible>`: Cible de construction (node, browser, both)
- `--minify`: Minifier la sortie (par défaut: true en production)
- `--sourcemap`: Générer des cartes de source
- `--analyze`: Analyser la taille du bundle
- `--clean`: Nettoyer le répertoire de sortie avant construction
- `--watch, -w`: Mode surveillance pour le développement

#### **Exemples**

```bash
# Construction de production
mplp build

# Construction de développement avec cartes de source
mplp build --mode development --sourcemap

# Construire pour Node.js et navigateur
mplp build --target both --analyze

# Construction en mode surveillance
mplp build --watch --mode development
```
