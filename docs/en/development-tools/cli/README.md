# MPLP CLI - Complete Usage Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/development-tools/cli/README.md)


> **Package**: @mplp/cli  
> **Version**: v1.1.0-beta  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

The MPLP CLI is a comprehensive command-line interface for the Multi-Agent Protocol Lifecycle Platform. It provides powerful tools for project creation, development workflow management, code generation, testing, and deployment with enterprise-grade features and extensive customization options.

### **🎯 Key Features**

- **🚀 Project Scaffolding**: Create new MPLP projects with multiple templates (Basic, Advanced, Enterprise)
- **📋 Code Generation**: Generate agents, workflows, configurations, and other components
- **🔧 Development Server**: Built-in development server with hot reload and debugging support
- **🏗️ Build System**: Production-ready build and optimization tools
- **🧪 Testing Integration**: Comprehensive testing utilities and coverage reporting
- **📊 Code Quality**: Code quality checks, linting, and automatic formatting
- **📦 Package Management**: Support for npm, yarn, and pnpm with automatic detection
- **🌐 Git Integration**: Automatic Git repository initialization and workflow support
- **📚 Template System**: Extensible template system with custom project structures
- **🔍 Project Analysis**: Detailed project information and dependency analysis

### **📦 Installation**

```bash
# Global installation (recommended)
npm install -g @mplp/cli

# Using yarn
yarn global add @mplp/cli

# Using pnpm
pnpm add -g @mplp/cli

# Verify installation
mplp --version
```

## 🚀 **Quick Start**

### **Create Your First Project**

```bash
# Create a basic project
mplp init my-first-agent

# Navigate to the project
cd my-first-agent

# Start development
mplp dev

# Build for production
mplp build
```

### **Using Different Templates**

```bash
# Basic template (default)
mplp init simple-agent --template basic

# Advanced template with orchestration
mplp init complex-system --template advanced

# Enterprise template with full toolchain
mplp init production-system --template enterprise
```

## 📋 **Command Reference**

### **mplp init**

Create a new MPLP project with customizable templates and configurations.

#### **Syntax**

```bash
mplp init <project-name> [options]
```

#### **Options**

- `--template, -t <template>`: Project template (basic, advanced, enterprise)
- `--description, -d <description>`: Project description
- `--author, -a <author>`: Project author
- `--license, -l <license>`: Project license (MIT, Apache-2.0, etc.)
- `--package-manager, -pm <manager>`: Package manager (npm, yarn, pnpm)
- `--git, -g`: Initialize Git repository (default: true)
- `--install, -i`: Install dependencies after creation (default: true)
- `--typescript, -ts`: Use TypeScript (default: true)
- `--eslint`: Add ESLint configuration (default: true)
- `--prettier`: Add Prettier configuration (default: true)
- `--jest`: Add Jest testing framework (default: true)
- `--force, -f`: Overwrite existing directory
- `--dry-run`: Show what would be created without actually creating

#### **Examples**

```bash
# Basic project creation
mplp init my-agent

# Advanced project with custom settings
mplp init enterprise-bot \
  --template enterprise \
  --description "Enterprise chatbot system" \
  --author "Your Name" \
  --license MIT \
  --package-manager yarn

# Quick setup without prompts
mplp init quick-agent --template basic --force --no-git

# Dry run to preview structure
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

Generate code components, configurations, and boilerplate code.

#### **Syntax**

```bash
mplp generate <type> <name> [options]
```

#### **Types**

- `agent`: Generate a new agent class
- `workflow`: Generate a workflow configuration
- `adapter`: Generate a platform adapter
- `config`: Generate configuration files
- `test`: Generate test files
- `component`: Generate custom components

#### **Options**

- `--output, -o <path>`: Output directory
- `--template, -t <template>`: Generation template
- `--overwrite, -w`: Overwrite existing files
- `--dry-run`: Preview generated code

#### **Examples**

```bash
# Generate a new agent
mplp generate agent ChatBot --output src/agents

# Generate a workflow
mplp generate workflow DataProcessing --template advanced

# Generate platform adapter
mplp generate adapter CustomPlatform --output src/adapters

# Generate test files
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

