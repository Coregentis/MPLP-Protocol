# MPLP CLI - Guía de Uso Completa

> **🌐 Navegación de Idiomas**: [English](../../../en/development-tools/cli/README.md) | [中文](../../../zh-CN/development-tools/cli/README.md) | [日本語](../../../ja/development-tools/cli/README.md) | [한국어](../../../ko/development-tools/cli/README.md) | [Español](README.md) | [Français](../../../fr/development-tools/cli/README.md) | [Русский](../../../ru/development-tools/cli/README.md) | [Deutsch](../../../de/development-tools/cli/README.md)


> **Paquete**: @mplp/cli  
> **Versión**: v1.1.0  
> **Última Actualización**: 2025-09-20  
> **Estado**: ✅ Listo para Producción  

## 📚 **Descripción General**

MPLP CLI es una interfaz de línea de comandos integral para la Plataforma de Ciclo de Vida de Protocolos Multi-Agente. Proporciona herramientas poderosas para la creación de proyectos, gestión de flujos de trabajo de desarrollo, generación de código, pruebas y despliegue con características de nivel empresarial y opciones de personalización extensas.

### **🎯 Características Principales**

- **🚀 Andamiaje de Proyectos**: Crear nuevos proyectos MPLP con múltiples plantillas (Básica, Avanzada, Empresarial)
- **📋 Generación de Código**: Generar agentes, flujos de trabajo, configuraciones y otros componentes
- **🔧 Servidor de Desarrollo**: Servidor de desarrollo integrado con recarga en caliente y soporte de depuración
- **🏗️ Sistema de Construcción**: Herramientas de construcción y optimización listas para producción
- **🧪 Integración de Pruebas**: Utilidades de prueba integrales e informes de cobertura
- **📊 Calidad de Código**: Verificaciones de calidad de código, linting y formateo automático
- **📦 Gestión de Paquetes**: Soporte para npm, yarn y pnpm con detección automática
- **🌐 Integración Git**: Inicialización automática de repositorio Git y soporte de flujo de trabajo
- **📚 Sistema de Plantillas**: Sistema de plantillas extensible con estructuras de proyecto personalizadas
- **🔍 Análisis de Proyecto**: Información detallada del proyecto y análisis de dependencias

### **📦 Instalación**

```bash
# Instalación global (recomendada)
npm install -g @mplp/cli

# Usando yarn
yarn global add @mplp/cli

# Usando pnpm
pnpm add -g @mplp/cli

# Verificar instalación
mplp --version
```

## 🚀 **Inicio Rápido**

### **Crear Tu Primer Proyecto**

```bash
# Crear proyecto básico
mplp init my-first-agent

# Navegar al proyecto
cd my-first-agent

# Iniciar desarrollo
mplp dev

# Construir para producción
mplp build
```

### **Usar Diferentes Plantillas**

```bash
# Plantilla básica (por defecto)
mplp init simple-agent --template basic

# Plantilla avanzada con orquestación
mplp init complex-system --template advanced

# Plantilla empresarial con cadena de herramientas completa
mplp init production-system --template enterprise
```

## 📋 **Referencia de Comandos**

### **mplp init**

Crear un nuevo proyecto MPLP con plantillas y configuraciones personalizables.

#### **Sintaxis**

```bash
mplp init <nombre-proyecto> [opciones]
```

#### **Opciones**

- `--template, -t <plantilla>`: Plantilla de proyecto (basic, advanced, enterprise)
- `--description, -d <descripción>`: Descripción del proyecto
- `--author, -a <autor>`: Autor del proyecto
- `--license, -l <licencia>`: Licencia del proyecto (MIT, Apache-2.0, etc.)
- `--package-manager, -pm <gestor>`: Gestor de paquetes (npm, yarn, pnpm)
- `--git, -g`: Inicializar repositorio Git (por defecto: true)
- `--install, -i`: Instalar dependencias después de la creación (por defecto: true)
- `--typescript, -ts`: Usar TypeScript (por defecto: true)
- `--eslint`: Agregar configuración ESLint (por defecto: true)
- `--prettier`: Agregar configuración Prettier (por defecto: true)
- `--jest`: Agregar framework de pruebas Jest (por defecto: true)
- `--force, -f`: Sobrescribir directorio existente
- `--dry-run`: Mostrar lo que se crearía sin crear realmente

