# MPLP Quick Start Guide
## Get Your First Multi-Agent Application Running

**Version**: 1.1.0-beta  
**Last Updated**: October 16, 2025  
**Difficulty**: Beginner  
**Time**: 15-30 minutes

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 8.0.0 (comes with Node.js)
- **TypeScript**: >= 5.0.0 (optional, for TypeScript projects)
- **Git**: For cloning the repository

Verify your installation:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 8.0.0
```

---

## 🚀 Installation

### Option 1: Install via npm (Recommended) ⚡

MPLP is now available on npm! This is the fastest way to get started:

```bash
# Install the latest beta version
npm install mplp@beta

# Or install a specific version
npm install mplp@1.1.0-beta
```

**Verify Installation**:
```bash
# Check MPLP version
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0-beta
```

### Option 2: Install from Source

For development or contributing to MPLP:

```bash
# 1. Clone the repository
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Verify the build
ls -la dist/
# You should see: index.js, index.d.ts, modules/, shared/, etc.
```

### Option 3: Link Locally for Development

If you want to use MPLP in another project:

```bash
# In the MPLP directory
npm link

# In your project directory
npm link mplp
```

---

## 🎯 Your First MPLP Application

### Step 1: Create a New Project

```bash
mkdir my-mplp-app
cd my-mplp-app
npm init -y
```

### Step 2: Link MPLP (if using local build)

```bash
npm link mplp
```

### Step 3: Create Your First Agent Workflow

Create a file `index.js`:

```javascript
// Import MPLP modules
const { MPLP_VERSION, MPLP_INFO } = require('mplp');

console.log('=== MPLP Quick Start ===');
console.log(`Version: ${MPLP_VERSION}`);
console.log(`Modules: ${MPLP_INFO.modules.join(', ')}`);
console.log(`Capabilities: ${MPLP_INFO.capabilities.join(', ')}`);
```

### Step 4: Run Your Application

```bash
node index.js
```

**Expected Output**:
```
=== MPLP Quick Start ===
Version: 1.1.0-beta
Modules: context, plan, role, confirm, trace, extension, dialog, collab, core, network
Capabilities: multi_agent_coordination, workflow_orchestration, lifecycle_management, ...
```

---

## 📚 Using MPLP Modules

### Example 1: Context Management

```javascript
const { ContextManager } = require('mplp/context');

async function contextExample() {
  // Note: This is a conceptual example
  // Actual implementation may require additional setup
  
  console.log('Context module loaded successfully!');
  console.log('ContextManager:', typeof ContextManager);
}

contextExample();
```

### Example 2: Plan Management

```javascript
const { PlanManager } = require('mplp/plan');

async function planExample() {
  console.log('Plan module loaded successfully!');
  console.log('PlanManager:', typeof PlanManager);
}

planExample();
```

### Example 3: Core Orchestration

```javascript
const { CoreOrchestrator } = require('mplp/core');

async function coreExample() {
  console.log('Core module loaded successfully!');
  console.log('CoreOrchestrator:', typeof CoreOrchestrator);
}

coreExample();
```

---

## 🔧 TypeScript Support

MPLP is built with TypeScript and includes full type definitions.

### TypeScript Example

Create `index.ts`:

```typescript
import { MPLP_VERSION, MPLP_INFO } from 'mplp';
import type { UUID } from 'mplp/types';

// Type-safe usage
const contextId: UUID = 'context-123';

console.log(`MPLP Version: ${MPLP_VERSION}`);
console.log(`Context ID: ${contextId}`);
```

Compile and run:

```bash
npx tsc index.ts
node index.js
```

---

## 📖 Module Overview

MPLP provides 10 enterprise-grade coordination modules:

| Module | Purpose | Import Path |
|--------|---------|-------------|
| **Context** | Context and state management | `mplp/context` |
| **Plan** | Task planning and orchestration | `mplp/plan` |
| **Role** | Role-based access control | `mplp/role` |
| **Confirm** | Approval workflows | `mplp/confirm` |
| **Trace** | Monitoring and event tracking | `mplp/trace` |
| **Extension** | Plugin and extension management | `mplp/extension` |
| **Dialog** | Dialog-driven development | `mplp/dialog` |
| **Collab** | Multi-agent collaboration | `mplp/collab` |
| **Core** | Runtime orchestration | `mplp/core` |
| **Network** | Agent network topology | `mplp/network` |

---

## 🎓 Next Steps

### 1. Explore Examples

Check out the `examples/` directory for complete applications:

```bash
cd examples/agent-orchestrator
npm install
npm start
```

### 2. Read the Documentation

- [Architecture Guide](./docs/en/architecture/README.md)
- [API Reference](./docs/en/api/README.md)
- [Module Guides](./docs/en/modules/README.md)

### 3. Join the Community

- **GitHub**: [Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)
- **Issues**: [Report bugs or request features](https://github.com/Coregentis/MPLP-Protocol/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/Coregentis/MPLP-Protocol/discussions)

---

## ❓ Troubleshooting

### Build Fails

**Problem**: `npm run build` fails with TypeScript errors

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Module Not Found

**Problem**: `Cannot find module 'mplp'`

**Solution**:
```bash
# Make sure you've linked the package
cd /path/to/MPLP-Protocol
npm link

cd /path/to/your-project
npm link mplp
```

### Import Errors

**Problem**: `Cannot find module 'mplp/context'`

**Solution**: Make sure you've built the project first:
```bash
npm run build
```

---

## 📝 Common Patterns

### Pattern 1: Module Initialization

```javascript
const { initializeContextModule } = require('mplp/context');

async function init() {
  const contextModule = await initializeContextModule({
    enableLogging: true,
    enableCaching: true
  });
  
  console.log('Context module initialized!');
}

init();
```

### Pattern 2: Error Handling

```javascript
const { ContextManager } = require('mplp/context');

async function safeOperation() {
  try {
    // Your MPLP operations here
    console.log('Operation successful!');
  } catch (error) {
    console.error('MPLP Error:', error.message);
  }
}

safeOperation();
```

---

## 🎉 Success!

You've successfully set up MPLP and created your first application!

**What you've learned**:
- ✅ How to install and build MPLP from source
- ✅ How to import and use MPLP modules
- ✅ How to create a basic MPLP application
- ✅ Where to find documentation and examples

**Next recommended steps**:
1. Explore the example applications in `examples/`
2. Read the architecture documentation
3. Try building a simple multi-agent workflow
4. Join the community and ask questions

---

**Need Help?**
- 📖 [Full Documentation](./docs/en/README.md)
- 🐛 [Report Issues](https://github.com/Coregentis/MPLP-Protocol/issues)
- 💬 [Community Discussions](https://github.com/Coregentis/MPLP-Protocol/discussions)
- 📧 [Contact Us](mailto:support@coregentis.com)

**Happy Building with MPLP!** 🚀