Start the development server with hot reload and debugging support.

#### **Syntax**

```bash
mplp dev [options]
```

#### **Options**

- `--port, -p <port>`: Development server port (default: 3000)
- `--host, -h <host>`: Development server host (default: localhost)
- `--open, -o`: Open browser automatically
- `--watch, -w <paths>`: Additional paths to watch
- `--ignore, -i <patterns>`: Patterns to ignore
- `--debug, -d`: Enable debug mode
- `--verbose, -v`: Verbose logging
- `--no-reload`: Disable hot reload
- `--inspect`: Enable Node.js inspector

#### **Examples**

```bash
# Start development server
mplp dev

# Custom port and host
mplp dev --port 8080 --host 0.0.0.0

# Debug mode with inspector
mplp dev --debug --inspect

# Watch additional directories
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

Build the project for production with optimization and bundling.

#### **Syntax**

```bash
mplp build [options]
```

#### **Options**

- `--output, -o <dir>`: Output directory (default: dist)
- `--mode, -m <mode>`: Build mode (production, development)
- `--target, -t <target>`: Build target (node, browser, both)
- `--minify`: Minify output (default: true in production)
- `--sourcemap`: Generate source maps
- `--analyze`: Analyze bundle size
- `--clean`: Clean output directory before build
- `--watch, -w`: Watch mode for development

#### **Examples**

```bash
# Production build
mplp build

# Development build with source maps
mplp build --mode development --sourcemap

# Build for both Node.js and browser
mplp build --target both --analyze

# Watch mode build
mplp build --watch --mode development
```

### **mplp test**

Run tests with comprehensive testing utilities and coverage reporting.

#### **Syntax**

```bash
mplp test [options] [patterns]
```

#### **Options**

- `--watch, -w`: Watch mode
- `--coverage, -c`: Generate coverage report
- `--verbose, -v`: Verbose output
- `--silent, -s`: Silent mode
- `--bail, -b`: Stop on first failure
- `--parallel, -p`: Run tests in parallel
- `--max-workers <num>`: Maximum worker processes
- `--timeout <ms>`: Test timeout
- `--setup <file>`: Setup file
- `--config <file>`: Custom Jest config

#### **Examples**

```bash
# Run all tests
mplp test

# Run tests with coverage
mplp test --coverage

# Watch mode
mplp test --watch

# Run specific test files
mplp test src/agents --verbose

# Parallel execution
mplp test --parallel --max-workers 4
```

### **mplp lint**

Run code quality checks and automatic formatting.

#### **Syntax**

```bash
mplp lint [options] [files]
```

#### **Options**

- `--fix, -f`: Automatically fix issues
- `--format <formatter>`: Output format (stylish, json, table)
- `--quiet, -q`: Report only errors
- `--max-warnings <num>`: Maximum warnings allowed
- `--cache`: Use cache for faster linting
- `--no-eslintrc`: Disable ESLint configuration files

#### **Examples**

```bash
# Lint all files
mplp lint

# Lint and fix issues
mplp lint --fix

# Lint specific files
mplp lint src/agents/*.ts --format table

# Quiet mode (errors only)
mplp lint --quiet --max-warnings 0
```

### **mplp clean**

Clean build artifacts and temporary files.

#### **Syntax**

```bash
mplp clean [options]
```

#### **Options**

- `--all, -a`: Clean all artifacts including node_modules
- `--cache, -c`: Clean cache files
- `--logs, -l`: Clean log files
- `--force, -f`: Force clean without confirmation

#### **Examples**

```bash
# Clean build directory
mplp clean

# Clean everything
mplp clean --all

# Clean cache and logs
mplp clean --cache --logs
```

### **mplp info**

Display project and environment information.

#### **Syntax**

```bash
mplp info [options]
```

#### **Options**

- `--project, -p`: Show project-specific information
- `--env, -e`: Show environment information
- `--json, -j`: Output in JSON format
- `--verbose, -v`: Show detailed information

#### **Examples**

```bash
# General information
mplp info

# Project details
mplp info --project --verbose

# Environment info in JSON
mplp info --env --json
```

## 🔧 **Configuration**

### **Project Configuration**

Create a `mplp.config.js` file in your project root:

```javascript
module.exports = {
  // Build configuration
  build: {
    target: 'node',
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },
  
  // Development server configuration
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    watch: ['src/**/*', 'config/**/*']
  },
  
  // Testing configuration
  test: {
    coverage: true,
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  
  // Linting configuration
  lint: {
    fix: true,
    cache: true,
    maxWarnings: 0
  },
  
  // Template configuration
  templates: {
    customTemplatesDir: './templates',
    defaultTemplate: 'basic'
  }
};
```

### **TypeScript Configuration**

The CLI automatically generates `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### **Package.json Scripts**

