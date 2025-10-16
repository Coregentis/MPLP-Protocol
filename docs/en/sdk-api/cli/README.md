# @mplp/cli API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/cli/README.md)


> **Package**: @mplp/cli  
> **Version**: v1.1.0-beta  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/cli` package provides a comprehensive command-line interface for the MPLP (Multi-Agent Protocol Lifecycle Platform). It offers powerful tools for project initialization, code generation, development workflow management, and deployment utilities with enterprise-grade features.

### **🎯 Key Features**

- **Project Initialization**: Create new MPLP projects with multiple templates (basic, advanced, enterprise)
- **Code Generation**: Generate agents, workflows, configurations, and other components
- **Development Server**: Built-in development server with hot reload and debugging
- **Build System**: Production-ready build and optimization tools
- **Testing Integration**: Comprehensive testing utilities and coverage reporting
- **Linting & Quality**: Code quality checks and automated formatting
- **Template System**: Extensible template system for custom project structures
- **Package Manager Support**: Works with npm, yarn, and pnpm

### **📦 Installation**

```bash
# Global installation (recommended)
npm install -g @mplp/cli

# Local installation
npm install @mplp/cli --save-dev

# Verify installation
mplp --version
```

### **🏗️ CLI Architecture**

```
┌─────────────────────────────────────────┐
│              MPLP CLI                   │
│         (Command Router)                │
├─────────────────────────────────────────┤
│  InitCommand | GenerateCommand         │
│  DevCommand  | BuildCommand            │
│  TestCommand | LintCommand             │
│  HelpCommand | InfoCommand             │
├─────────────────────────────────────────┤
│         Core Components                 │
│  Logger | Spinner | TemplateManager    │
│  GitOps | PackageManager | FileSystem  │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Create Your First Project**

```bash
# Interactive project creation
mplp init

# Create project with specific template
mplp init my-agent --template advanced

# Create enterprise project with full features
mplp init enterprise-bot --template enterprise --author "Your Name" --license MIT
```

### **Development Workflow**

```bash
# Navigate to project
cd my-agent

# Start development server
mplp dev

# Generate new components
mplp generate agent GreetingAgent
mplp generate workflow ProcessingWorkflow

# Run tests
mplp test

# Build for production
mplp build --production
```

## 📋 **Core Commands**

### **mplp init**

Initialize a new MPLP project with customizable templates and configurations.

#### **Syntax**

```bash
mplp init [project-name] [options]
```

#### **Options**

- `--template, -t <template>`: Project template (basic, advanced, enterprise)
- `--author <author>`: Project author name
- `--description <desc>`: Project description
- `--license <license>`: Project license (MIT, Apache-2.0, GPL-3.0, etc.)
- `--no-git`: Skip Git repository initialization
- `--no-install`: Skip dependency installation
- `--package-manager <pm>`: Package manager (npm, yarn, pnpm)
- `--typescript`: Enable TypeScript (default: true)
- `--directory <dir>`: Target directory for project creation

#### **Examples**

```bash
# Basic project
mplp init simple-bot --template basic

# Advanced project with orchestration
mplp init complex-system --template advanced --author "John Doe"

# Enterprise project with full toolchain
mplp init production-system --template enterprise --license Apache-2.0

# Custom directory and package manager
mplp init my-project --directory ./projects --package-manager yarn
```

#### **Templates**

**Basic Template:**
- Simple agent structure
- Basic configuration
- Essential dependencies
- Development scripts

**Advanced Template:**
- Multi-agent orchestration
- Workflow management
- Platform adapters
- Testing framework
- CI/CD configuration

**Enterprise Template:**
- Full MPLP feature set
- Docker support
- Monitoring and logging
- Security configurations
- Production deployment scripts

### **mplp generate**

Generate code components using built-in templates and patterns.

#### **Syntax**

```bash
mplp generate <type> [name] [options]
mplp gen <type> [name] [options]    # Short alias
mplp g <type> [name] [options]      # Shorter alias
```

#### **Types**

- `agent`: Generate intelligent agent classes
- `workflow`: Generate workflow definitions
- `config`: Generate configuration files
- `adapter`: Generate platform adapters
- `test`: Generate test files

#### **Options**

- `--template, -t <template>`: Generation template (basic, advanced, enterprise)
- `--capabilities <caps>`: Agent capabilities (comma-separated)
- `--steps <steps>`: Workflow steps (comma-separated)
- `--directory <dir>`: Output directory
- `--typescript`: Generate TypeScript files (default: true)
- `--overwrite`: Overwrite existing files

#### **Examples**

```bash
# Generate basic agent
mplp generate agent GreetingAgent

# Generate advanced agent with capabilities
mplp generate agent CustomerService --capabilities "greet,help,escalate" --template advanced

# Generate workflow with steps
mplp generate workflow ContentWorkflow --steps "validate,process,publish"

# Generate configuration
mplp generate config DatabaseConfig --template enterprise
```

### **mplp dev**

Start the development server with hot reload and debugging capabilities.

#### **Syntax**

```bash
mplp dev [options]
```

#### **Options**

- `--port, -p <port>`: Development server port (default: 3000)
- `--host <host>`: Development server host (default: localhost)
- `--no-open`: Don't open browser automatically
- `--debug`: Enable debug mode
- `--watch <pattern>`: Watch specific file patterns
- `--env <env>`: Environment configuration file

#### **Examples**

```bash
# Start development server
mplp dev

# Custom port and host
mplp dev --port 8080 --host 0.0.0.0

# Debug mode with specific environment
mplp dev --debug --env development
```

### **mplp build**

