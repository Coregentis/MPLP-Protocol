# @mplp/cli

Command-line interface for MPLP (Multi-Agent Protocol Lifecycle Platform)

## Overview

The MPLP CLI is a powerful command-line tool that helps developers create, manage, and deploy multi-agent systems using the MPLP platform. It provides project scaffolding, code generation, and development tools to streamline the development process.

## Features

- 🚀 **Project Creation**: Create new MPLP projects with customizable templates
- 📋 **Multiple Templates**: Basic, Advanced, and Enterprise project templates
- 🔧 **Development Tools**: Built-in development server and build tools
- 📦 **Package Management**: Automatic dependency management and installation
- 🌐 **Git Integration**: Automatic Git repository initialization
- 📚 **Documentation**: Comprehensive help system and examples
- 🎯 **TypeScript Support**: Full TypeScript support with strict type checking

## Installation

```bash
npm install -g @mplp/cli
```

## Quick Start

### Create a New Project

```bash
# Create a basic project
mplp init my-agent

# Create an advanced project with orchestration
mplp init my-agent --template advanced

# Create an enterprise project with full features
mplp init my-agent --template enterprise --typescript --eslint
```

### Navigate and Start Development

```bash
cd my-agent
mplp dev
```

## Commands

### `mplp init [project-name]`

Create a new MPLP project.

**Options:**
- `-t, --template <template>` - Project template (basic, advanced, enterprise)
- `-d, --directory <directory>` - Target directory
- `--description <description>` - Project description
- `--author <author>` - Project author
- `--license <license>` - Project license (default: MIT)
- `--no-git` - Skip Git repository initialization
- `--no-install` - Skip dependency installation
- `--typescript` - Use TypeScript template
- `--eslint` - Include ESLint configuration
- `--prettier` - Include Prettier configuration

**Examples:**
```bash
mplp init my-agent
mplp init my-agent --template advanced
mplp init my-agent --template enterprise --typescript --eslint
mplp init --directory ./projects/my-agent
```

### `mplp info`

Display project and environment information.

**Options:**
- `--env` - Show environment information only
- `--project` - Show project information only
- `--json` - Output information in JSON format

**Examples:**
```bash
mplp info
mplp info --env
mplp info --project
mplp info --json
```

### `mplp build [options]`

Build the project for production.

**Options:**
- `-o, --output <directory>` - Output directory for built files (default: dist)
- `--mode <mode>` - Build mode (development, production) (default: production)
- `--target <target>` - Build target (node, browser, both) (default: node)
- `--minify` - Minify the output
- `--source-map` - Generate source maps
- `--clean` - Clean output directory before building
- `--watch` - Watch for changes and rebuild
- `--analyze` - Analyze bundle size

**Examples:**
```bash
mplp build
mplp build --output ./build
mplp build --mode development --watch
mplp build --target browser --minify
```

### `mplp test [pattern] [options]`

Run tests for the project.

**Options:**
- `--watch` - Run tests in watch mode
- `--coverage` - Generate test coverage report
- `--verbose` - Display individual test results
- `--ci` - Run tests in CI mode
- `--timeout <ms>` - Test timeout in milliseconds (default: 30000)

**Examples:**
```bash
mplp test
mplp test --watch
mplp test --coverage
mplp test "**/*.test.ts"
```

### `mplp lint [files] [options]`

Run linting and code quality checks.

**Options:**
- `--fix` - Automatically fix problems
- `--cache` - Only check changed files
- `--quiet` - Report errors only
- `--typescript` - Run TypeScript compiler checks
- `--prettier` - Run Prettier formatting checks

**Examples:**
```bash
mplp lint
mplp lint --fix
mplp lint src/
mplp lint --typescript --prettier
```

### `mplp clean [options]`

Clean build artifacts and cache files.

**Options:**
- `--dist` - Clean distribution/build directory only
- `--cache` - Clean cache files only
- `--deps` - Clean node_modules directory
- `--logs` - Clean log files
- `--all` - Clean everything
- `--dry-run` - Show what would be deleted without actually deleting

**Examples:**
```bash
mplp clean
mplp clean --dist
mplp clean --all --force
mplp clean --dry-run --verbose
```

### `mplp help [command]`

Display help information for commands.

**Options:**
- `-a, --all` - Show help for all commands

**Examples:**
```bash
mplp help
mplp help init
mplp help --all
```

## Project Templates

### Basic Template

Perfect for getting started with MPLP:
- Simple agent structure
- Basic TypeScript configuration
- Essential dependencies
- Jest testing setup

### Advanced Template

For projects requiring orchestration:
- Multiple agent examples
- Workflow orchestration
- Advanced TypeScript configuration
- Comprehensive testing setup
- Development tools (nodemon)

### Enterprise Template

Production-ready setup with best practices:
- Complete development toolchain
- Docker configuration
- Environment management
- Logging and monitoring
- CI/CD ready configuration
- Security best practices

## Global Options

- `-h, --help` - Display help for command
- `-v, --version` - Display version number
- `--verbose` - Enable verbose output
- `--quiet` - Suppress output
- `--debug` - Enable debug mode

## Environment Variables

- `DEBUG` - Enable debug mode
- `VERBOSE` - Enable verbose output
- `QUIET` - Suppress output

## Configuration

The CLI can be configured through:
- Command-line options
- Environment variables
- Project-specific configuration files

## Development

### Building from Source

```bash
git clone https://github.com/mplp-org/mplp.git
cd mplp/sdk/packages/cli
npm install
npm run build
```

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Development Mode

```bash
npm run dev
```

## Architecture

The CLI is built with a modular architecture:

- **Core**: Application framework and base classes
- **Commands**: Individual CLI commands
- **Templates**: Project template management
- **Utils**: Utility functions and helpers

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../../LICENSE) file for details.

## Support

- 📚 [Documentation](https://mplp.dev/docs)
- 💬 [Discord Community](https://discord.gg/mplp)
- 🐛 [Issue Tracker](https://github.com/mplp-org/mplp/issues)
- 📧 [Email Support](mailto:support@mplp.dev)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
