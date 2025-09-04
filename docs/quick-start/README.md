# MPLP Quick Start Guide

**Multi-Agent Protocol Lifecycle Platform - 5-Minute Quick Start v1.0.0-alpha**

[![Quick Start](https://img.shields.io/badge/quick%20start-5%20minutes-brightgreen.svg)](./installation.md)
[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen.svg)](../../README.md)
[![Tests](https://img.shields.io/badge/tests-2869%2F2869%20pass-brightgreen.svg)](../en/testing/)
[![Examples](https://img.shields.io/badge/examples-working-blue.svg)](./first-example.md)

---

## 🚀 Welcome to MPLP!

Get up and running with the Multi-Agent Protocol Lifecycle Platform in just 5 minutes. MPLP is a production-ready L1-L3 protocol stack for building intelligent multi-agent systems.

### **What You'll Learn**
- Install and set up MPLP
- Create your first multi-agent context
- Execute a simple plan workflow
- Understand the core concepts

### **Prerequisites**
- Node.js 18+ and npm 8+
- 5 minutes of your time
- Basic JavaScript/TypeScript knowledge

---

## ⚡ 1-Minute Installation

### **Option 1: NPM (Recommended)**
```bash
# Install MPLP globally
npm install -g @mplp/core

# Or install in your project
npm install @mplp/core @mplp/context @mplp/plan
```

### **Option 2: Docker**
```bash
# Pull the official MPLP image
docker pull mplp/mplp:1.0.0-alpha

# Run MPLP container
docker run -p 8080:8080 mplp/mplp:1.0.0-alpha
```

### **Option 3: From Source**
```bash
# Clone the repository
git clone https://github.com/mplp-org/mplp.git
cd mplp

# Install dependencies and build
npm install
npm run build

# Run tests to verify installation
npm test
```

---

## 🎯 2-Minute First Example

### **Create Your First MPLP Application**

Create a new file `my-first-agent.js`:

```javascript
const { MPLPClient, ContextService, PlanService } = require('@mplp/core');

async function createFirstAgent() {
  // Initialize MPLP client
  const client = new MPLPClient({
    version: '1.0.0-alpha',
    modules: ['context', 'plan', 'core']
  });

  await client.initialize();
  console.log('✅ MPLP Client initialized successfully!');

  // Create a context for our agent
  const context = await client.context.createContext({
    contextId: 'my-first-agent-001',
    contextType: 'learning_example',
    contextData: {
      goal: 'Learn MPLP basics',
      user: 'new-developer',
      timestamp: new Date().toISOString()
    },
    createdBy: 'quick-start-guide'
  });

  console.log('✅ Context created:', context.contextId);

  // Create a simple plan
  const plan = await client.plan.createPlan({
    planId: 'learning-plan-001',
    contextId: context.contextId,
    planType: 'sequential',
    planSteps: [
      {
        stepId: 'step-1',
        operation: 'greet_user',
        parameters: { message: 'Welcome to MPLP!' },
        dependencies: []
      },
      {
        stepId: 'step-2',
        operation: 'show_capabilities',
        parameters: { modules: ['context', 'plan', 'role', 'confirm'] },
        dependencies: ['step-1']
      },
      {
        stepId: 'step-3',
        operation: 'next_steps',
        parameters: { guide: 'advanced-tutorial' },
        dependencies: ['step-2']
      }
    ],
    createdBy: 'quick-start-guide'
  });

  console.log('✅ Plan created:', plan.planId);

  // Execute the plan
  const execution = await client.plan.executePlan(plan.planId);
  console.log('✅ Plan executed successfully!');
  console.log('📊 Execution results:', execution.summary);

  // Clean up
  await client.shutdown();
  console.log('✅ MPLP Client shutdown complete');
}

// Run the example
createFirstAgent().catch(console.error);
```

### **Run Your First Example**
```bash
node my-first-agent.js
```

**Expected Output:**
```
✅ MPLP Client initialized successfully!
✅ Context created: my-first-agent-001
✅ Plan created: learning-plan-001
✅ Plan executed successfully!
📊 Execution results: { status: 'completed', steps: 3, duration: '45ms' }
✅ MPLP Client shutdown complete
```

---

## 🧠 Understanding Core Concepts

### **L1-L3 Protocol Architecture**
```
MPLP Architecture:
├── L3 Execution Layer (CoreOrchestrator)
│   └── Central coordination and workflow management
├── L2 Coordination Layer (10 Modules)
│   ├── Context: Agent state and data management
│   ├── Plan: Workflow planning and execution
│   ├── Role: Permission and capability management
│   ├── Confirm: Approval and validation workflows
│   ├── Trace: Monitoring and observability
│   ├── Extension: Plugin and extension management
│   ├── Dialog: Conversation and interaction management
│   ├── Collab: Multi-agent collaboration
│   ├── Core: System utilities and services
│   └── Network: Distributed communication
└── L1 Protocol Layer (Cross-cutting Concerns)
    └── Logging, monitoring, security, validation, etc.
```

### **Key Components**

#### **Context Service**
Manages agent state, data, and lifecycle:
```javascript
const context = await client.context.createContext({
  contextId: 'unique-context-id',
  contextType: 'agent_session',
  contextData: { /* your data */ },
  createdBy: 'your-application'
});
```

#### **Plan Service**
Handles workflow planning and execution:
```javascript
const plan = await client.plan.createPlan({
  planId: 'unique-plan-id',
  contextId: context.contextId,
  planType: 'sequential', // or 'parallel'
  planSteps: [/* your steps */]
});
```

#### **Role Service**
Manages permissions and capabilities:
```javascript
const role = await client.role.assignRole({
  userId: 'user-001',
  roleId: 'agent-operator',
  contextId: context.contextId
});
```

---

## 🎨 Common Patterns

### **Pattern 1: Simple Agent Workflow**
```javascript
// 1. Create context
const context = await client.context.createContext({...});

// 2. Create and execute plan
const plan = await client.plan.createPlan({...});
const result = await client.plan.executePlan(plan.planId);

// 3. Monitor execution
const trace = await client.trace.getExecutionTrace(result.traceId);
```

### **Pattern 2: Multi-Agent Collaboration**
```javascript
// Create multiple contexts for different agents
const agentA = await client.context.createContext({
  contextId: 'agent-a-001',
  contextType: 'coordinator'
});

const agentB = await client.context.createContext({
  contextId: 'agent-b-001',
  contextType: 'worker'
});

// Set up collaboration
const collaboration = await client.collab.createCollaboration({
  collaborationId: 'team-work-001',
  participants: [agentA.contextId, agentB.contextId],
  collaborationType: 'hierarchical'
});
```

### **Pattern 3: Approval Workflow**
```javascript
// Create plan that requires approval
const plan = await client.plan.createPlan({...});

// Request approval
const approval = await client.confirm.requestApproval({
  requestId: 'approval-001',
  planId: plan.planId,
  approvalType: 'manual',
  approvers: ['manager-001']
});

// Execute after approval
if (approval.status === 'approved') {
  await client.plan.executePlan(plan.planId);
}
```

---

## 📚 Next Steps

### **Learn More**
- 📖 [Complete Tutorial](../tutorials/basic-concepts.md) - Deep dive into MPLP concepts
- 🏗️ [Architecture Guide](../architecture/l1-l3-layers.md) - Understanding the protocol layers
- 🔧 [Implementation Guide](../implementation/deployment-guide.md) - Production deployment
- 🧪 [Testing Guide](../testing/README.md) - Testing your MPLP applications

### **Examples & Templates**
- 🎯 [Basic Examples](../examples/basic-usage/) - Simple use cases
- 🚀 [Advanced Patterns](../examples/advanced-patterns/) - Complex scenarios
- 🔗 [Integration Examples](../examples/integration/) - Third-party integrations
- 📦 [Project Templates](../templates/) - Starter projects

### **Community & Support**
- 💬 [GitHub Discussions](https://github.com/mplp-org/mplp/discussions) - Community Q&A
- 🐛 [Issue Tracker](https://github.com/mplp-org/mplp/issues) - Bug reports and features
- 📧 [Mailing List](mailto:community@mplp.dev) - Announcements and updates
- 💡 [Discord Server](https://discord.gg/mplp) - Real-time community chat

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Installation Problems**
```bash
# Clear npm cache
npm cache clean --force

# Use specific Node.js version
nvm use 18

# Install with legacy peer deps
npm install --legacy-peer-deps
```

#### **Connection Issues**
```javascript
// Check MPLP service status
const status = await client.getHealthStatus();
console.log('Service status:', status);

// Enable debug logging
const client = new MPLPClient({
  debug: true,
  logLevel: 'debug'
});
```

#### **Permission Errors**
```javascript
// Verify role assignments
const roles = await client.role.getUserRoles('your-user-id');
console.log('User roles:', roles);

// Check context permissions
const permissions = await client.role.getContextPermissions(contextId);
console.log('Context permissions:', permissions);
```

### **Getting Help**
- 📖 Check the [FAQ](../faq/README.md) for common questions
- 🔍 Search [existing issues](https://github.com/mplp-org/mplp/issues)
- 💬 Ask in [GitHub Discussions](https://github.com/mplp-org/mplp/discussions)
- 📧 Email support: [help@mplp.dev](mailto:help@mplp.dev)

---

**Quick Start Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025

**🎉 Congratulations! You've successfully created your first MPLP application. Welcome to the future of multi-agent systems!**
