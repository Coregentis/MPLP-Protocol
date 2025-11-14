# MPLP Examples

> 🚀 **Example applications for MPLP v1.1.0 - From beginner to advanced**

[![MPLP](https://img.shields.io/badge/MPLP-v1.1.0--beta-purple.svg)](https://mplp.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

## 🌟 Overview

This directory contains example applications demonstrating different aspects of the MPLP platform, from simple "Hello World" examples using the core MPLP API to advanced enterprise applications using the full MPLP SDK.

**Two types of examples**:
- ✅ **Core API Examples** - Simple, beginner-friendly examples using MPLP core API
- 🚧 **SDK Examples** - Advanced enterprise applications using MPLP SDK packages

## 🎯 **Quick Start - Recommended for Beginners**

**Start with Hello World** (5 minutes):
```bash
cd examples/hello-world
npm install
npm run dev
```

This will run the simplest MPLP example and show you the basics!

## 📁 Example Applications

### ✅ **1. Hello World** - Core API (READY TO USE)

**Location**: `examples/hello-world/`
**Difficulty**: ⭐ Beginner
**Time**: 5 minutes
**Type**: Core MPLP API

The simplest way to get started with MPLP. Perfect for learning the basics.

**What you'll learn**:
- How to initialize MPLP with `quickStart()`
- How to access modules with `getModule()`
- How to check available modules
- How to configure MPLP for different environments

**Quick Start**:
```bash
cd examples/hello-world
npm install
npm run dev                  # Main example
npm run example:modules      # Module access patterns
npm run example:config       # Configuration options
```

**Perfect for**: First-time users, learning basics, quick prototyping

---

### ✅ **2. Agent Orchestrator** - SDK Application (READY TO USE)

**Location**: `examples/agent-orchestrator/`
**Difficulty**: ⭐⭐⭐ Advanced
**Time**: 30 minutes
**Type**: MPLP SDK

Enterprise-grade multi-agent orchestration platform built with MPLP SDK v1.1.0.

**What you'll learn**:
- Multi-agent coordination patterns
- Workflow orchestration
- Agent lifecycle management
- Enterprise-grade architecture

**Quick Start**:
```bash
cd examples/agent-orchestrator
npm install
npm run build
npm run dev
```

**Features**:
- 5 specialized agents (Planner, Creator, Reviewer, Publisher, Coordinator)
- Enterprise content creation workflow
- Multi-language content support
- Quality review workflow

**Perfect for**: Enterprise developers, complex multi-agent systems

---

### 🚧 **3. Marketing Automation** - SDK Application (ADVANCED)

**Location**: `examples/marketing-automation/`
**Difficulty**: ⭐⭐⭐ Advanced
**Type**: MPLP SDK

**What it demonstrates:**
- End-to-end marketing campaign management
- AI-powered content generation and optimization
- Advanced audience analysis and segmentation
- Lead generation, scoring, and nurturing
- Performance tracking and ROI optimization

**Key MPLP Features:**
- `@mplp/orchestrator` - Complex marketing workflow orchestration
- `@mplp/agent-builder` - Specialized marketing agents (content, audience, campaign)
- `@mplp/adapters` - Multi-platform marketing integrations
- `@mplp/cli` - Campaign management tools

**Use Cases:**
- Product launch campaigns
- Lead generation programs
- Content marketing automation
- Brand awareness campaigns
- Customer retention programs

---

### 3. [Enterprise Orchestration](./enterprise-orchestration/) - Multi-Agent Platform
> **Enterprise-grade multi-agent orchestration and management platform**

**What it demonstrates:**
- Distributed agent orchestration across clusters
- Service discovery and load balancing
- Enterprise security and access control
- Comprehensive monitoring and observability
- Auto-scaling and resource management
- Kubernetes and Docker deployment

**Key MPLP Features:**
- `@mplp/orchestrator` - Enterprise-scale agent orchestration
- `@mplp/dev-tools` - Advanced debugging and monitoring
- `@mplp/studio` - Visual orchestration management
- `@mplp/cli` - Cluster management tools

**Use Cases:**
- Large-scale distributed systems
- Microservices orchestration
- Enterprise automation platforms
- Cloud-native applications
- DevOps and infrastructure management

## 🚀 Quick Start Guide

### Prerequisites

Before running any example, you need to install MPLP:

#### **Install MPLP Core Package** ⚡

```bash
# Install MPLP core package (Required)
npm install mplp@beta

# Verify installation
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0
```

#### **System Prerequisites**

- **Node.js**: ≥18.0.0
- **npm**: ≥9.0.0
- **Docker**: ≥20.0.0 (optional)
- **Kubernetes**: ≥1.24.0 (optional)

### Running Any Example

```bash
# Clone the repository
git clone https://github.com/coregentis/mplp.git
cd MPLP-Protocol/examples

# Choose an example (replace with desired example)
cd coregentis-bot-v2

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Build and run
npm run build
npm start
```

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Or use Docker Compose (if available)
docker-compose up -d
```

## 📊 Feature Comparison

| Feature | CoregentisBot v2 | Marketing Workflow | Enterprise Orchestration |
|---------|------------------|-------------------|--------------------------|
| **Multi-Platform** | ✅ 7 platforms | ✅ 7 platforms | ✅ Platform agnostic |
| **AI Integration** | ✅ Content optimization | ✅ Content generation | ✅ Intelligent orchestration |
| **Real-time Analytics** | ✅ Social metrics | ✅ Campaign metrics | ✅ System metrics |
| **Enterprise Security** | ✅ Basic security | ✅ Campaign security | ✅ Full enterprise security |
| **Scalability** | 🟡 Medium scale | 🟡 Medium scale | ✅ Enterprise scale |
| **Kubernetes Support** | 🟡 Basic | 🟡 Basic | ✅ Full support |
| **Visual Interface** | ✅ Dashboard | ✅ Campaign console | ✅ Management console |
| **CLI Tools** | ✅ Basic CLI | ✅ Campaign CLI | ✅ Full CLI suite |

## 🎯 Learning Path

### Beginner: Start with CoregentisBot v2
- Learn basic MPLP concepts
- Understand agent creation and orchestration
- Explore multi-platform integrations
- Practice with real-world social media automation

### Intermediate: Explore Marketing Workflow
- Advanced workflow orchestration
- Complex agent interactions
- Campaign management concepts
- Performance optimization techniques

### Advanced: Master Enterprise Orchestration
- Distributed system architecture
- Enterprise security patterns
- Scalability and performance
- Production deployment strategies

## 🔧 Development Setup

### Local Development Environment

```bash
# Install MPLP CLI globally
npm install -g @mplp/cli

# Create new project based on example
mplp create my-project --template=coregentis-bot-v2

# Or clone and modify existing example
git clone https://github.com/coregentis/mplp.git
cd MPLP-Protocol/examples/coregentis-bot-v2
npm install
npm run dev
```

### IDE Setup

**Recommended VS Code Extensions:**
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Docker
- Kubernetes

**Configuration files included:**
- `.vscode/settings.json` - VS Code settings
- `.eslintrc.js` - ESLint configuration
- `prettier.config.js` - Prettier configuration
- `tsconfig.json` - TypeScript configuration

## 🧪 Testing

All examples include comprehensive test suites:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Coverage Standards

- **Unit Tests**: ≥90% coverage
- **Integration Tests**: ≥80% coverage
- **End-to-End Tests**: Core user journeys
- **Performance Tests**: Load and stress testing

## 📚 Documentation

### Example-Specific Documentation
- Each example includes comprehensive README with setup instructions
- API documentation and usage examples
- Architecture diagrams and explanations
- Troubleshooting guides

### General Resources
- [MPLP SDK Documentation](https://docs.mplp.dev)
- [API Reference](https://api.mplp.dev)
- [Best Practices Guide](https://docs.mplp.dev/best-practices)
- [Community Forum](https://community.mplp.dev)

## 🤝 Contributing

We welcome contributions to improve these examples!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Follow semantic versioning for changes

## 🆘 Support

### Getting Help

- 📚 [Documentation](https://docs.mplp.dev)
- 💬 [Discord Community](https://discord.gg/mplp)
- 🐛 [Issue Tracker](https://github.com/coregentis/mplp/issues)
- 📧 [Email Support](mailto:support@mplp.dev)

### Common Issues

**Installation Problems:**
- Ensure Node.js ≥18.0.0 is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Configuration Issues:**
- Check `.env` file configuration
- Verify API keys and credentials
- Review platform-specific setup requirements

**Runtime Errors:**
- Check logs in `./logs/` directory
- Verify all required services are running
- Check network connectivity and firewall settings

## 🔄 Updates and Versioning

These examples are actively maintained and updated with each MPLP SDK release:

- **Major Updates**: New features and architectural changes
- **Minor Updates**: Bug fixes and improvements
- **Patch Updates**: Security fixes and minor enhancements

**Stay Updated:**
- Watch the repository for updates
- Follow [@MPLPDev](https://twitter.com/mplpdev) on Twitter
- Subscribe to the [MPLP Newsletter](https://mplp.dev/newsletter)

## 📄 License

All examples are released under the MIT License - see [LICENSE](../LICENSE) file for details.

---

**Ready to build the future of multi-agent systems? Start with any example above! 🚀**

**Built with ❤️ using MPLP SDK v1.1.0**