Build the project for production deployment.

#### **Syntax**

```bash
mplp build [options]
```

#### **Options**

- `--production`: Production build with optimizations
- `--output, -o <dir>`: Output directory (default: dist)
- `--clean`: Clean output directory before build
- `--analyze`: Analyze bundle size and dependencies
- `--source-map`: Generate source maps
- `--env <env>`: Environment configuration

#### **Examples**

```bash
# Production build
mplp build --production

# Build with analysis
mplp build --production --analyze --clean

# Custom output directory
mplp build --output ./build --source-map
```

### **mplp test**

Run tests with comprehensive coverage and reporting.

#### **Syntax**

```bash
mplp test [options]
```

#### **Options**

- `--watch`: Run tests in watch mode
- `--coverage`: Generate coverage report
- `--verbose`: Verbose test output
- `--pattern <pattern>`: Test file pattern
- `--timeout <ms>`: Test timeout in milliseconds

#### **Examples**

```bash
# Run all tests
mplp test

# Watch mode with coverage
mplp test --watch --coverage

# Run specific test pattern
mplp test --pattern "**/*.agent.test.ts"
```

### **mplp lint**

Run code quality checks and automated formatting.

#### **Syntax**

```bash
mplp lint [options]
```

#### **Options**

- `--fix`: Automatically fix linting issues
- `--format <format>`: Output format (stylish, json, junit)
- `--pattern <pattern>`: File pattern to lint
- `--config <config>`: Custom lint configuration file

#### **Examples**

```bash
# Run linting
mplp lint

# Fix issues automatically
mplp lint --fix

# Lint specific files
mplp lint --pattern "src/**/*.ts" --fix
```

### **mplp info**

Display project and environment information.

#### **Syntax**

```bash
mplp info [options]
```

#### **Options**

- `--project`: Show project-specific information
- `--env`: Show environment information
- `--json`: Output in JSON format
- `--verbose`: Show detailed information

#### **Examples**

```bash
# General information
mplp info

# Project details
mplp info --project --verbose

# Environment information in JSON
mplp info --env --json
```

### **mplp help**

Display help information for commands.

#### **Syntax**

```bash
mplp help [command]
mplp --help
mplp -h
```

#### **Examples**

```bash
# General help
mplp help

# Command-specific help
mplp help init
mplp help generate

# All available commands
mplp help --all
```

## 🔧 **Programmatic API**

### **CLIApplication**

Main CLI application class for programmatic usage.

```typescript
import { CLIApplication, CLIConfig, CLIContext } from '@mplp/cli';

const config: CLIConfig = {
  name: 'mplp',
  version: '1.1.0-beta',
  description: 'MPLP CLI Tool'
};

const app = new CLIApplication(config);
await app.run(['init', 'my-project', '--template', 'advanced']);
```

### **Commands**

Individual command classes for custom CLI applications.

```typescript
import { InitCommand, GenerateCommand, DevCommand } from '@mplp/cli';

const context: CLIContext = {
  config,
  logger,
  spinner,
  templateManager
};

const initCommand = new InitCommand(context);
await initCommand.execute({
  projectName: 'my-project',
  template: 'advanced',
  author: 'John Doe'
});
```

### **Template System**

Custom template creation and management.

```typescript
import { ProjectTemplateManager } from '@mplp/cli';

const templateManager = new ProjectTemplateManager();

// Register custom template
templateManager.registerTemplate({
  name: 'custom',
  description: 'Custom project template',
  files: [
    // Template files configuration
  ]
});

// Use template
await templateManager.generateProject('my-project', 'custom', options);
```

## 🎯 **Advanced Usage Examples**

### **Enterprise Project Setup**

```bash
# Create enterprise project with full configuration
mplp init enterprise-system \
  --template enterprise \
  --author "Enterprise Team" \
  --description "Production-ready multi-agent system" \
  --license Apache-2.0 \
  --package-manager yarn

cd enterprise-system

# Generate core components
mplp generate agent UserManager --capabilities "authenticate,authorize,profile" --template enterprise
mplp generate agent OrderProcessor --capabilities "validate,process,notify" --template enterprise
mplp generate workflow OrderWorkflow --steps "receive,validate,process,fulfill,notify"

# Start development with debugging
mplp dev --debug --port 3000
```

### **CI/CD Integration**

```bash
#!/bin/bash
# CI/CD Pipeline Script

# Install CLI
npm install -g @mplp/cli

# Create test project
mplp init test-project --template basic --no-git --no-install

cd test-project

# Install dependencies
npm install

# Run quality checks
mplp lint
mplp test --coverage

# Build for production
mplp build --production --clean

# Deploy (custom deployment logic)
npm run deploy
```

### **Custom Development Workflow**

```bash
# Development workflow with custom configuration
mplp init my-workflow-project --template advanced

cd my-workflow-project

# Generate multiple agents
for agent in "DataCollector" "DataProcessor" "DataValidator" "ReportGenerator"; do
  mplp generate agent $agent --template advanced
done

# Generate orchestration workflow
mplp generate workflow DataPipeline --steps "collect,process,validate,report"

# Start development with custom environment
mplp dev --env development --port 4000 --debug
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle management
- [Agent Builder API](../agent-builder/README.md) - Building intelligent agents
- [Orchestrator API](../orchestrator/README.md) - Multi-agent workflow orchestration
- [Platform Adapters API](../adapters/README.md) - Platform integration and communication

---

**Package Maintainer**: MPLP CLI Team  
**Last Review**: 2025-09-20  
**Node.js Requirement**: >=18.0.0  
**Status**: ✅ Production Ready