#### **Ejemplos**

```bash
# Creación básica de proyecto
mplp init my-agent

# Proyecto avanzado con configuraciones personalizadas
mplp init enterprise-bot \
  --template enterprise \
  --description "Sistema de chatbot empresarial" \
  --author "Tu Nombre" \
  --license MIT \
  --package-manager yarn

# Configuración rápida sin prompts
mplp init quick-agent --template basic --force --no-git

# Ejecución en seco para previsualizar estructura
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

Generar componentes de código, configuraciones y código boilerplate.

#### **Sintaxis**

```bash
mplp generate <tipo> <nombre> [opciones]
```

#### **Tipos**

- `agent`: Generar una nueva clase de agente
- `workflow`: Generar configuración de flujo de trabajo
- `adapter`: Generar adaptador de plataforma
- `config`: Generar archivos de configuración
- `test`: Generar archivos de prueba
- `component`: Generar componentes personalizados

#### **Opciones**

- `--output, -o <ruta>`: Directorio de salida
- `--template, -t <plantilla>`: Plantilla de generación
- `--overwrite, -w`: Sobrescribir archivos existentes
- `--dry-run`: Previsualizar código generado

#### **Ejemplos**

```bash
# Generar un nuevo agente
mplp generate agent ChatBot --output src/agents

# Generar un flujo de trabajo
mplp generate workflow DataProcessing --template advanced

# Generar adaptador de plataforma
mplp generate adapter CustomPlatform --output src/adapters

# Generar archivos de prueba
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

Iniciar el servidor de desarrollo con recarga en caliente y soporte de depuración.

#### **Sintaxis**

```bash
mplp dev [opciones]
```

#### **Opciones**

- `--port, -p <puerto>`: Puerto del servidor de desarrollo (por defecto: 3000)
- `--host, -h <host>`: Host del servidor de desarrollo (por defecto: localhost)
- `--open, -o`: Abrir navegador automáticamente
- `--watch, -w <rutas>`: Rutas adicionales a observar
- `--ignore, -i <patrones>`: Patrones a ignorar
- `--debug, -d`: Habilitar modo de depuración
- `--verbose, -v`: Registro detallado
- `--no-reload`: Deshabilitar recarga en caliente
- `--inspect`: Habilitar inspector de Node.js

#### **Ejemplos**

```bash
# Iniciar servidor de desarrollo
mplp dev

# Puerto y host personalizados
mplp dev --port 8080 --host 0.0.0.0

# Modo de depuración con inspector
mplp dev --debug --inspect

# Observar directorios adicionales
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

Construir el proyecto para producción con optimización y empaquetado.

#### **Sintaxis**

```bash
mplp build [opciones]
```

#### **Opciones**

- `--output, -o <directorio>`: Directorio de salida (por defecto: dist)
- `--mode, -m <modo>`: Modo de construcción (production, development)
- `--target, -t <objetivo>`: Objetivo de construcción (node, browser, both)
- `--minify`: Minificar salida (por defecto: true en producción)
- `--sourcemap`: Generar mapas de fuente
- `--analyze`: Analizar tamaño del paquete
- `--clean`: Limpiar directorio de salida antes de construir
- `--watch, -w`: Modo de observación para desarrollo

#### **Ejemplos**

```bash
# Construcción de producción
mplp build

# Construcción de desarrollo con mapas de fuente
mplp build --mode development --sourcemap

# Construir para Node.js y navegador
mplp build --target both --analyze

# Construcción en modo de observación
mplp build --watch --mode development
```
