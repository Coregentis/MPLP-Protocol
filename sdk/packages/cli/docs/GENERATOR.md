# MPLP CLI Code Generator

The MPLP CLI includes a powerful code generator that helps you quickly create agents, workflows, and configurations with best practices built-in.

## Overview

The code generator supports three main types of code generation:

- **Agents**: Multi-agent system components with capabilities and lifecycle management
- **Workflows**: Multi-step processes with orchestration and error handling
- **Configurations**: Application configurations with environment support and validation

Each type supports three complexity levels:

- **Basic**: Simple, straightforward implementations
- **Advanced**: Feature-rich with configuration and error handling
- **Enterprise**: Production-ready with monitoring, metrics, and advanced features

## Quick Start

### Generate an Agent

```bash
# Basic agent
mplp generate agent GreetingAgent

# Advanced agent with capabilities
mplp generate agent CustomerService --capabilities "greet,help,escalate" --template advanced

# Enterprise agent with full features
mplp generate agent DataProcessor --template enterprise --typescript --directory agents/data
```

### Generate a Workflow

```bash
# Basic workflow
mplp generate workflow ProcessOrder

# Advanced workflow with steps
mplp generate workflow ContentWorkflow --steps "validate,process,publish" --template advanced

# Enterprise workflow with monitoring
mplp generate workflow PaymentFlow --template enterprise --typescript
```

### Generate Configuration

```bash
# Basic configuration
mplp generate config AppConfig

# Advanced configuration with environments
mplp generate config DatabaseConfig --template advanced

# Enterprise configuration with validation
mplp generate config ProductionConfig --template enterprise
```

## Command Reference

### Basic Syntax

```bash
mplp generate <type> [name] [options]
mplp gen <type> [name] [options]        # Short alias
mplp g <type> [name] [options]          # Shorter alias
```

### Arguments

- `type`: Type of code to generate (`agent`, `workflow`, `config`)
- `name`: Name of the generated item (optional, will prompt if not provided)

### Options

#### General Options

- `-n, --name <name>`: Name of the generated item
- `-d, --directory <directory>`: Output directory (relative to src/)
- `--template <template>`: Template variant (`basic`, `advanced`, `enterprise`)
- `--description <description>`: Description for the generated item
- `--dry-run`: Show what would be generated without creating files

#### Language Options

- `--typescript`: Generate TypeScript files (default)
- `--javascript`: Generate JavaScript files

#### Generation Options

- `--no-test`: Skip test file generation
- `--no-docs`: Skip documentation generation

#### Agent-Specific Options

- `--capabilities <capabilities>`: Comma-separated list of capabilities

#### Workflow-Specific Options

- `--steps <steps>`: Comma-separated list of workflow steps

## Templates

### Basic Template

Perfect for learning and prototyping:

- Simple, clean code structure
- Essential functionality only
- Minimal dependencies
- Easy to understand and modify

**Generated Files:**
- Main implementation file
- Basic test file
- Simple documentation

### Advanced Template

For production applications:

- Configuration support
- Error handling and retries
- Structured logging
- Comprehensive testing
- Detailed documentation

**Generated Files:**
- Main implementation file
- Configuration file
- Type definitions (TypeScript)
- Comprehensive test suite
- Detailed documentation

### Enterprise Template

Production-ready with enterprise features:

- Advanced configuration management
- Metrics and monitoring
- Health checks
- Structured logging
- Security features
- Environment-specific configurations
- Comprehensive documentation

**Generated Files:**
- Main implementation file
- Configuration files (multiple environments)
- Type definitions and schemas
- Validation and loaders
- Complete test suite
- API documentation
- Best practices guide

## Interactive Mode

When you run the generate command without all required arguments, the CLI will prompt you interactively:

```bash
mplp generate
? What would you like to generate? (Use arrow keys)
❯ agent
  workflow
  config

? Agent name: MyAgent
? Template: (Use arrow keys)
❯ basic
  advanced
  enterprise

? Description: My custom agent
? Capabilities: read,write,process
```

