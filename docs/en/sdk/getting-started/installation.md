# MPLP SDK Installation Guide

> **🌐 Language Navigation**: [English](installation.md) | [中文](../../../zh-CN/sdk/getting-started/installation.md)


> **SDK Version**: v1.1.0-beta  
> **Base Protocol**: MPLP v1.0 Alpha  
> **Last Updated**: 2025-09-20  

## 🎯 **Installation Overview**

MPLP SDK provides a complete development environment for building multi-agent applications. This guide will walk you through the installation process and help you set up your development environment.

### **System Requirements**
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (or yarn 1.22.0+)
- **TypeScript**: 5.0.0 or higher
- **Git**: 2.0.0 or higher

### **Supported Platforms**
- ✅ **Windows**: Windows 10/11 (x64)
- ✅ **macOS**: macOS 10.15+ (Intel/Apple Silicon)
- ✅ **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 10+

## 📦 **Installation Methods**

### **Method 1: Quick Install (Recommended)**

Install the complete MPLP SDK with a single command:

```bash
# Install MPLP CLI globally
npm install -g @mplp/cli

# Verify installation
mplp --version
# Expected output: @mplp/cli/1.1.0-beta

# Create your first project
mplp create my-agent-app
cd my-agent-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Method 2: Manual Package Installation**

Install individual SDK packages as needed:

```bash
# Core SDK packages
npm install @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator

# Development tools
npm install -D @mplp/dev-tools

# Platform adapters (choose what you need)
npm install @mplp/adapters

# CLI tools (optional, for project scaffolding)
npm install -g @mplp/cli
```

### **Method 3: Development Installation**

For contributors and advanced users:

```bash
# Clone the repository
git clone https://github.com/mplp-org/mplp.git
cd mplp

# Install dependencies
npm install

# Build all packages
npm run build

# Link packages locally
npm run link:all

# Run tests
npm test
```

## 🔧 **Package Details**

### **Core Packages**

#### **@mplp/sdk-core**
The foundation of all MPLP applications.

```bash
npm install @mplp/sdk-core
```

**Features:**
- Application framework and lifecycle management
- Event system and configuration management
- Health monitoring and error handling
- Module registration and dependency injection

#### **@mplp/agent-builder**
Tools for creating and configuring agents.

```bash
npm install @mplp/agent-builder
```

**Features:**
- Fluent API for agent creation
- Agent templates and presets
- Lifecycle management
- Platform adapter integration

#### **@mplp/orchestrator**
Multi-agent coordination and workflow management.

```bash
npm install @mplp/orchestrator
```

**Features:**
- Workflow engine and task scheduling
- Resource management and monitoring
- Multi-agent coordination
- Performance optimization

### **Development Tools**

#### **@mplp/cli**
Command-line interface for project management.

```bash
npm install -g @mplp/cli
```

**Commands:**
- `mplp create <name>` - Create new project
- `mplp dev` - Start development server
- `mplp build` - Build for production
- `mplp test` - Run tests
- `mplp deploy` - Deploy to cloud

#### **@mplp/dev-tools**
Development and debugging utilities.

```bash
npm install -D @mplp/dev-tools
```

**Features:**
- Real-time debugging interface
- Performance monitoring and profiling
- Log aggregation and analysis
- Development server with hot reload

### **Platform Adapters**

#### **@mplp/adapters**
Complete platform integration ecosystem.

```bash
npm install @mplp/adapters
```

**Included Adapters:**
- **Twitter**: Social media automation
- **LinkedIn**: Professional networking
- **GitHub**: Code collaboration
- **Discord**: Community management
- **Slack**: Team communication
- **Reddit**: Community engagement
- **Medium**: Content publishing

## 🚀 **Verification**

### **Installation Verification**

Verify your installation with these commands:

```bash
# Check Node.js version
node --version
# Should be 18.0.0 or higher

# Check npm version
npm --version
# Should be 8.0.0 or higher

# Check MPLP CLI
mplp --version
# Should show @mplp/cli/1.1.0-beta

# Check TypeScript (if installed globally)
tsc --version
# Should be 5.0.0 or higher
```

### **Quick Test**

Create and run a simple test application:

```bash
# Create test project
mplp create test-app --template minimal
cd test-app

# Install dependencies
npm install

# Run tests
npm test
# Should show all tests passing

# Start development server
npm run dev
# Should start server on http://localhost:3000
```

## 🛠️ **Development Environment Setup**

### **IDE Configuration**

#### **Visual Studio Code (Recommended)**

Install the MPLP extension pack:

```bash
# Install VS Code extensions
code --install-extension mplp.mplp-extension-pack
```

**Included Extensions:**
- MPLP Language Support
- TypeScript and JavaScript
- ESLint and Prettier
- GitLens and Git Graph
- REST Client for API testing

#### **WebStorm/IntelliJ IDEA**

Configure TypeScript and Node.js support:

1. Enable TypeScript service
2. Configure Node.js interpreter
3. Install MPLP plugin from marketplace
4. Set up ESLint and Prettier

### **Environment Variables**

Create a `.env` file in your project root:

```bash
# Development environment
NODE_ENV=development
MPLP_LOG_LEVEL=debug

# API Keys (replace with your actual keys)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
GITHUB_TOKEN=your_github_token

# Database (if using)
DATABASE_URL=postgresql://localhost:5432/mplp_dev

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

### **Docker Setup (Optional)**

Use Docker for consistent development environment:

```bash
# Pull MPLP development image
docker pull mplp/dev-environment:latest

# Run development container
docker run -it -v $(pwd):/workspace mplp/dev-environment:latest

# Or use docker-compose
docker-compose up -d
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Node.js Version Issues**
```bash
# Error: Node.js version too old
# Solution: Update Node.js
nvm install 18
nvm use 18
```

#### **Permission Issues (macOS/Linux)**
```bash
# Error: EACCES permission denied
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### **Windows Path Issues**
```bash
# Error: Command not found
# Solution: Add to PATH or use full path
npm config set prefix %APPDATA%\npm
```

#### **TypeScript Compilation Errors**
```bash
# Error: TypeScript compilation failed
# Solution: Check TypeScript version and configuration
npm install -D typescript@^5.0.0
npx tsc --init
```

### **Getting Help**

If you encounter issues:

1. **Check Documentation**: [MPLP Documentation](../../README.md)
2. **Search Issues**: [GitHub Issues](https://github.com/mplp-org/mplp/issues)
3. **Community Support**: [Discord Server](https://discord.gg/mplp)
4. **Professional Support**: support@mplp.dev

## 📚 **Next Steps**

After successful installation:

1. **[Quick Start Tutorial](quick-start.md)** - Build your first agent in 30 minutes
2. **[First Agent Guide](first-agent.md)** - Detailed agent creation walkthrough
3. **API Reference (开发中)** - Complete API documentation
4. **Examples (开发中)** - Sample applications and use cases

## 🔗 **Related Resources**

- [MPLP Protocol Documentation](../../protocol/README.md)
- [SDK Architecture Guide](../guides/architecture.md)
- [Best Practices](../guides/best-practices.md)
- [Performance Guide](../guides/performance.md)

---

**Installation Support**: installation-support@mplp.dev  
**Documentation Team**: MPLP SDK Team  
**Last Updated**: 2025-09-20  
**Next Review**: 2025-10-20
