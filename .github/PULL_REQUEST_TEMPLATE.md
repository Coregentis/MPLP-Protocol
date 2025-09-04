# Pull Request

## 📋 **PR Information**

**Type of Change** (check all that apply):
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test improvements
- [ ] 🔒 Security improvement
- [ ] 🏗️ Build/CI changes

**Affected Module(s)**:
- [ ] Core (MPLPCore)
- [ ] Context
- [ ] Plan
- [ ] Role
- [ ] Confirm
- [ ] Trace
- [ ] Extension
- [ ] Dialog
- [ ] Collab
- [ ] Network
- [ ] CoreOrchestrator
- [ ] Documentation
- [ ] Build/CI
- [ ] Other: ___________

## 📝 **Description**

### Summary
<!-- Provide a brief summary of the changes -->

### Motivation and Context
<!-- Why is this change required? What problem does it solve? -->
<!-- If it fixes an open issue, please link to the issue here -->
Fixes #(issue_number)

### Detailed Changes
<!-- Describe the changes in detail -->

## 🧪 **Testing**

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] End-to-end tests added/updated
- [ ] Manual testing completed

### Test Results
```bash
# Paste test results here
npm test
```

### Testing Checklist
- [ ] All existing tests pass
- [ ] New tests cover the changes
- [ ] Test coverage meets requirements (≥90%)
- [ ] No flaky tests introduced

## 📊 **Quality Checks**

### Code Quality
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] Code follows project conventions
- [ ] No `any` types used (zero tolerance policy)

### MPLP Standards
- [ ] Dual naming convention followed (Schema: snake_case, TypeScript: camelCase)
- [ ] Schema validation implemented where applicable
- [ ] Mapping functions created/updated if needed
- [ ] Cross-cutting concerns properly integrated

### Documentation
- [ ] Code is self-documenting with clear variable/function names
- [ ] Complex logic is commented
- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

## 🔒 **Security**

- [ ] No sensitive information exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization considered
- [ ] Security best practices followed

## 📈 **Performance**

### Performance Impact
- [ ] No performance regression
- [ ] Performance improvement (describe below)
- [ ] Performance impact acceptable for the feature
- [ ] Performance testing completed

### Performance Notes
<!-- Describe any performance considerations or improvements -->

## 🔄 **Breaking Changes**

### Breaking Changes (if any)
- [ ] No breaking changes
- [ ] Breaking changes documented below

### Migration Guide (if breaking changes)
<!-- Provide migration instructions for users -->

## 🔗 **Dependencies**

### New Dependencies
- [ ] No new dependencies
- [ ] New dependencies listed and justified below

### Dependency Changes
<!-- List any new dependencies and explain why they're needed -->

## 📱 **Alpha Version Considerations**

### Alpha Compatibility
- [ ] Changes are compatible with Alpha release goals
- [ ] API changes are acceptable for Alpha stage
- [ ] Documentation reflects Alpha status
- [ ] Breaking changes are acceptable for Alpha

### Future Compatibility
- [ ] Changes consider future stable API design
- [ ] Migration path planned for stable release
- [ ] Backward compatibility considered where possible

## 🎯 **Reviewer Guidance**

### Focus Areas
<!-- What should reviewers pay special attention to? -->

### Testing Instructions
<!-- How should reviewers test these changes? -->

### Questions for Reviewers
<!-- Any specific questions or concerns for reviewers? -->

## 📋 **Checklist**

### Before Submitting
- [ ] I have read the [Contributing Guidelines](../CONTRIBUTING.md)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### Alpha Release Specific
- [ ] I understand this is for MPLP v1.0 Alpha
- [ ] Changes align with Alpha release goals
- [ ] API changes are documented and justified
- [ ] Breaking changes are acceptable for Alpha stage

### Final Checks
- [ ] Branch is up to date with main/develop
- [ ] Commit messages are clear and descriptive
- [ ] PR title clearly describes the changes
- [ ] All CI checks are expected to pass

## 💬 **Additional Notes**

<!-- Any additional information that would be helpful for reviewers -->

---

**Thank you for contributing to MPLP v1.0 Alpha!** 🎉

Your contribution helps build the future of multi-agent protocol standards.