## Dry Run Mode

Use `--dry-run` to preview what files will be generated:

```bash
mplp generate agent TestAgent --dry-run
```

Output:
```
Dry Run - Files that would be generated:
  src/agents/TestAgent.ts
    Main agent implementation
  src/agents/__tests__/TestAgent.test.ts
    Agent unit tests
  docs/agents/TestAgent.md
    Agent documentation
```

## Generated Code Structure

### Agent Structure

```
src/agents/
├── MyAgent.ts              # Main agent implementation
├── MyAgent.config.ts       # Configuration (advanced/enterprise)
├── MyAgent.types.ts        # Type definitions (TypeScript)
└── __tests__/
    └── MyAgent.test.ts     # Unit tests

docs/agents/
└── MyAgent.md              # Documentation
```

### Workflow Structure

```
src/workflows/
├── MyWorkflow.ts           # Main workflow implementation
├── MyWorkflow.config.ts    # Configuration (advanced/enterprise)
├── MyWorkflow.types.ts     # Type definitions (TypeScript)
└── __tests__/
    └── MyWorkflow.test.ts  # Unit tests

docs/workflows/
└── MyWorkflow.md           # Documentation
```

### Configuration Structure

```
src/config/
├── MyConfig.ts             # Main configuration
├── MyConfig.development.ts # Development environment
├── MyConfig.production.ts  # Production environment
├── MyConfig.test.ts        # Test environment
├── MyConfig.schema.ts      # Validation schema (TypeScript)
└── __tests__/
    └── MyConfig.test.ts    # Unit tests

docs/config/
└── MyConfig.md             # Documentation
```

## Customization

### Custom Templates

You can extend the generator with custom templates by:

1. Creating a custom generator class extending `BaseGenerator`
2. Implementing the required methods
3. Registering it with the `CodeGeneratorManager`

### Template Variables

The generator uses Mustache templates with these variables:

- `{{name}}`: Item name (e.g., "MyAgent")
- `{{description}}`: Item description
- `{{template}}`: Template type (basic/advanced/enterprise)
- `{{capabilities}}`: Array of capabilities (agents)
- `{{steps}}`: Array of steps (workflows)
- `{{useTypeScript}}`: Boolean for TypeScript usage
- `{{fileExtension}}`: File extension (ts/js)
- `{{testExtension}}`: Test file extension (test.ts/test.js)
- `{{className}}`: Class name (PascalCase)
- `{{camelCaseName}}`: camelCase version
- `{{kebabCaseName}}`: kebab-case version
- `{{constantName}}`: CONSTANT_CASE version
- `{{directory}}`: Output directory
- `{{date}}`: Generation date
- `{{year}}`: Current year

## Best Practices

### Naming Conventions

- Use PascalCase for class names: `MyAgent`, `ProcessOrderWorkflow`
- Use descriptive names that indicate purpose
- Avoid generic names like `Agent1` or `TestWorkflow`

### Template Selection

- **Basic**: For learning, prototyping, or simple use cases
- **Advanced**: For production applications with moderate complexity
- **Enterprise**: For mission-critical applications requiring full observability

### Project Organization

- Keep related agents in subdirectories: `--directory agents/customer`
- Group workflows by domain: `--directory workflows/payment`
- Organize configs by environment: `--directory config/environments`

### Development Workflow

1. Generate code with appropriate template
2. Implement business logic in generated files
3. Run tests to verify functionality
4. Update documentation as needed
5. Add to version control

## Troubleshooting

### Common Issues

**"Not in a project directory"**
- Ensure you're in the root of an MPLP project
- Check that `package.json` exists

**"Invalid generation type"**
- Use one of: `agent`, `workflow`, `config`
- Check spelling and case sensitivity

**"Name must start with a letter"**
- Use valid JavaScript/TypeScript identifier names
- Start with a letter, use only letters and numbers

### Getting Help

```bash
mplp help generate          # Command help
mplp generate --help        # Detailed options
mplp help                   # General CLI help
```

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive usage examples and common patterns.
