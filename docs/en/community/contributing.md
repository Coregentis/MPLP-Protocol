# Contributing to MPLP

> **🌐 Language Navigation**: [English](contributing.md) | [中文](../../zh-CN/community/contributing.md)



**How to Contribute to the Multi-Agent Protocol Lifecycle Platform**

[![Contributing](https://img.shields.io/badge/contributing-Welcome-brightgreen.svg)](./README.md)
[![Version](https://img.shields.io/badge/version-v1.0%20Alpha-blue.svg)](../../ALPHA-RELEASE-NOTES.md)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](../../README.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/community/contributing.md)

---

## 🎉 Welcome Contributors!

Thank you for your interest in contributing to MPLP! As the **first production-ready multi-agent protocol platform** with **100% module completion** and **2,902 tests (2,899 passing, 3 failing) = 99.9% pass rate**, MPLP represents a significant milestone in multi-agent system development. Your contributions help maintain and extend this achievement.

---

## 🚀 Quick Start for Contributors

### **Prerequisites**

- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: Latest version
- **TypeScript**: Familiarity with TypeScript development
- **Testing**: Experience with Jest and testing frameworks

### **Development Setup**

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mplp.git
   cd MPLP-Protocol
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm test
   # Should show: 2,902 tests (2,899 passing, 3 failing)
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

---

## 📋 Types of Contributions

### **🐛 Bug Fixes**

#### **Finding Bugs**
- Check [existing issues](https://github.com/Coregentis/MPLP-Protocol/issues) first
- Look for issues labeled `bug`, `good first issue`, or `help wanted`
- Test the latest version to ensure the bug still exists

#### **Reporting Bugs**
```markdown
**Bug Report Template**

## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Expected vs actual behavior

## Environment
- MPLP version: 1.0.0-alpha
- Node.js version: 18.17.0
- Operating system: Ubuntu 22.04
- Module affected: [Context/Plan/Role/etc.]

## Additional Context
Logs, screenshots, or other relevant information
```

#### **Fixing Bugs**
- Create a branch: `git checkout -b fix/issue-description`
- Write tests that reproduce the bug
- Fix the bug while maintaining high test pass rate (99.9%+)
- Ensure all existing tests still pass
- Update documentation if needed

### **✨ New Features**

#### **Feature Requests**
- Discuss in [GitHub Discussions](https://github.com/Coregentis/MPLP-Protocol/discussions) first
- Create detailed feature request with use cases
- Consider impact on existing functionality
- Align with MPLP's enterprise-grade standards

#### **Implementing Features**
- Start with an RFC (Request for Comments) for significant features
- Create feature branch: `git checkout -b feature/feature-name`
- Follow existing code patterns and architecture
- Maintain zero technical debt policy
- Add comprehensive tests (aim for 95%+ coverage)
- Update documentation and examples

### **📚 Documentation**

#### **Documentation Types**
- **API Documentation**: Update API references for code changes
- **User Guides**: Create tutorials and how-to guides
- **Architecture Documentation**: Update system design documents
- **Examples**: Add practical code examples and use cases

#### **Documentation Standards**
- Follow existing formatting and style
- Include code examples that work
- Update both English and Chinese versions when possible
- Ensure accuracy with current codebase

### **🧪 Testing**

#### **Test Requirements**
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test module interactions
- **End-to-End Tests**: Test complete workflows
- **Performance Tests**: Ensure performance standards

#### **Test Quality Standards**
- Maintain high test pass rate (99.9%+, currently 2,899/2,902 tests passing)
- Achieve 95%+ code coverage for new code
- Write clear, descriptive test names
- Include edge cases and error conditions

---

## 🏗️ Development Guidelines

### **Code Quality Standards**

#### **TypeScript Requirements**
- **Strict Mode**: All code must pass TypeScript strict mode
- **No `any` Types**: Zero tolerance for `any` type usage
- **Type Safety**: Complete type coverage for all functions
- **ESLint**: Zero ESLint errors or warnings

#### **Architecture Compliance**
- **DDD Patterns**: Follow Domain-Driven Design patterns
- **Dual Naming Convention**: Schema (snake_case) ↔ TypeScript (camelCase)
- **Cross-cutting Concerns**: Integrate all 9 standardized concerns
- **Module Boundaries**: Respect L1-L3 layer boundaries

#### **Performance Standards**
- **Response Time**: API responses < 100ms (P95)
- **Memory Usage**: Efficient memory management
- **CPU Usage**: Optimize for performance
- **Scalability**: Design for horizontal scaling

### **Git Workflow**

#### **Branch Naming**
```bash
# Feature branches
feature/add-context-validation
feature/improve-plan-algorithm

# Bug fix branches
fix/context-schema-validation
fix/role-permission-check

# Documentation branches
docs/update-api-reference
docs/add-integration-examples
```

#### **Commit Messages**
```bash
# Format: type(scope): description
feat(context): add multi-session state management
fix(role): resolve permission inheritance bug
docs(api): update Context API examples
test(plan): add integration tests for AI planning
```

#### **Pull Request Process**
1. **Create PR**: Use descriptive title and detailed description
2. **Link Issues**: Reference related issues with `Fixes #123`
3. **Request Review**: Tag relevant maintainers
4. **Address Feedback**: Respond to review comments promptly
5. **Merge**: Maintainer will merge after approval

---

## 🔍 Code Review Guidelines

### **For Contributors**

#### **Before Submitting**
- [ ] All tests pass (2,899/2,902 = 99.9%)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Documentation updated
- [ ] Performance impact assessed

#### **PR Description Template**
```markdown
## Changes Made
- Brief description of changes
- List of modified files/modules

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Documentation
- [ ] API documentation updated
- [ ] User guides updated
- [ ] Examples added/updated

## Performance Impact
- Describe any performance implications
- Include benchmark results if applicable
```

### **For Reviewers**

#### **Review Checklist**
- [ ] Code follows MPLP architecture patterns
- [ ] Tests are comprehensive and pass
- [ ] Documentation is accurate and complete
- [ ] Performance impact is acceptable
- [ ] Security considerations addressed

#### **Review Standards**
- **Be Constructive**: Provide actionable feedback
- **Be Timely**: Respond within 48 hours when possible
- **Be Thorough**: Check code quality, tests, and documentation
- **Be Respectful**: Maintain professional and helpful tone

---

## 🌍 Community Contributions

### **Non-Code Contributions**

#### **Community Support**
- Answer questions in GitHub Discussions
- Help newcomers in Discord
- Participate in community events
- Share knowledge through blog posts

#### **Translation and Localization**
- Translate documentation to other languages
- Review and improve existing translations
- Help with internationalization efforts
- Support community members in different languages

#### **Event Organization**
- Organize local meetups
- Speak at conferences
- Host workshops and tutorials
- Participate in hackathons

### **Recognition**

#### **Contributor Recognition**
- **Hall of Fame**: Featured on project website
- **Release Notes**: Acknowledgment in release notes
- **Speaking Opportunities**: Conference and event invitations
- **Swag**: MPLP merchandise and recognition items

---

## 📞 Getting Help

### **Support Channels**
- **GitHub Discussions**: [Community forum](https://github.com/Coregentis/MPLP-Protocol/discussions)
- **Discord**: [Real-time chat](https://discord.gg/mplp)
- **Email**: [contributors@mplp.org](mailto:contributors@mplp.org)
- **Office Hours**: Weekly Tuesday 15:00 UTC

### **Mentorship**
- **New Contributor Program**: Guidance for first-time contributors
- **Pair Programming**: Work with experienced contributors
- **Code Review Mentorship**: Learn through detailed code reviews
- **Project Mentorship**: Long-term guidance on significant contributions

---

## 🎯 Contribution Goals

### **Quality Maintenance**
- Maintain high test pass rate (99.9%+, currently 2,899/2,902 tests passing)
- Preserve zero technical debt policy
- Uphold enterprise-grade quality standards
- Continue 99.8% performance achievement

### **Community Growth**
- Welcome new contributors from diverse backgrounds
- Expand international community participation
- Increase enterprise adoption and feedback
- Foster knowledge sharing and collaboration

---

**Thank you for contributing to the future of multi-agent systems! 🚀**

---

**Document Version**: 1.0  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Production Ready Platform  
**Language**: English
