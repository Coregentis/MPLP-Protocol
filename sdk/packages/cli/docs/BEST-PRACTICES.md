# MPLP CLI Best Practices

## Project Creation

### Choosing the Right Template

**Basic Template** - Use when:
- Learning MPLP concepts
- Building simple single-agent applications
- Prototyping ideas quickly
- Educational purposes

**Advanced Template** - Use when:
- Building multi-agent systems
- Need workflow orchestration
- Require agent coordination
- Production applications with moderate complexity

**Enterprise Template** - Use when:
- Building production systems
- Need comprehensive tooling
- Require Docker deployment
- Team development environment
- CI/CD integration required

### Project Naming Conventions

```bash
# Good project names
mplp init customer-service-agent
mplp init data-processing-workflow
mplp init social-media-orchestrator

# Avoid
mplp init MyProject  # Use kebab-case
mplp init agent123   # Be descriptive
mplp init test       # Too generic
```

### Directory Structure

```
my-mplp-project/
├── src/
│   ├── agents/          # Agent implementations
│   ├── workflows/       # Workflow definitions
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   └── index.ts         # Main entry point
├── tests/               # Test files
├── docs/                # Documentation
├── docker/              # Docker configurations
└── scripts/             # Build and deployment scripts
```

## Development Workflow

### 1. Project Setup

```bash
# Create project with appropriate template
mplp init my-project --template advanced --typescript --eslint

# Navigate to project
cd my-project

# Verify setup
mplp info --project
```

### 2. Development Process

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run typecheck
```

### 3. Before Committing

```bash
# Run full test suite
npm test

# Build project
npm run build

# Check project health
mplp info
```

## Command Usage Patterns

### Interactive vs Non-Interactive

```bash
# Interactive (prompts for input)
mplp init

# Non-interactive (all options provided)
mplp init my-project --template enterprise --author "John Doe" --license MIT
```

### Environment-Specific Commands

```bash
# Development
mplp init my-project --template basic
npm run dev

# Production
mplp init my-project --template enterprise
npm run build
npm start
```

## Configuration Management

### Environment Variables

```bash
# Enable debug mode
DEBUG=true mplp init my-project

# Verbose output
VERBOSE=true mplp info

# Quiet mode
QUIET=true mplp init my-project --template basic
```

### Project Configuration

```json
// package.json
{
  "mplp": {
    "template": "advanced",
    "features": ["typescript", "eslint", "prettier"],
    "deployment": {
      "target": "docker",
      "registry": "my-registry.com"
    }
  }
}
```

## Error Handling

### Common Issues and Solutions

**Permission Errors:**
```bash
# If you get permission errors
sudo mplp init my-project  # Not recommended
# Better: Fix npm permissions or use nvm
```

**Template Not Found:**
```bash
# Check available templates
mplp help init

# Use correct template name
mplp init my-project --template advanced  # not "Advanced"
```

**Git Issues:**
```bash
# Skip git if having issues
mplp init my-project --no-git

# Initialize git manually later
cd my-project
git init
git add .
git commit -m "Initial commit"
```

## Performance Optimization

### Dependency Management

```bash
# Skip installation during creation for faster setup
mplp init my-project --no-install

# Install dependencies later with preferred package manager
cd my-project
pnpm install  # or yarn install, npm install
```

### Template Caching

The CLI caches templates locally for faster project creation. Clear cache if needed:

```bash
# Clear CLI cache (if implemented)
mplp cache clear
```

## Security Best Practices

### Sensitive Information

```bash
# Never commit sensitive data
echo "*.env" >> .gitignore
echo "secrets/" >> .gitignore

# Use environment variables
cp .env.example .env
# Edit .env with your values
```

### Dependency Security

```bash
# Audit dependencies regularly
npm audit
npm audit fix

# Use specific versions in production
npm install --save-exact
```

## Testing Strategies

### Test Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for workflows
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and mocks
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## Deployment Patterns

### Docker Deployment

```bash
# Use enterprise template for Docker support
mplp init my-project --template enterprise

# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

## Troubleshooting

### Debug Mode

```bash
# Enable debug output
DEBUG=true mplp init my-project

# Check environment
mplp info --env

# Verbose logging
mplp init my-project --verbose
```

### Common Problems

1. **Command not found**: Ensure CLI is installed globally
2. **Permission denied**: Check file permissions and npm configuration
3. **Template errors**: Verify template name and availability
4. **Git errors**: Check Git configuration and repository status
5. **Dependency conflicts**: Clear node_modules and reinstall

### Getting Help

```bash
# General help
mplp help

# Command-specific help
mplp help init

# All available commands
mplp help --all

# Project information
mplp info
```

## Advanced Usage

### Custom Templates

Create your own templates by extending the ProjectTemplateManager:

```typescript
import { ProjectTemplateManager, ProjectTemplate } from '@mplp/cli';

class CustomTemplateManager extends ProjectTemplateManager {
  // Add custom template logic
}
```

### Plugin Development

Extend CLI functionality with plugins:

```typescript
import { CLIPlugin, CLIContext } from '@mplp/cli';

class MyPlugin implements CLIPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  
  async initialize(context: CLIContext): Promise<void> {
    // Plugin initialization
  }
}
```

### Programmatic Usage

Use CLI components in your own applications:

```typescript
import { CLIApplication, InitCommand } from '@mplp/cli';

const app = new CLIApplication(config);
app.addCommand(new InitCommand(context));
await app.run(['init', 'my-project']);
```

## Performance Tips

1. **Use appropriate templates** - Don't use enterprise template for simple projects
2. **Skip unnecessary steps** - Use `--no-git` or `--no-install` when appropriate
3. **Cache dependencies** - Use package manager caches effectively
4. **Parallel operations** - CLI runs operations in parallel when possible
5. **Clean up** - Remove unused dependencies and files regularly

## Community Guidelines

1. **Follow naming conventions** - Use kebab-case for project names
2. **Include documentation** - Document your agents and workflows
3. **Write tests** - Maintain good test coverage
4. **Share templates** - Contribute useful templates back to the community
5. **Report issues** - Help improve the CLI by reporting bugs and suggestions
