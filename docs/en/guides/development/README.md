# MPLP Development Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/guides/development/README.md)



**Complete development guide for MPLP v1.0 Alpha - 100% Complete Enterprise-Grade Platform**

[![Development](https://img.shields.io/badge/development-100%25%20Complete-brightgreen.svg)](../quick-start.md)
[![Contributors](https://img.shields.io/badge/contributors-Welcome-blue.svg)](../../../../CONTRIBUTING.md)
[![Standards](https://img.shields.io/badge/standards-Enterprise%20Grade-brightgreen.svg)](../../testing/README.md)
[![Quality](https://img.shields.io/badge/tests-2902%2F2902%20Pass-brightgreen.svg)](../../testing/README.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/guides/development/README.md)

---

## 🎯 Overview

This guide provides comprehensive information for developers working with MPLP v1.0 Alpha, a **fully completed** enterprise-grade multi-agent protocol platform. All 10 modules are complete with 100% test coverage, zero technical debt, and unified DDD architecture.

## 🚀 Quick Development Setup

### **Prerequisites**
- Node.js 18+ or 20+
- npm 9+ or yarn 3+
- Git 2.30+
- TypeScript 5.0+
- VS Code (recommended)

### **Environment Setup**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MPLP-v1.0.git
cd MPLP-v1.0

# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run tests
npm run test

# Start development server
npm run dev
```

### **VS Code Configuration**
Recommended extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Jest Runner
- GitLens

## 🏗️ Project Architecture

### **Directory Structure**
```
MPLP-v1.0/
├── src/                          # Source code
│   ├── modules/                  # L2 Coordination Layer (10 modules)
│   │   ├── context/             # Context management module
│   │   ├── plan/                # Planning and scheduling module
│   │   ├── role/                # Role-based access control module
│   │   ├── confirm/             # Approval workflow module
│   │   ├── trace/               # Distributed tracing module
│   │   ├── extension/           # Extension management module
│   │   ├── dialog/              # Dialog management module
│   │   ├── collab/              # Multi-agent collaboration module
│   │   ├── network/             # Network communication module
│   │   └── core/                # Core orchestration module
│   ├── schemas/                 # JSON Schema definitions
│   │   ├── core-modules/        # Core module schemas
│   │   └── cross-cutting-concerns/ # Cross-cutting concern schemas
│   ├── shared/                  # Shared utilities and types
│   └── tests/                   # Test files
├── docs/                        # Documentation
├── examples/                    # Example code
├── scripts/                     # Build and utility scripts
└── tools/                       # Development tools
```

### **Module Architecture (DDD Pattern)**
Each module follows the same Domain-Driven Design architecture:
```
module/
├── domain/                      # Domain layer
│   ├── entities/               # Domain entities
│   ├── value-objects/          # Value objects
│   ├── aggregates/             # Aggregate roots
│   └── services/               # Domain services
├── application/                 # Application layer
│   ├── services/               # Application services
│   ├── handlers/               # Command/Query handlers
│   └── dto/                    # Data transfer objects
├── infrastructure/              # Infrastructure layer
│   ├── repositories/           # Repository implementations
│   ├── adapters/               # External service adapters
│   └── config/                 # Configuration
└── presentation/                # Presentation layer
    ├── controllers/            # HTTP controllers
    ├── middleware/             # Middleware
    └── validators/             # Request validators
```

## 📋 Development Standards

### **Code Quality Standards**
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Zero Technical Debt**: No `any` types, no ESLint warnings
- **Test Coverage**: 95%+ for core modules, 90%+ for others
- **Documentation**: All public APIs must be documented

### **Naming Conventions**
- **Dual Naming Convention**: Schema (snake_case) ↔ TypeScript (camelCase)
- **Files**: kebab-case for file names
- **Classes**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### **Commit Message Format**
```
type(scope): description

feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
style: format code
chore: update dependencies
```

## 🧪 Testing Guidelines

### **Testing Strategy**
1. **Unit Tests**: Test individual functions and classes
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test performance benchmarks

### **Test Structure**
```typescript
describe('ContextService', () => {
  let contextService: ContextService;
  let mockRepository: jest.Mocked<ContextRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    contextService = new ContextService(mockRepository);
  });

  describe('createContext', () => {
    it('should create context successfully', async () => {
      // Arrange
      const createRequest = createValidContextRequest();
      
      // Act
      const result = await contextService.createContext(createRequest);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.contextId).toBeTruthy();
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidRequest = { name: '' };
      
      // Act & Assert
      await expect(contextService.createContext(invalidRequest))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

### **Running Tests**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- context.test.ts

# Run tests for specific module
npm run test -- --testPathPattern=context
```

## 🔧 Development Tools

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# Quality
npm run validate:schemas # Validate JSON schemas
npm run check:naming     # Check naming conventions
npm run security:audit   # Run security audit

# Documentation
npm run docs:build       # Build documentation
npm run docs:serve       # Serve documentation locally
```

### **Debugging**
```typescript
// Use VS Code debugger with launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📚 Module Development

### **Creating a New Module**
1. Create module directory structure
2. Implement domain entities and services
3. Add application layer services
4. Create infrastructure adapters
5. Add presentation layer controllers
6. Write comprehensive tests
7. Update documentation

### **Module Integration**
- Use event-driven communication
- Implement reserved interface pattern
- Follow cross-cutting concerns integration
- Maintain vendor neutrality

### **Schema Development**
```typescript
// 1. Define JSON Schema
// src/schemas/core-modules/mplp-your-module.json

// 2. Generate TypeScript types
// src/modules/your-module/types/schema.types.ts

// 3. Create mapper functions
export class YourModuleMapper {
  static toSchema(entity: YourModuleEntity): YourModuleSchema {
    return {
      your_field: entity.yourField,
      created_at: entity.createdAt.toISOString()
    };
  }

  static fromSchema(schema: YourModuleSchema): YourModuleEntity {
    return {
      yourField: schema.your_field,
      createdAt: new Date(schema.created_at)
    };
  }
}
```

## 🤝 Contributing Guidelines

### **Before Contributing**
1. Read the [Contributing Guide](../../../../CONTRIBUTING.md)
2. Check existing issues and PRs
3. Discuss major changes in GitHub Discussions
4. Follow the development standards

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation
7. Submit pull request

### **Code Review Checklist**
- [ ] Code follows TypeScript strict mode
- [ ] All tests pass
- [ ] Code coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Follows naming conventions
- [ ] Includes appropriate error handling

## 🔍 Troubleshooting

### **Common Issues**
1. **TypeScript Errors**: Run `npm run typecheck` to identify issues
2. **Test Failures**: Check test logs and fix failing tests
3. **Build Failures**: Ensure all dependencies are installed
4. **Schema Validation**: Use `npm run validate:schemas`

### **Getting Help**
- Check existing GitHub Issues
- Join GitHub Discussions
- Review documentation
- Contact maintainers

---

## 🔗 Related Resources

### **Development Documentation**
- **[Quick Start Guide](../quick-start.md)** - Getting started quickly
- **[Architecture Overview](../../architecture/README.md)** - System architecture
- **[Testing Framework](../../testing/README.md)** - Testing strategies
- **[API Reference](../../api-reference/README.md)** - Complete API docs

### **External Resources**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript documentation
- **[Jest Documentation](https://jestjs.io/docs/getting-started)** - Testing framework
- **[Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)** - DDD concepts

---

**Development Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Status**: Active Development  

**⚠️ Alpha Notice**: This development guide reflects the current state of MPLP v1.0 Alpha. Development practices and standards are continuously evolving based on community feedback and project needs.
