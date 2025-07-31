# Contributing to MPLP

Thank you for your interest in contributing to MPLP (Multi-Agent Project Lifecycle Protocol)! We welcome contributions from the community and are grateful for your support.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.0.0
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mplp.git
   cd mplp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build Project**
   ```bash
   npm run build
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features or improvements
- 📖 **Documentation**: Improve or add documentation
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Code**: Fix bugs or implement features
- 🎨 **Examples**: Add usage examples or tutorials

### Before Contributing

1. **Check Existing Issues**: Search existing issues to avoid duplicates
2. **Discuss Major Changes**: Open an issue for significant changes
3. **Follow Architecture**: Respect the DDD (Domain-Driven Design) architecture
4. **Maintain Quality**: Ensure code quality and test coverage

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow our coding standards
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new context validation feature"
git commit -m "fix: resolve memory leak in workflow manager"
git commit -m "docs: update API documentation"
git commit -m "test: add integration tests for plan module"
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Test additions/modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### 4. Submit Pull Request

1. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues
   - Add screenshots if applicable

3. **Review Process**
   - Automated checks must pass
   - Code review by maintainers
   - Address feedback promptly
   - Maintain clean commit history

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, npm version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Error Messages**: Full error logs
- **Code Samples**: Minimal reproduction case

### Feature Requests

For feature requests, please provide:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Use Cases**: Real-world scenarios
- **Breaking Changes**: Any compatibility concerns

## 🔧 Development Workflow

### Architecture Overview

MPLP follows Domain-Driven Design (DDD) with these layers:

```
src/
├── modules/           # Domain modules (context, plan, confirm, etc.)
│   ├── {module}/
│   │   ├── api/       # API layer
│   │   ├── application/ # Application services
│   │   ├── domain/    # Domain entities and logic
│   │   └── infrastructure/ # Infrastructure concerns
├── public/            # Public APIs and utilities
├── shared/            # Shared types and utilities
└── core/              # Core infrastructure
```

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Auto-formatting enabled
- **Naming**: Use descriptive, meaningful names
- **Comments**: Document complex logic
- **Types**: Prefer explicit types over `any`

### Module Development

When adding new modules:

1. Follow the DDD structure
2. Implement all four layers (API, Application, Domain, Infrastructure)
3. Add comprehensive tests
4. Update module registry
5. Add documentation

## 🧪 Testing Guidelines

### Test Structure

```
tests/
├── modules/           # Module-specific tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
├── performance/       # Performance tests
└── fixtures/         # Test data and utilities
```

### Test Requirements

- **Unit Tests**: 100% coverage for domain logic
- **Integration Tests**: Module interactions
- **E2E Tests**: Complete workflows
- **Performance Tests**: Benchmark critical paths

### Running Tests

```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# With coverage
npm run test:coverage
```

## 📖 Documentation

### Documentation Types

- **API Documentation**: Generated from TypeScript
- **User Guides**: How-to guides and tutorials
- **Architecture Docs**: Design decisions and patterns
- **Examples**: Working code samples

### Documentation Standards

- **Clear Language**: Simple, concise explanations
- **Code Examples**: Working, tested examples
- **Up-to-date**: Keep docs synchronized with code
- **Comprehensive**: Cover all public APIs

## 🌟 Community

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Documentation**: Check existing docs first

### Recognition

Contributors are recognized in:

- **CHANGELOG.md**: Notable contributions
- **AUTHORS.md**: All contributors
- **Release Notes**: Major contributions

## 📄 License

By contributing to MPLP, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Thank you for contributing to MPLP! Your efforts help make this project better for everyone.

---

For questions about contributing, please open an issue or start a discussion.
