# MPLP CLI Examples

## Basic Usage Examples

### Creating Your First Project

```bash
# Create a basic project
mplp init my-first-agent

# Navigate to the project
cd my-first-agent

# Check project information
mplp info

# Start development
npm run dev
```

### Using Different Templates

```bash
# Basic template (default)
mplp init simple-agent --template basic

# Advanced template with orchestration
mplp init complex-system --template advanced

# Enterprise template with full toolchain
mplp init production-system --template enterprise
```

## Project Creation Scenarios

### Scenario 1: Learning Project

```bash
# Create a simple learning project
mplp init learning-mplp \
  --template basic \
  --description "Learning MPLP concepts" \
  --author "Student Name" \
  --license MIT

cd learning-mplp
npm run dev
```

**Generated Structure:**
```
learning-mplp/
├── src/
│   └── index.ts          # Simple agent example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Scenario 2: Multi-Agent System

```bash
# Create an advanced project with orchestration
mplp init social-media-manager \
  --template advanced \
  --description "Multi-agent social media management system" \
  --author "Development Team" \
  --typescript \
  --eslint

cd social-media-manager
```

**Generated Structure:**
```
social-media-manager/
├── src/
│   ├── agents/
│   │   └── GreetingAgent.ts
│   ├── workflows/
│   │   └── GreetingWorkflow.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Scenario 3: Enterprise Production System

```bash
# Create enterprise-ready project
mplp init customer-service-platform \
  --template enterprise \
  --description "Enterprise customer service automation platform" \
  --author "Enterprise Team <team@company.com>" \
  --license Apache-2.0 \
  --typescript \
  --eslint \
  --prettier

cd customer-service-platform
```

**Generated Structure:**
```
customer-service-platform/
├── src/
│   ├── agents/
│   ├── workflows/
│   ├── config/
│   │   └── index.ts
│   └── index.ts
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Advanced Configuration Examples

### Custom Directory Structure

```bash
# Create project in specific directory
mplp init my-agent --directory ./projects/agents/my-agent

# Create project with custom name but different directory
mplp init customer-agent --directory ./services/customer-service
```

### Skip Certain Steps

```bash
# Skip Git initialization (useful for existing repos)
mplp init my-agent --no-git

# Skip dependency installation (for custom package managers)
mplp init my-agent --no-install
cd my-agent
pnpm install  # Use pnpm instead of npm

# Skip both Git and installation
mplp init my-agent --no-git --no-install
```

## Information and Help Examples

### Getting Project Information

```bash
# Show all information
mplp info

# Show only environment information
mplp info --env

# Show only project information (when in project directory)
mplp info --project

# Output as JSON for scripting
mplp info --json > project-info.json
```

### Getting Help

```bash
# General help
mplp help

# Help for specific command
mplp help init

# Show all available commands
mplp help --all

# Command-specific help using --help flag
mplp init --help
```

## Real-World Project Examples

### Example 1: E-commerce Assistant

```bash
# Create e-commerce assistant system
mplp init ecommerce-assistant \
  --template advanced \
  --description "Multi-agent e-commerce customer assistance system" \
  --author "E-commerce Team"

cd ecommerce-assistant
```

**Typical agents in this system:**
- Product recommendation agent
- Order processing agent
- Customer support agent
- Inventory management agent

### Example 2: Content Management System

```bash
# Create content management system
mplp init cms-automation \
  --template enterprise \
  --description "Automated content management and publishing system" \
  --typescript \
  --eslint

cd cms-automation
```

**Typical workflows:**
- Content creation workflow
- Review and approval workflow
- Publishing workflow
- Analytics workflow

### Example 3: Data Processing Pipeline

```bash
# Create data processing system
mplp init data-pipeline \
  --template advanced \
  --description "Multi-agent data processing and analysis pipeline"

cd data-pipeline
```

**Typical components:**
- Data ingestion agent
- Data validation agent
- Data transformation agent
- Data analysis agent
- Report generation agent

## Development Workflow Examples

### Daily Development Routine

```bash
# Start your day
cd my-mplp-project

# Check project status
mplp info --project

# Start development server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch

# Make changes to your code...

# Before committing
npm test
npm run build
npm run lint
```

### Testing Different Scenarios

```bash
# Test with different Node.js versions
nvm use 16
mplp init test-node16 --template basic

nvm use 18
mplp init test-node18 --template basic

nvm use 20
mplp init test-node20 --template basic
```

### Debugging Issues

```bash
# Enable debug mode
DEBUG=true mplp init my-project --template advanced

# Verbose output
mplp init my-project --verbose

# Check environment
mplp info --env --json
```

## Integration Examples

### CI/CD Pipeline Integration

```bash
# In your CI/CD script
#!/bin/bash

# Install CLI
npm install -g @mplp/cli

# Create project for testing
mplp init test-project --template basic --no-git --no-install

# Navigate and install dependencies
cd test-project
npm install

# Run tests
npm test

# Build project
npm run build
```

### Docker Integration

```bash
# Create enterprise project with Docker support
mplp init my-service --template enterprise

cd my-service

# Build Docker image
npm run docker:build

# Run in container
npm run docker:run

# Or use docker-compose
docker-compose up
```

### Package Manager Integration

```bash
# With npm (default)
mplp init my-project
cd my-project
npm install

# With yarn
mplp init my-project --no-install
cd my-project
yarn install

# With pnpm
mplp init my-project --no-install
cd my-project
pnpm install
```

## Scripting Examples

### Batch Project Creation

```bash
#!/bin/bash

# Create multiple related projects
projects=("user-service" "order-service" "payment-service" "notification-service")

for project in "${projects[@]}"; do
  mplp init "$project" \
    --template enterprise \
    --description "Microservice for $project" \
    --author "Microservices Team" \
    --no-install
done

# Install dependencies for all projects
for project in "${projects[@]}"; do
  cd "$project"
  npm install
  cd ..
done
```

### Project Health Check

```bash
#!/bin/bash

# Check project health
echo "Checking project health..."

# Get project info
mplp info --project --json > project-info.json

# Check if it's a valid MPLP project
if jq -e '.isProject' project-info.json > /dev/null; then
  echo "✅ Valid MPLP project"
else
  echo "❌ Not a valid MPLP project"
  exit 1
fi

# Check dependencies
npm audit

# Run tests
npm test

# Build project
npm run build

echo "✅ Project health check completed"
```

## Troubleshooting Examples

### Common Issues and Solutions

```bash
# Issue: Command not found
# Solution: Install CLI globally
npm install -g @mplp/cli

# Issue: Permission denied
# Solution: Fix npm permissions or use nvm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Issue: Template not found
# Solution: Check available templates
mplp help init

# Issue: Git not initialized
# Solution: Initialize manually
cd my-project
git init
git add .
git commit -m "Initial commit"

# Issue: Dependencies not installed
# Solution: Install manually
cd my-project
npm install

# Issue: TypeScript errors
# Solution: Check TypeScript configuration
npm run typecheck
```

### Debug Information Collection

```bash
# Collect debug information
echo "=== Environment Information ===" > debug.log
mplp info --env >> debug.log

echo "=== Project Information ===" >> debug.log
mplp info --project >> debug.log

echo "=== Node.js Information ===" >> debug.log
node --version >> debug.log
npm --version >> debug.log

echo "=== System Information ===" >> debug.log
uname -a >> debug.log

# Send debug.log when reporting issues
```

These examples cover the most common use cases and scenarios you'll encounter when using the MPLP CLI. Each example includes the complete command and expected outcomes to help you get started quickly.
