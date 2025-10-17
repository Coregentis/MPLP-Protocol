# MPLP Troubleshooting Guide
## Common Issues and Solutions

**Version**: 1.1.0-beta  
**Last Updated**: October 16, 2025

---

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build Issues](#build-issues)
3. [Import/Module Issues](#importmodule-issues)
4. [Runtime Issues](#runtime-issues)
5. [TypeScript Issues](#typescript-issues)
6. [Performance Issues](#performance-issues)
7. [Getting Help](#getting-help)

---

## 🔧 Installation Issues

### Issue 1: npm install fails

**Symptoms**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions**:

1. **Clear npm cache**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use legacy peer deps** (if needed):
```bash
npm install --legacy-peer-deps
```

3. **Check Node.js version**:
```bash
node --version  # Must be >= 18.0.0
```

### Issue 2: Permission denied errors

**Symptoms**:
```
EACCES: permission denied
```

**Solutions**:

1. **Don't use sudo** (not recommended):
```bash
# Instead, fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

2. **Use nvm** (recommended):
```bash
# Install nvm first, then:
nvm install 18
nvm use 18
```

---

## 🏗️ Build Issues

### Issue 1: TypeScript compilation fails

**Symptoms**:
```
error TS2307: Cannot find module 'X' or its corresponding type declarations
```

**Solutions**:

1. **Clean and rebuild**:
```bash
npm run clean
npm install
npm run build
```

2. **Check tsconfig.json exists**:
```bash
ls -la tsconfig*.json
# Should see: tsconfig.json, tsconfig.build.json, tsconfig.base.json
```

3. **Verify TypeScript version**:
```bash
npx tsc --version  # Should be >= 5.0.0
```

### Issue 2: Build succeeds but dist/ is empty

**Symptoms**:
```
npm run build  # No errors
ls dist/       # Directory is empty or missing files
```

**Solutions**:

1. **Check tsconfig.build.json**:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

2. **Manually run TypeScript**:
```bash
npx tsc --project tsconfig.build.json --listFiles
# This will show which files are being compiled
```

### Issue 3: Build is very slow

**Symptoms**:
- Build takes > 5 minutes
- High CPU usage during build

**Solutions**:

1. **Use incremental compilation**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true
  }
}
```

2. **Exclude unnecessary files**:
```json
// tsconfig.build.json
{
  "exclude": [
    "node_modules",
    "tests",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

---

## 📦 Import/Module Issues

### Issue 1: Cannot find module 'mplp'

**Symptoms**:
```javascript
const mplp = require('mplp');
// Error: Cannot find module 'mplp'
```

**Solutions**:

1. **Link the package locally**:
```bash
# In MPLP directory
npm link

# In your project
npm link mplp
```

2. **Use relative path** (for testing):
```javascript
const mplp = require('../path/to/MPLP-Protocol/dist/index.js');
```

3. **Check dist/ exists**:
```bash
ls -la dist/index.js  # Should exist after build
```

### Issue 2: Cannot find module 'mplp/context'

**Symptoms**:
```javascript
const { ContextManager } = require('mplp/context');
// Error: Cannot find module 'mplp/context'
```

**Solutions**:

1. **Verify package.json exports**:
```json
{
  "exports": {
    "./context": {
      "import": "./dist/modules/context/index.js",
      "require": "./dist/modules/context/index.js"
    }
  }
}
```

2. **Check module exists**:
```bash
ls -la dist/modules/context/index.js
```

3. **Use direct path** (workaround):
```javascript
const context = require('mplp/dist/modules/context/index.js');
```

### Issue 3: Type definitions not found

**Symptoms**:
```typescript
import { ContextManager } from 'mplp/context';
// Error: Could not find a declaration file for module 'mplp/context'
```

**Solutions**:

1. **Check .d.ts files exist**:
```bash
ls -la dist/modules/context/index.d.ts
```

2. **Add types to package.json exports**:
```json
{
  "exports": {
    "./context": {
      "types": "./dist/modules/context/index.d.ts",
      "import": "./dist/modules/context/index.js"
    }
  }
}
```

---

## 🚀 Runtime Issues

### Issue 1: Module initialization fails

**Symptoms**:
```
Error: Module not initialized
```

**Solutions**:

1. **Check initialization order**:
```javascript
// Correct order
const { initializeContextModule } = require('mplp/context');

async function main() {
  const module = await initializeContextModule();
  // Now use the module
}
```

2. **Enable logging**:
```javascript
const module = await initializeContextModule({
  enableLogging: true  // See what's happening
});
```

### Issue 2: Memory leaks

**Symptoms**:
- Application memory usage keeps growing
- Eventually crashes with "Out of memory"

**Solutions**:

1. **Monitor memory**:
```javascript
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory:', Math.round(used.heapUsed / 1024 / 1024), 'MB');
}, 5000);
```

2. **Clean up resources**:
```javascript
// Always clean up when done
await module.shutdown();
```

3. **Limit cache size**:
```javascript
const module = await initializeContextModule({
  maxCacheSize: 1000,  // Limit cache entries
  cacheTimeout: 300000  // 5 minutes
});
```

---

## 📘 TypeScript Issues

### Issue 1: Type errors in strict mode

**Symptoms**:
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions**:

1. **Use proper types**:
```typescript
import type { UUID, ContextData } from 'mplp/types';

const contextId: UUID = 'context-123';
const data: ContextData = { /* ... */ };
```

2. **Enable strict null checks**:
```typescript
// Handle null/undefined properly
const value: string | undefined = getValue();
if (value !== undefined) {
  // Use value safely
}
```

### Issue 2: Cannot find type definitions

**Symptoms**:
```
error TS7016: Could not find a declaration file for module 'mplp'
```

**Solutions**:

1. **Check types field in package.json**:
```json
{
  "types": "./dist/index.d.ts"
}
```

2. **Add to tsconfig.json**:
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  }
}
```

---

## ⚡ Performance Issues

### Issue 1: Slow module loading

**Symptoms**:
- First import takes > 5 seconds
- Subsequent imports are fast

**Solutions**:

1. **Use lazy loading**:
```javascript
// Instead of loading all modules at once
const loadContext = () => require('mplp/context');
const loadPlan = () => require('mplp/plan');

// Load only when needed
const context = loadContext();
```

2. **Enable caching**:
```javascript
const module = await initializeContextModule({
  enableCaching: true
});
```

### Issue 2: High CPU usage

**Symptoms**:
- CPU usage > 80% during normal operation
- Application becomes unresponsive

**Solutions**:

1. **Enable performance monitoring**:
```javascript
const module = await initializeContextModule({
  enableMetrics: true
});

// Check metrics
const metrics = await module.getPerformanceMetrics();
console.log('Metrics:', metrics);
```

2. **Reduce logging**:
```javascript
const module = await initializeContextModule({
  enableLogging: false  // Disable in production
});
```

---

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing issues**: [GitHub Issues](https://github.com/Coregentis/MPLP-Protocol/issues)
3. **Read the documentation**: [Docs](./docs/en/README.md)
4. **Try the examples**: `examples/` directory

### How to Report an Issue

When reporting an issue, please include:

1. **Environment Information**:
```bash
node --version
npm --version
cat package.json | grep "mplp"
```

2. **Steps to Reproduce**:
```
1. Clone the repository
2. Run npm install
3. Run npm run build
4. Error occurs: [describe error]
```

3. **Error Messages**:
```
[Paste complete error message here]
```

4. **Expected vs Actual Behavior**:
- Expected: [What you expected to happen]
- Actual: [What actually happened]

### Where to Get Help

- **GitHub Issues**: [Report bugs](https://github.com/Coregentis/MPLP-Protocol/issues/new)
- **GitHub Discussions**: [Ask questions](https://github.com/Coregentis/MPLP-Protocol/discussions)
- **Documentation**: [Read docs](./docs/en/README.md)
- **Email**: support@coregentis.com

---

## 🔍 Diagnostic Commands

### Check Installation

```bash
# Verify Node.js and npm
node --version
npm --version

# Check MPLP installation
npm list mplp

# Verify build output
ls -la dist/
```

### Check Module Structure

```bash
# List all modules
ls -la dist/modules/

# Check specific module
ls -la dist/modules/context/

# Verify types
ls -la dist/**/*.d.ts
```

### Test Imports

```bash
# Test main package
node -e "const mplp = require('mplp'); console.log(mplp.MPLP_VERSION);"

# Test module import
node -e "const ctx = require('mplp/dist/modules/context/index.js'); console.log('OK');"
```

---

## 📚 Additional Resources

- [Quick Start Guide](./QUICK_START.md)
- [API Documentation](./docs/en/api/README.md)
- [Architecture Guide](./docs/en/architecture/README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

**Still having issues?** Don't hesitate to [open an issue](https://github.com/Coregentis/MPLP-Protocol/issues/new) or [start a discussion](https://github.com/Coregentis/MPLP-Protocol/discussions/new)!

