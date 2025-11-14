# MPLP CLI - Vollständige Nutzungsanleitung

> **🌐 Sprachnavigation**: [English](../../../en/development-tools/cli/README.md) | [中文](../../../zh-CN/development-tools/cli/README.md) | [日本語](../../../ja/development-tools/cli/README.md) | [한국어](../../../ko/development-tools/cli/README.md) | [Español](../../../es/development-tools/cli/README.md) | [Français](../../../fr/development-tools/cli/README.md) | [Русский](../../../ru/development-tools/cli/README.md) | [Deutsch](README.md)


> **Paket**: @mplp/cli  
> **Version**: v1.1.0  
> **Letztes Update**: 2025-09-20  
> **Status**: ✅ Produktionsbereit  

## 📚 **Überblick**

MPLP CLI ist eine umfassende Kommandozeilenschnittstelle für die Multi-Agent Protocol Lifecycle Platform. Es bietet leistungsstarke Tools für Projekterstellung, Entwicklungsworkflow-Management, Code-Generierung, Tests und Deployment mit Enterprise-Level-Features und umfangreichen Anpassungsoptionen.

### **🎯 Hauptfunktionen**

- **🚀 Projekt-Scaffolding**: Neue MPLP-Projekte mit mehreren Vorlagen erstellen (Basic, Advanced, Enterprise)
- **📋 Code-Generierung**: Agenten, Workflows, Konfigurationen und andere Komponenten generieren
- **🔧 Entwicklungsserver**: Integrierter Entwicklungsserver mit Hot-Reload und Debugging-Unterstützung
- **🏗️ Build-System**: Produktionsbereite Build- und Optimierungstools
- **🧪 Test-Integration**: Umfassende Test-Utilities und Coverage-Berichte
- **📊 Code-Qualität**: Code-Qualitätsprüfungen, Linting und automatische Formatierung
- **📦 Paket-Management**: Unterstützung für npm, yarn und pnpm mit automatischer Erkennung
- **🌐 Git-Integration**: Automatische Git-Repository-Initialisierung und Workflow-Unterstützung
- **📚 Template-System**: Erweiterbares Template-System mit benutzerdefinierten Projektstrukturen
- **🔍 Projekt-Analyse**: Detaillierte Projektinformationen und Abhängigkeitsanalyse

### **📦 Installation**

```bash
# Globale Installation (empfohlen)
npm install -g @mplp/cli

# Mit yarn
yarn global add @mplp/cli

# Mit pnpm
pnpm add -g @mplp/cli

# Installation überprüfen
mplp --version
```

## 🚀 **Schnellstart**

### **Ihr Erstes Projekt Erstellen**

```bash
# Basis-Projekt erstellen
mplp init my-first-agent

# Zum Projekt navigieren
cd my-first-agent

# Entwicklung starten
mplp dev

# Für Produktion bauen
mplp build
```

### **Verschiedene Vorlagen Verwenden**

```bash
# Basis-Vorlage (Standard)
mplp init simple-agent --template basic

# Erweiterte Vorlage mit Orchestrierung
mplp init complex-system --template advanced

# Enterprise-Vorlage mit vollständiger Toolchain
mplp init production-system --template enterprise
```

## 📋 **Befehlsreferenz**

### **mplp init**

Ein neues MPLP-Projekt mit anpassbaren Vorlagen und Konfigurationen erstellen.

#### **Syntax**

```bash
mplp init <projektname> [optionen]
```

#### **Optionen**

- `--template, -t <vorlage>`: Projektvorlage (basic, advanced, enterprise)
- `--description, -d <beschreibung>`: Projektbeschreibung
- `--author, -a <autor>`: Projektautor
- `--license, -l <lizenz>`: Projektlizenz (MIT, Apache-2.0, etc.)
- `--package-manager, -pm <manager>`: Paket-Manager (npm, yarn, pnpm)
- `--git, -g`: Git-Repository initialisieren (Standard: true)
- `--install, -i`: Abhängigkeiten nach Erstellung installieren (Standard: true)
- `--typescript, -ts`: TypeScript verwenden (Standard: true)
- `--eslint`: ESLint-Konfiguration hinzufügen (Standard: true)
- `--prettier`: Prettier-Konfiguration hinzufügen (Standard: true)
- `--jest`: Jest-Test-Framework hinzufügen (Standard: true)
- `--force, -f`: Vorhandenes Verzeichnis überschreiben
- `--dry-run`: Zeigen was erstellt würde ohne tatsächlich zu erstellen