Generated projects include these npm scripts:

```json
{
  "scripts": {
    "build": "mplp build",
    "dev": "mplp dev",
    "test": "mplp test",
    "test:watch": "mplp test --watch",
    "test:coverage": "mplp test --coverage",
    "lint": "mplp lint",
    "lint:fix": "mplp lint --fix",
    "clean": "mplp clean",
    "start": "node dist/index.js"
  }
}
```

## 📋 **Project Templates**

### **Basic Template**

Perfect for learning and simple projects:

```
my-project/
├── src/
│   ├── index.ts          # Main entry point
│   ├── agents/           # Agent implementations
│   └── config/           # Configuration files
├── tests/                # Test files
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**Dependencies**: `@mplp/sdk-core`, `@mplp/agent-builder`

### **Advanced Template**

Includes orchestration and multiple agents:

```
my-project/
├── src/
│   ├── index.ts
│   ├── agents/           # Multiple agent types
│   ├── workflows/        # Workflow definitions
│   ├── orchestrator/     # Orchestration logic
│   ├── config/           # Environment configs
│   └── utils/            # Utility functions
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test fixtures
├── docs/                 # Documentation
├── scripts/              # Build scripts
└── docker/               # Docker configuration
```

**Dependencies**: `@mplp/sdk-core`, `@mplp/agent-builder`, `@mplp/orchestrator`

### **Enterprise Template**

Full production setup with monitoring and deployment:

```
my-project/
├── src/
│   ├── index.ts
│   ├── agents/
│   ├── workflows/
│   ├── orchestrator/
│   ├── adapters/         # Platform adapters
│   ├── middleware/       # Custom middleware
│   ├── monitoring/       # Monitoring setup
│   ├── config/
│   └── utils/
├── tests/
├── docs/
├── scripts/
├── docker/
├── k8s/                  # Kubernetes manifests
├── .github/              # GitHub Actions
├── monitoring/           # Monitoring configs
└── deployment/           # Deployment scripts
```

**Dependencies**: All MPLP packages + monitoring and deployment tools

## 🛠️ **Development Workflows**

### **Standard Development Flow**

```bash
# 1. Create project
mplp init my-agent --template advanced

# 2. Navigate to project
cd my-agent

# 3. Start development
mplp dev

# 4. Generate components (in another terminal)
mplp generate agent ChatBot
mplp generate workflow MessageProcessing

# 5. Run tests
mplp test --watch

# 6. Build for production
mplp build

# 7. Deploy
npm run deploy
```

### **Testing Workflow**

```bash
# Run all tests
mplp test

# Run tests with coverage
mplp test --coverage

# Run specific test suites
mplp test src/agents --verbose

# Watch mode during development
mplp test --watch

# Run tests before commit
mplp test --bail --coverage
```

### **Code Quality Workflow**

```bash
# Check code quality
mplp lint

# Fix issues automatically
mplp lint --fix

# Run tests and linting together
npm run validate  # Custom script combining both
```

## 🔗 **Integration Examples**

### **CI/CD Integration**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: mplp lint
      
      - name: Run tests
        run: mplp test --coverage
      
      - name: Build project
        run: mplp build
```

### **Docker Integration**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install MPLP CLI
RUN npm install -g @mplp/cli

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN mplp build

# Start application
CMD ["npm", "start"]
```

### **VS Code Integration**

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "MPLP: Start Dev Server",
      "type": "shell",
      "command": "mplp dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "MPLP: Run Tests",
      "type": "shell",
      "command": "mplp test",
      "group": "test"
    }
  ]
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Installation Problems**

```bash
# Clear npm cache
npm cache clean --force

