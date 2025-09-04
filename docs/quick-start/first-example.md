# Your First MPLP Example

**Multi-Agent Protocol Lifecycle Platform - First Example Tutorial v1.0.0-alpha**

[![Example](https://img.shields.io/badge/example-working-brightgreen.svg)](./README.md)
[![Difficulty](https://img.shields.io/badge/difficulty-beginner-green.svg)](../tutorials/basic-concepts.md)
[![Time](https://img.shields.io/badge/time-10%20minutes-blue.svg)](./installation.md)
[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen.svg)](../../README.md)

---

## 🎯 Tutorial Overview

In this tutorial, you'll build your first multi-agent application using MPLP. You'll learn how to:
- Create and manage agent contexts
- Design and execute workflows
- Handle approvals and monitoring
- Implement basic multi-agent collaboration

**Time Required**: 10 minutes  
**Difficulty**: Beginner  
**Prerequisites**: MPLP installed ([Installation Guide](./installation.md))

---

## 🏗️ Project Setup

### **1. Create Project Directory**
```bash
mkdir my-first-mplp-app
cd my-first-mplp-app
npm init -y
```

### **2. Install Dependencies**
```bash
# Install MPLP modules
npm install @mplp/core @mplp/context @mplp/plan @mplp/role @mplp/confirm @mplp/trace

# Install development dependencies
npm install --save-dev @types/node typescript ts-node
```

### **3. Create TypeScript Configuration**
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🤖 Example 1: Simple Task Agent

### **Create the Agent**
Create `src/simple-agent.ts`:

```typescript
import { MPLPClient, Context, Plan, ExecutionResult } from '@mplp/core';

class SimpleTaskAgent {
  private client: MPLPClient;

  constructor() {
    this.client = new MPLPClient({
      version: '1.0.0-alpha',
      modules: ['context', 'plan', 'trace'],
      config: {
        logLevel: 'info',
        enableMetrics: true
      }
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
    console.log('🚀 Simple Task Agent initialized');
  }

  async createTaskContext(taskName: string, taskData: any): Promise<Context> {
    const context = await this.client.context.createContext({
      contextId: `task-${Date.now()}`,
      contextType: 'simple_task',
      contextData: {
        taskName,
        taskData,
        status: 'created',
        createdAt: new Date().toISOString()
      },
      createdBy: 'simple-task-agent'
    });

    console.log(`📋 Task context created: ${context.contextId}`);
    return context;
  }

  async createTaskPlan(contextId: string, steps: string[]): Promise<Plan> {
    const planSteps = steps.map((step, index) => ({
      stepId: `step-${index + 1}`,
      operation: 'execute_task',
      parameters: {
        action: step,
        stepNumber: index + 1,
        totalSteps: steps.length
      },
      dependencies: index > 0 ? [`step-${index}`] : []
    }));

    const plan = await this.client.plan.createPlan({
      planId: `plan-${Date.now()}`,
      contextId,
      planType: 'sequential',
      planSteps,
      createdBy: 'simple-task-agent'
    });

    console.log(`📝 Task plan created: ${plan.planId} with ${steps.length} steps`);
    return plan;
  }

  async executeTask(planId: string): Promise<ExecutionResult> {
    console.log('⚡ Starting task execution...');
    
    const result = await this.client.plan.executePlan(planId);
    
    console.log(`✅ Task completed: ${result.status}`);
    console.log(`📊 Execution summary:`, result.summary);
    
    return result;
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown();
    console.log('🔌 Simple Task Agent shutdown complete');
  }
}

// Example usage
async function runSimpleTaskExample() {
  const agent = new SimpleTaskAgent();
  
  try {
    // Initialize the agent
    await agent.initialize();

    // Create a task context
    const context = await agent.createTaskContext('Data Processing', {
      inputFile: 'data.csv',
      outputFormat: 'json',
      filters: ['remove_duplicates', 'validate_emails']
    });

    // Create a task plan
    const plan = await agent.createTaskPlan(context.contextId, [
      'Load input data from CSV file',
      'Remove duplicate entries',
      'Validate email addresses',
      'Transform data to JSON format',
      'Save processed data to output file'
    ]);

    // Execute the task
    const result = await agent.executeTask(plan.planId);

    console.log('\n🎉 Simple Task Agent Example Complete!');
    console.log(`📈 Performance: ${result.duration}ms execution time`);

  } catch (error) {
    console.error('❌ Error in simple task example:', error);
  } finally {
    await agent.shutdown();
  }
}

// Run the example
if (require.main === module) {
  runSimpleTaskExample().catch(console.error);
}

export { SimpleTaskAgent };
```

### **Run the Simple Agent**
```bash
npx ts-node src/simple-agent.ts
```

**Expected Output:**
```
🚀 Simple Task Agent initialized
📋 Task context created: task-1725456789123
📝 Task plan created: plan-1725456789124 with 5 steps
⚡ Starting task execution...
✅ Task completed: completed
📊 Execution summary: { steps: 5, duration: '67ms', success: true }

🎉 Simple Task Agent Example Complete!
📈 Performance: 67ms execution time
🔌 Simple Task Agent shutdown complete
```

---

## 👥 Example 2: Multi-Agent Collaboration

### **Create Collaborative Agents**
Create `src/collaborative-agents.ts`:

```typescript
import { MPLPClient, Context, Plan } from '@mplp/core';

class CollaborativeAgentSystem {
  private client: MPLPClient;

  constructor() {
    this.client = new MPLPClient({
      version: '1.0.0-alpha',
      modules: ['context', 'plan', 'role', 'confirm', 'collab', 'trace'],
      config: {
        logLevel: 'info',
        enableCollaboration: true
      }
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
    console.log('🤝 Collaborative Agent System initialized');
  }

  async createAgentTeam(teamName: string, agents: string[]): Promise<{
    teamContext: Context;
    agentContexts: Context[];
  }> {
    // Create team context
    const teamContext = await this.client.context.createContext({
      contextId: `team-${teamName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      contextType: 'agent_team',
      contextData: {
        teamName,
        agents,
        teamSize: agents.length,
        createdAt: new Date().toISOString()
      },
      createdBy: 'collaborative-system'
    });

    // Create individual agent contexts
    const agentContexts: Context[] = [];
    for (const agentName of agents) {
      const agentContext = await this.client.context.createContext({
        contextId: `agent-${agentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        contextType: 'team_member',
        contextData: {
          agentName,
          teamId: teamContext.contextId,
          role: this.getAgentRole(agentName),
          capabilities: this.getAgentCapabilities(agentName)
        },
        createdBy: 'collaborative-system'
      });
      agentContexts.push(agentContext);
    }

    // Set up collaboration
    await this.client.collab.createCollaboration({
      collaborationId: `collab-${teamContext.contextId}`,
      teamContextId: teamContext.contextId,
      participants: agentContexts.map(ctx => ctx.contextId),
      collaborationType: 'hierarchical',
      coordinationMode: 'consensus'
    });

    console.log(`👥 Team "${teamName}" created with ${agents.length} agents`);
    return { teamContext, agentContexts };
  }

  async createTeamProject(
    teamContextId: string, 
    projectName: string, 
    requirements: string[]
  ): Promise<Plan> {
    const projectSteps = requirements.map((requirement, index) => ({
      stepId: `req-${index + 1}`,
      operation: 'fulfill_requirement',
      parameters: {
        requirement,
        requirementId: index + 1,
        totalRequirements: requirements.length,
        needsApproval: index === requirements.length - 1 // Last step needs approval
      },
      dependencies: index > 0 ? [`req-${index}`] : []
    }));

    const plan = await this.client.plan.createPlan({
      planId: `project-${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      contextId: teamContextId,
      planType: 'collaborative',
      planSteps: projectSteps,
      metadata: {
        projectName,
        requiresTeamwork: true,
        approvalRequired: true
      },
      createdBy: 'collaborative-system'
    });

    console.log(`📋 Project "${projectName}" created with ${requirements.length} requirements`);
    return plan;
  }

  async executeCollaborativeProject(planId: string): Promise<void> {
    console.log('🚀 Starting collaborative project execution...');

    // Request approval for the project
    const approval = await this.client.confirm.requestApproval({
      requestId: `approval-${planId}`,
      planId,
      approvalType: 'team_consensus',
      approvers: ['team-lead', 'project-manager'],
      metadata: {
        requiresConsensus: true,
        timeoutMinutes: 30
      }
    });

    console.log(`📋 Approval requested: ${approval.requestId}`);

    // Simulate approval (in real scenario, this would be manual)
    await this.client.confirm.processApproval(approval.requestId, {
      decision: 'approved',
      approvedBy: 'team-lead',
      comments: 'Project approved for execution',
      approvedAt: new Date().toISOString()
    });

    console.log('✅ Project approved, starting execution...');

    // Execute the plan
    const result = await this.client.plan.executePlan(planId);

    // Monitor execution
    const trace = await this.client.trace.getExecutionTrace(result.traceId);

    console.log(`✅ Collaborative project completed: ${result.status}`);
    console.log(`📊 Execution details:`, {
      duration: result.duration,
      stepsCompleted: result.stepsCompleted,
      teamEfficiency: trace.metrics.teamEfficiency
    });
  }

  private getAgentRole(agentName: string): string {
    const roleMap: { [key: string]: string } = {
      'coordinator': 'team_lead',
      'analyst': 'data_analyst',
      'developer': 'software_developer',
      'tester': 'quality_assurance',
      'reviewer': 'code_reviewer'
    };
    return roleMap[agentName.toLowerCase()] || 'team_member';
  }

  private getAgentCapabilities(agentName: string): string[] {
    const capabilityMap: { [key: string]: string[] } = {
      'coordinator': ['project_management', 'team_coordination', 'decision_making'],
      'analyst': ['data_analysis', 'requirements_gathering', 'documentation'],
      'developer': ['coding', 'architecture_design', 'implementation'],
      'tester': ['testing', 'quality_assurance', 'bug_reporting'],
      'reviewer': ['code_review', 'quality_control', 'best_practices']
    };
    return capabilityMap[agentName.toLowerCase()] || ['general_tasks'];
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown();
    console.log('🔌 Collaborative Agent System shutdown complete');
  }
}

// Example usage
async function runCollaborativeExample() {
  const system = new CollaborativeAgentSystem();
  
  try {
    await system.initialize();

    // Create a development team
    const team = await system.createAgentTeam('Development Team Alpha', [
      'Coordinator',
      'Analyst', 
      'Developer',
      'Tester',
      'Reviewer'
    ]);

    // Create a project for the team
    const project = await system.createTeamProject(
      team.teamContext.contextId,
      'E-commerce Platform',
      [
        'Gather and analyze requirements',
        'Design system architecture',
        'Implement core functionality',
        'Develop user interface',
        'Perform comprehensive testing',
        'Conduct code review and optimization',
        'Deploy to production environment'
      ]
    );

    // Execute the collaborative project
    await system.executeCollaborativeProject(project.planId);

    console.log('\n🎉 Collaborative Agent Example Complete!');

  } catch (error) {
    console.error('❌ Error in collaborative example:', error);
  } finally {
    await system.shutdown();
  }
}

// Run the example
if (require.main === module) {
  runCollaborativeExample().catch(console.error);
}

export { CollaborativeAgentSystem };
```

### **Run the Collaborative Example**
```bash
npx ts-node src/collaborative-agents.ts
```

---

## 📊 Example 3: Monitoring and Analytics

### **Create Monitoring Agent**
Create `src/monitoring-agent.ts`:

```typescript
import { MPLPClient, ExecutionTrace, PerformanceMetrics } from '@mplp/core';

class MonitoringAgent {
  private client: MPLPClient;

  constructor() {
    this.client = new MPLPClient({
      version: '1.0.0-alpha',
      modules: ['context', 'plan', 'trace', 'core'],
      config: {
        logLevel: 'info',
        enableMetrics: true,
        enableTracing: true
      }
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
    console.log('📊 Monitoring Agent initialized');
  }

  async monitorSystemHealth(): Promise<void> {
    console.log('🔍 Checking system health...');

    const health = await this.client.core.getSystemHealth();
    console.log('💚 System Health:', {
      status: health.status,
      uptime: health.uptime,
      modules: Object.keys(health.modules).length,
      activeContexts: health.metrics.activeContexts,
      runningPlans: health.metrics.runningPlans
    });
  }

  async analyzePerformance(): Promise<PerformanceMetrics> {
    console.log('📈 Analyzing system performance...');

    const metrics = await this.client.trace.getPerformanceMetrics({
      timeRange: '1h',
      includeBreakdown: true
    });

    console.log('⚡ Performance Metrics:', {
      averageResponseTime: `${metrics.averageResponseTime}ms`,
      throughput: `${metrics.throughput} req/sec`,
      successRate: `${metrics.successRate}%`,
      errorRate: `${metrics.errorRate}%`
    });

    return metrics;
  }

  async generateReport(): Promise<void> {
    console.log('📋 Generating system report...');

    const report = await this.client.trace.generateSystemReport({
      includePerformance: true,
      includeErrors: true,
      includeUsage: true,
      timeRange: '24h'
    });

    console.log('📊 System Report Summary:', {
      totalRequests: report.totalRequests,
      successfulRequests: report.successfulRequests,
      averageResponseTime: `${report.averageResponseTime}ms`,
      topErrors: report.topErrors.slice(0, 3),
      resourceUsage: report.resourceUsage
    });
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown();
    console.log('🔌 Monitoring Agent shutdown complete');
  }
}

// Example usage
async function runMonitoringExample() {
  const monitor = new MonitoringAgent();
  
  try {
    await monitor.initialize();
    
    await monitor.monitorSystemHealth();
    await monitor.analyzePerformance();
    await monitor.generateReport();

    console.log('\n🎉 Monitoring Example Complete!');

  } catch (error) {
    console.error('❌ Error in monitoring example:', error);
  } finally {
    await monitor.shutdown();
  }
}

// Run the example
if (require.main === module) {
  runMonitoringExample().catch(console.error);
}

export { MonitoringAgent };
```

---

## 🎯 Key Concepts Learned

### **1. MPLP Client Initialization**
- Configure modules and settings
- Initialize client before use
- Proper shutdown for cleanup

### **2. Context Management**
- Create contexts for agent state
- Use meaningful context types
- Store relevant data and metadata

### **3. Plan Creation and Execution**
- Design sequential or parallel workflows
- Define clear step dependencies
- Monitor execution results

### **4. Multi-Agent Collaboration**
- Set up agent teams and roles
- Implement approval workflows
- Coordinate collaborative tasks

### **5. Monitoring and Analytics**
- Track system health and performance
- Generate comprehensive reports
- Analyze execution traces

---

## 🚀 Next Steps

### **Explore Advanced Features**
- 🔐 [Security and Authentication](../implementation/security-requirements.md)
- 🌐 [Network and Distribution](../architecture/distributed-architecture.md)
- 🔌 [Extensions and Plugins](../implementation/extension-development.md)
- 📊 [Advanced Analytics](../implementation/analytics-integration.md)

### **Build Real Applications**
- 🏪 [E-commerce Agent System](../examples/advanced-patterns/ecommerce-agents.md)
- 🏭 [Manufacturing Workflow](../examples/integration/manufacturing-integration.md)
- 🏥 [Healthcare Coordination](../examples/advanced-patterns/healthcare-coordination.md)
- 💰 [Financial Processing](../examples/integration/financial-processing.md)

### **Join the Community**
- 💬 [GitHub Discussions](https://github.com/mplp-org/mplp/discussions)
- 🐛 [Report Issues](https://github.com/mplp-org/mplp/issues)
- 📧 [Mailing List](mailto:community@mplp.dev)
- 💡 [Discord Server](https://discord.gg/mplp)

---

**First Example Tutorial Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025

**🎉 Congratulations! You've built your first MPLP applications. You're now ready to create sophisticated multi-agent systems!**
