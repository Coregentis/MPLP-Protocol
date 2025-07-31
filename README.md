# MPLP v1.0

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/your-org/mplp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![DDD](https://img.shields.io/badge/Architecture-DDD-green.svg)](https://en.wikipedia.org/wiki/Domain-driven_design)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](./docs/BUILD.md)
[![Tests](https://img.shields.io/badge/tests-partial%20(core%20complete)-yellow.svg)](./docs/testing/test-status-dashboard.md)
[![Core Tests](https://img.shields.io/badge/core%20tests-43%2F43%20passing-brightgreen.svg)](./docs/testing/test-status-dashboard.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**Multi-Agent Project Lifecycle Protocol with Domain-Driven Design Architecture**

MPLP v1.0 is a comprehensive protocol framework designed for AI Agent ecosystem infrastructure, providing unified structural semantics and lifecycle management for multi-agent collaborative tasks.

## 🚀 Features

### Core Capabilities
- 🏗️ **DDD Architecture**: Complete Domain-Driven Design implementation across all modules
- 🔄 **Workflow Orchestration**: Advanced workflow management with parallel and sequential execution
- 🤖 **Multi-Agent Coordination**: Seamless coordination between multiple AI agents
- 📋 **Lifecycle Management**: Complete project lifecycle management from context to delivery
- 🔍 **Real-time Monitoring**: Comprehensive tracing and performance monitoring
- 🛡️ **Role-Based Security**: Advanced RBAC with fine-grained permissions
- 🔌 **Extension System**: Flexible plugin architecture for custom extensions

### Technical Excellence
- ✅ **100% TypeScript**: Full type safety with strict mode
- 📊 **Schema-Driven**: JSON Schema validation for all protocols
- 🌐 **Vendor-Neutral**: Platform-agnostic design
- 🔧 **Dependency Injection**: Clean architecture with IoC
- 📈 **Performance Monitoring**: Built-in metrics and bottleneck detection
- 🔄 **Error Recovery**: Automatic retry and rollback mechanisms

### Infrastructure Systems (v1.0.1)
- 🗄️ **Advanced Caching**: Multi-tier caching with Redis, memory, and file backends
- ⚡ **Workflow Engine**: Sophisticated workflow orchestration with event-driven coordination
- 🔍 **Enhanced Validation**: AJV-based schema validation with custom MPLP formats
- 📡 **Event System**: Comprehensive event bus with async/sync publishing and history
- 🛠️ **Testing Framework**: Complete integration testing with 80%+ coverage
- 🚨 **Error Handling**: Structured error management with recovery strategies

## 📦 Installation

```bash
npm install mplp
```

## 🏃‍♂️ Quick Start

### Basic Usage

```typescript
import { initializeCoreModule, WorkflowTemplates } from 'mplp';

// Initialize all modules
const moduleServices = {
  contextService: await initializeContextModule(),
  planService: await initializePlanModule(),
  confirmService: await initializeConfirmModule(),
  traceService: await initializeTraceModule(),
  roleService: await initializeRoleModule(),
  extensionService: await initializeExtensionModule()
};

// Initialize Core orchestrator
const core = await initializeCoreModule(moduleServices);

// Execute a workflow
const result = await core.orchestrator.executeWorkflow('context-id', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 300000
});

console.log('Workflow completed:', result.status);
```

## 🏗️ Architecture

MPLP v1.0 implements a complete **Domain-Driven Design (DDD)** architecture with the following structure:

### Core Modules

| Module | Purpose | DDD Layers |
|--------|---------|------------|
| **Context** | Context management and lifecycle | ✅ Complete |
| **Plan** | Planning and task orchestration | ✅ Complete |
| **Confirm** | Approval and confirmation workflows | ✅ Complete |
| **Trace** | Monitoring and event tracking | ✅ Complete |
| **Role** | RBAC and permission management | ✅ Complete |
| **Extension** | Plugin and extension management | ✅ Complete |
| **Core** | Runtime orchestrator and coordinator | ✅ Complete |

### DDD Layer Structure

Each module follows the standard 4-layer DDD architecture:

```
src/modules/{module}/
├── api/                 # API Layer
│   ├── controllers/     # REST controllers
│   └── dto/            # Data transfer objects
├── application/         # Application Layer
│   ├── services/       # Application services
│   ├── commands/       # Command handlers
│   └── queries/        # Query handlers
├── domain/             # Domain Layer
│   ├── entities/       # Domain entities
│   ├── repositories/   # Repository interfaces
│   └── services/       # Domain services
└── infrastructure/     # Infrastructure Layer
    ├── repositories/   # Repository implementations
    └── adapters/       # External adapters
```

## 📚 Documentation

### Core Documentation
- [🏗️ Architecture Guide](./docs/architecture/) - Complete DDD architecture overview
- [📖 API Reference](./docs/api/) - Comprehensive API documentation
- [🚀 Getting Started](./docs/guides/) - Step-by-step tutorials
- [🔧 Configuration](./docs/configuration/) - Configuration options

### Module Documentation
- [📝 Context Module](./docs/modules/context/) - Context management
- [📋 Plan Module](./docs/modules/plan/) - Planning and orchestration
- [✅ Confirm Module](./docs/modules/confirm/) - Approval workflows
- [📊 Trace Module](./docs/modules/trace/) - Monitoring and tracing
- [👥 Role Module](./docs/modules/role/) - Role and permission management
- [🔌 Extension Module](./docs/modules/extension/) - Extension system

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test suites
npm test -- --testPathPattern=unit
npm test -- --testPathPattern=integration
npm test -- --testPathPattern=e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**MPLP v1.0** - Building the future of AI Agent collaboration 🤖✨