#### **Beispiele**

```bash
# Basis-Projekterstellung
mplp init my-agent

# Erweiterte Projekt mit benutzerdefinierten Einstellungen
mplp init enterprise-bot \
  --template enterprise \
  --description "Enterprise-Chatbot-System" \
  --author "Ihr Name" \
  --license MIT \
  --package-manager yarn

# Schnelle Einrichtung ohne Prompts
mplp init quick-agent --template basic --force --no-git

# Dry-Run zur Strukturvorschau
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

Code-Komponenten, Konfigurationen und Boilerplate-Code generieren.

#### **Syntax**

```bash
mplp generate <typ> <name> [optionen]
```

#### **Typen**

- `agent`: Neue Agent-Klasse generieren
- `workflow`: Workflow-Konfiguration generieren
- `adapter`: Plattform-Adapter generieren
- `config`: Konfigurationsdateien generieren
- `test`: Test-Dateien generieren
- `component`: Benutzerdefinierte Komponenten generieren

#### **Optionen**

- `--output, -o <pfad>`: Ausgabeverzeichnis
- `--template, -t <vorlage>`: Generierungsvorlage
- `--overwrite, -w`: Vorhandene Dateien überschreiben
- `--dry-run`: Generierten Code vorschauen

#### **Beispiele**

```bash
# Neuen Agent generieren
mplp generate agent ChatBot --output src/agents

# Workflow generieren
mplp generate workflow DataProcessing --template advanced

# Plattform-Adapter generieren
mplp generate adapter CustomPlatform --output src/adapters

# Test-Dateien generieren
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

Entwicklungsserver mit Hot-Reload und Debugging-Unterstützung starten.

#### **Syntax**

```bash
mplp dev [optionen]
```

#### **Optionen**

- `--port, -p <port>`: Entwicklungsserver-Port (Standard: 3000)
- `--host, -h <host>`: Entwicklungsserver-Host (Standard: localhost)
- `--open, -o`: Browser automatisch öffnen
- `--watch, -w <pfade>`: Zusätzliche Pfade zum Überwachen
- `--ignore, -i <muster>`: Zu ignorierende Muster
- `--debug, -d`: Debug-Modus aktivieren
- `--verbose, -v`: Ausführliche Protokollierung
- `--no-reload`: Hot-Reload deaktivieren
- `--inspect`: Node.js-Inspektor aktivieren

#### **Beispiele**

```bash
# Entwicklungsserver starten
mplp dev

# Benutzerdefinierter Port und Host
mplp dev --port 8080 --host 0.0.0.0

# Debug-Modus mit Inspektor
mplp dev --debug --inspect

# Zusätzliche Verzeichnisse überwachen
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

Projekt für Produktion mit Optimierung und Bundling bauen.

#### **Syntax**

```bash
mplp build [optionen]
```

#### **Optionen**

- `--output, -o <verzeichnis>`: Ausgabeverzeichnis (Standard: dist)
- `--mode, -m <modus>`: Build-Modus (production, development)
- `--target, -t <ziel>`: Build-Ziel (node, browser, both)
- `--minify`: Ausgabe minifizieren (Standard: true in Produktion)
- `--sourcemap`: Source-Maps generieren
- `--analyze`: Bundle-Größe analysieren
- `--clean`: Ausgabeverzeichnis vor Build bereinigen
- `--watch, -w`: Watch-Modus für Entwicklung

#### **Beispiele**

```bash
# Produktions-Build
mplp build

# Entwicklungs-Build mit Source-Maps
mplp build --mode development --sourcemap

# Für Node.js und Browser bauen
mplp build --target both --analyze

# Build im Watch-Modus
mplp build --watch --mode development
```
