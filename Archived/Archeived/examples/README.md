# MPLP v1.0 Examples

Welcome to the MPLP v1.0 examples collection! This directory contains practical examples, tutorials, and use cases to help you get started with MPLP and explore its capabilities.

## 📁 Example Categories

### 🚀 [Basic Examples](./basic/)
Simple, focused examples that demonstrate core MPLP concepts:
- [Hello World Workflow](./basic/hello-world.md) - Your first MPLP workflow
- [Context Management](./basic/context-management.md) - Creating and managing contexts
- [Simple Planning](./basic/simple-planning.md) - Basic plan creation and execution
- [Approval Workflow](./basic/approval-workflow.md) - Simple approval processes
- [Event Monitoring](./basic/event-monitoring.md) - Basic tracing and monitoring

### 🔧 [Advanced Examples](./advanced/)
Complex scenarios showcasing advanced MPLP features:
- [Multi-Agent Collaboration](./advanced/multi-agent-collaboration.md) - Complex agent coordination
- [Custom Workflow Templates](./advanced/custom-workflows.md) - Creating custom workflow patterns
- [Extension Development](./advanced/extension-development.md) - Building custom extensions
- [Performance Optimization](./advanced/performance-optimization.md) - Optimizing workflow performance
- [Error Handling Strategies](./advanced/error-handling.md) - Robust error handling patterns

### 🔗 [Integration Examples](./integration/)
Real-world integration scenarios:
- [CI/CD Pipeline Integration](./integration/cicd-integration.md) - Integrating with CI/CD systems
- [Database Integration](./integration/database-integration.md) - Working with databases
- [External API Integration](./integration/api-integration.md) - Integrating external services
- [Microservices Architecture](./integration/microservices.md) - MPLP in microservices
- [Cloud Deployment](./integration/cloud-deployment.md) - Deploying to cloud platforms

## 🎯 Quick Start Examples

### 1. Hello World Workflow

The simplest possible MPLP workflow:

```typescript
import { initializeCoreModule } from 'mplp';

async function helloWorld() {
  // Initialize MPLP
  const core = await initializeCoreModule(moduleServices);
  
  // Execute a simple workflow
  const result = await core.orchestrator.executeWorkflow('hello-world-context', {
    stages: ['context', 'trace'],
    parallel_execution: false,
    timeout_ms: 30000
  });
  
  console.log('Hello World workflow completed:', result.status);
}

helloWorld();
```

### 2. Basic Project Workflow

A complete project workflow example:

```typescript
async function projectWorkflow() {
  const core = await initializeCoreModule(moduleServices);
  
  // Create context
  const contextResult = await core.moduleServices.contextService.createContext({
    name: 'Website Redesign Project',
    description: 'Complete website redesign for Q1',
    metadata: { priority: 'high', budget: 50000 }
  });
  
  // Create plan
  const planResult = await core.moduleServices.planService.createPlan({
    context_id: contextResult.data.context_id,
    name: 'Redesign Implementation Plan',
    tasks: [
      { name: 'Design Mockups', priority: 'high', estimated_duration: 7200000 },
      { name: 'Frontend Development', priority: 'medium', estimated_duration: 14400000 },
      { name: 'Testing & QA', priority: 'high', estimated_duration: 3600000 }
    ]
  });
  
  // Request approval
  const confirmResult = await core.moduleServices.confirmService.createConfirmation({
    context_id: contextResult.data.context_id,
    plan_id: planResult.data.plan_id,
    type: 'plan_approval',
    title: 'Project Plan Approval',
    required_approvers: ['project-manager', 'tech-lead'],
    approval_threshold: 2
  });
  
  // Execute full workflow
  const workflowResult = await core.orchestrator.executeWorkflow(
    contextResult.data.context_id,
    { stages: ['context', 'plan', 'confirm', 'trace'] }
  );
  
  console.log('Project workflow completed:', workflowResult.status);
}
```

## 📚 Learning Path

### For Beginners
1. Start with [Hello World Workflow](./basic/hello-world.md)
2. Learn [Context Management](./basic/context-management.md)
3. Try [Simple Planning](./basic/simple-planning.md)
4. Explore [Event Monitoring](./basic/event-monitoring.md)

### For Intermediate Users
1. Study [Multi-Agent Collaboration](./advanced/multi-agent-collaboration.md)
2. Create [Custom Workflow Templates](./advanced/custom-workflows.md)
3. Implement [Error Handling Strategies](./advanced/error-handling.md)
4. Try [Performance Optimization](./advanced/performance-optimization.md)

### For Advanced Users
1. Build [Custom Extensions](./advanced/extension-development.md)
2. Integrate with [External APIs](./integration/api-integration.md)
3. Deploy to [Cloud Platforms](./integration/cloud-deployment.md)
4. Implement [Microservices Architecture](./integration/microservices.md)

## 🛠️ Running Examples

### Prerequisites
- Node.js 18+
- MPLP v1.0 installed
- Basic understanding of TypeScript/JavaScript

### Setup
```bash
# Clone the repository
git clone https://github.com/your-org/mplp.git
cd MPLP-Protocol/docs/examples

# Install dependencies
npm install

# Run a basic example
npm run example:hello-world

# Run an advanced example
npm run example:multi-agent

# Run integration tests
npm run test:integration
```

### Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
MPLP_LOG_LEVEL=info
MPLP_DB_HOST=localhost
MPLP_DB_PORT=5432
# ... other configuration
```

## 📖 Example Structure

Each example follows a consistent structure:

```
example-name/
├── README.md           # Example documentation
├── src/               # Source code
│   ├── index.ts       # Main example file
│   ├── config.ts      # Configuration
│   └── utils.ts       # Utility functions
├── tests/             # Test files
│   └── example.test.ts
├── package.json       # Dependencies
└── .env.example       # Environment template
```

## 🤝 Contributing Examples

We welcome contributions of new examples! Please follow these guidelines:

### Example Guidelines
1. **Clear Purpose**: Each example should demonstrate a specific concept or use case
2. **Complete Code**: Provide working, runnable code
3. **Documentation**: Include comprehensive README with explanation
4. **Tests**: Add tests to verify the example works
5. **Comments**: Add inline comments explaining key concepts

### Submission Process
1. Fork the repository
2. Create a new branch for your example
3. Add your example following the structure above
4. Test your example thoroughly
5. Submit a pull request with description

### Example Template
```typescript
/**
 * Example: [Example Name]
 * Description: [Brief description of what this example demonstrates]
 * Difficulty: [Beginner/Intermediate/Advanced]
 * Topics: [List of topics covered]
 */

import { initializeCoreModule } from 'mplp';

async function exampleFunction() {
  // Your example code here
  console.log('Example completed successfully!');
}

// Run the example
if (require.main === module) {
  exampleFunction().catch(console.error);
}

export { exampleFunction };
```

## 🔍 Troubleshooting

### Common Issues
- **Module not found**: Ensure MPLP is properly installed
- **Connection errors**: Check database and Redis configuration
- **Permission errors**: Verify user roles and permissions
- **Timeout errors**: Increase timeout values for complex workflows

### Getting Help
- Check the [Troubleshooting Guide](../guides/troubleshooting.md)
- Review [API Documentation](../api/)
- Ask questions in [GitHub Discussions](https://github.com/your-org/mplp/discussions)
- Report bugs in [GitHub Issues](https://github.com/your-org/mplp/issues)

## 📄 License

All examples are provided under the same MIT license as MPLP v1.0.

---

Happy coding with MPLP v1.0! 🚀