# Reinstall CLI
npm uninstall -g @mplp/cli
npm install -g @mplp/cli

# Check installation
mplp --version
mplp info --env
```

#### **Project Creation Issues**

```bash
# Force overwrite existing directory
mplp init my-project --force

# Skip Git initialization if causing issues
mplp init my-project --no-git

# Use specific package manager
mplp init my-project --package-manager yarn
```

#### **Build Issues**

```bash
# Clean and rebuild
mplp clean
mplp build

# Check TypeScript configuration
mplp info --project

# Verbose build output
mplp build --verbose
```

### **Debug Mode**

Enable debug mode for detailed logging:

```bash
# Enable debug for all commands
export DEBUG=mplp:*
mplp dev

# Enable debug for specific command
mplp build --debug --verbose
```

## 📚 **Best Practices**

### **Project Organization**

- Use consistent naming conventions
- Organize code by feature, not by file type
- Keep configuration files in a dedicated directory
- Use TypeScript for better development experience

### **Development Workflow**

- Use `mplp dev` for development with hot reload
- Run tests frequently with `mplp test --watch`
- Use linting to maintain code quality
- Build regularly to catch integration issues early

### **Performance Optimization**

- Use `--parallel` flag for faster testing
- Enable caching for linting and building
- Use `--watch` mode efficiently during development
- Clean build artifacts regularly

## 🎯 **Advanced Features**

### **Interactive Mode**

The MPLP CLI supports an interactive mode for enhanced development experience:

```bash
# Start interactive mode
mplp --interactive

# Interactive prompt
mplp> init my-project --template advanced
mplp> generate agent ChatBot
mplp> dev --port 8080
mplp> exit
```

**Interactive Commands:**
- All standard CLI commands are available
- Tab completion for commands and options
- Command history navigation
- Built-in help system
- Session persistence

### **Performance Monitoring**

The CLI includes built-in performance monitoring and metrics:

```bash
# View performance metrics
mplp info --performance

# Command execution history
mplp history

# Performance analysis
mplp analyze --performance
```

**Metrics Tracked:**
- Command execution time
- Success/failure rates
- Resource usage patterns
- Build performance trends
- Test execution statistics

### **Plugin System**

Extend CLI functionality with custom plugins:

```bash
# Install a plugin
mplp plugin install @mplp/plugin-docker

# List installed plugins
mplp plugin list

# Create custom plugin
mplp generate plugin MyCustomPlugin
```

**Plugin Development:**
- TypeScript-based plugin architecture
- Hook-based extension points
- Custom command registration
- Configuration management
- Plugin lifecycle management

### **Enterprise Features**

#### **Configuration Management**

```bash
# Global configuration directory: ~/.mplp-cli/
# - config.json: Global settings
# - history.json: Command history
# - plugins/: Installed plugins
# - templates/: Custom templates

# View configuration
mplp config list

# Set global options
mplp config set defaultTemplate advanced
mplp config set packageManager yarn
```

#### **Command History**

```bash
# View command history
mplp history

# Replay previous command
mplp history replay 5

# Clear history
mplp history clear
```

#### **Advanced Error Handling**

- Detailed error reporting with stack traces
- Automatic error recovery suggestions
- Integration with error tracking services
- Debug mode for troubleshooting
- Comprehensive logging system

## 🔗 **Related Documentation**

- [MPLP Dev Tools Guide](../dev-tools/README.md) - Development and debugging utilities
- [SDK Core Documentation](../../sdk-api/sdk-core/README.md) - Core SDK functionality
- [Agent Builder Guide](../../sdk-api/agent-builder/README.md) - Building intelligent agents
- [Orchestrator Documentation](../../sdk-api/orchestrator/README.md) - Multi-agent workflows

---

**CLI Maintainer**: MPLP Platform Team
**Last Review**: 2025-09-20
**Test Coverage**: 100% (193/193 tests passing)
**Performance**: Sub-second command execution
**Enterprise Features**: ✅ Full Support
**Status**: ✅ Production Ready
