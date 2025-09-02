# Multi-Agent Collaboration Example

## 📋 Overview

This advanced example demonstrates how multiple AI agents can collaborate using MPLP v1.0 to complete a complex software development project. It showcases real-world multi-agent coordination, task distribution, and collaborative decision-making.

**Difficulty**: Advanced  
**Topics**: Multi-agent coordination, Role-based collaboration, Complex workflows, Real-time monitoring  
**Estimated Time**: 45 minutes

## 🎯 Scenario

We'll simulate a software development team with multiple AI agents:
- **Project Manager Agent**: Creates contexts and oversees project execution
- **Architect Agent**: Designs system architecture and creates technical plans
- **Developer Agents**: Implement features and write code
- **QA Agent**: Tests and validates deliverables
- **DevOps Agent**: Handles deployment and infrastructure

## 🤖 Agent Definitions

```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  permissions: string[];
}

const agents: Agent[] = [
  {
    id: 'agent-pm-001',
    name: 'ProjectManager-Alpha',
    role: 'project_manager',
    capabilities: ['project_planning', 'resource_allocation', 'stakeholder_communication'],
    permissions: ['context:create', 'plan:create', 'confirm:create', 'role:assign']
  },
  {
    id: 'agent-arch-001',
    name: 'Architect-Beta',
    role: 'architect',
    capabilities: ['system_design', 'technical_planning', 'code_review'],
    permissions: ['plan:create', 'plan:update', 'confirm:approve', 'trace:read']
  },
  {
    id: 'agent-dev-001',
    name: 'Developer-Gamma',
    role: 'developer',
    capabilities: ['frontend_development', 'api_development', 'testing'],
    permissions: ['plan:read', 'plan:update', 'trace:create']
  },
  {
    id: 'agent-dev-002',
    name: 'Developer-Delta',
    role: 'developer',
    capabilities: ['backend_development', 'database_design', 'optimization'],
    permissions: ['plan:read', 'plan:update', 'trace:create']
  },
  {
    id: 'agent-qa-001',
    name: 'QA-Epsilon',
    role: 'qa_engineer',
    capabilities: ['test_planning', 'automated_testing', 'quality_assurance'],
    permissions: ['plan:read', 'confirm:create', 'trace:read']
  },
  {
    id: 'agent-devops-001',
    name: 'DevOps-Zeta',
    role: 'devops_engineer',
    capabilities: ['infrastructure_management', 'deployment', 'monitoring'],
    permissions: ['plan:read', 'trace:read', 'system:monitor']
  }
];
```

## 🚀 Implementation

### 1. Multi-Agent Orchestrator

```typescript
import { initializeCoreModule } from 'mplp';

class MultiAgentOrchestrator {
  private core: any;
  private agents: Map<string, Agent> = new Map();
  private activeWorkflows: Map<string, WorkflowExecution> = new Map();

  constructor(core: any) {
    this.core = core;
    this.setupAgents();
    this.setupEventHandlers();
  }

  private setupAgents() {
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
      console.log(`🤖 Agent ${agent.name} (${agent.role}) initialized`);
    });
  }

  private setupEventHandlers() {
    this.core.orchestrator.addEventListener((event) => {
      this.handleWorkflowEvent(event);
    });
  }

  async executeCollaborativeProject(projectSpec: ProjectSpecification): Promise<ProjectResult> {
    console.log('🚀 Starting multi-agent collaborative project...');
    
    try {
      // Phase 1: Project Manager creates context and initial plan
      const context = await this.projectManagerCreateContext(projectSpec);
      
      // Phase 2: Architect designs system and creates technical plan
      const architecturePlan = await this.architectDesignSystem(context.context_id, projectSpec);
      
      // Phase 3: Parallel development by multiple developer agents
      const developmentResults = await this.parallelDevelopment(
        context.context_id, 
        architecturePlan.plan_id
      );
      
      // Phase 4: QA agent validates deliverables
      const qaResults = await this.qualityAssurance(
        context.context_id, 
        developmentResults
      );
      
      // Phase 5: DevOps agent handles deployment
      const deploymentResults = await this.deploymentProcess(
        context.context_id, 
        qaResults
      );
      
      // Phase 6: Project completion and reporting
      const projectResults = await this.projectCompletion(
        context.context_id,
        deploymentResults
      );
      
      return projectResults;
      
    } catch (error) {
      console.error('💥 Multi-agent collaboration failed:', error);
      throw error;
    }
  }

  private async projectManagerCreateContext(projectSpec: ProjectSpecification) {
    console.log('👔 Project Manager: Creating project context...');
    
    const pmAgent = this.agents.get('agent-pm-001')!;
    
    // Create project context
    const contextResult = await this.core.moduleServices.contextService.createContext({
      name: projectSpec.name,
      description: projectSpec.description,
      metadata: {
        project_type: projectSpec.type,
        priority: projectSpec.priority,
        budget: projectSpec.budget,
        deadline: projectSpec.deadline,
        team_size: agents.length,
        created_by: pmAgent.id
      },
      tags: ['multi-agent', 'collaborative', projectSpec.type]
    });

    if (!contextResult.success) {
      throw new Error(`Failed to create context: ${contextResult.error}`);
    }

    console.log(`✅ Project Manager: Context created - ${contextResult.data.context_id}`);
    
    // Assign roles to agents
    await this.assignAgentRoles(contextResult.data.context_id);
    
    return contextResult.data;
  }

  private async architectDesignSystem(contextId: string, projectSpec: ProjectSpecification) {
    console.log('🏗️ Architect: Designing system architecture...');
    
    const architectAgent = this.agents.get('agent-arch-001')!;
    
    // Create technical plan
    const planResult = await this.core.moduleServices.planService.createPlan({
      context_id: contextId,
      name: 'System Architecture & Implementation Plan',
      description: 'Comprehensive technical plan for system implementation',
      tasks: [
        {
          name: 'Database Design',
          description: 'Design database schema and relationships',
          priority: 'high',
          estimated_duration: 7200000, // 2 hours
          assigned_to: 'agent-dev-002',
          dependencies: []
        },
        {
          name: 'API Design',
          description: 'Design REST API endpoints and contracts',
          priority: 'high',
          estimated_duration: 5400000, // 1.5 hours
          assigned_to: 'agent-dev-002',
          dependencies: ['Database Design']
        },
        {
          name: 'Frontend Architecture',
          description: 'Design frontend component architecture',
          priority: 'medium',
          estimated_duration: 3600000, // 1 hour
          assigned_to: 'agent-dev-001',
          dependencies: ['API Design']
        },
        {
          name: 'Backend Implementation',
          description: 'Implement backend services and APIs',
          priority: 'high',
          estimated_duration: 18000000, // 5 hours
          assigned_to: 'agent-dev-002',
          dependencies: ['API Design']
        },
        {
          name: 'Frontend Implementation',
          description: 'Implement frontend components and UI',
          priority: 'medium',
          estimated_duration: 14400000, // 4 hours
          assigned_to: 'agent-dev-001',
          dependencies: ['Frontend Architecture', 'Backend Implementation']
        },
        {
          name: 'Integration Testing',
          description: 'Test system integration and APIs',
          priority: 'high',
          estimated_duration: 7200000, // 2 hours
          assigned_to: 'agent-qa-001',
          dependencies: ['Backend Implementation', 'Frontend Implementation']
        },
        {
          name: 'Deployment Setup',
          description: 'Configure deployment pipeline and infrastructure',
          priority: 'medium',
          estimated_duration: 5400000, // 1.5 hours
          assigned_to: 'agent-devops-001',
          dependencies: ['Integration Testing']
        }
      ],
      metadata: {
        methodology: 'agile',
        architecture_pattern: 'microservices',
        technology_stack: projectSpec.technologies,
        created_by: architectAgent.id
      }
    });

    if (!planResult.success) {
      throw new Error(`Failed to create plan: ${planResult.error}`);
    }

    console.log(`✅ Architect: Technical plan created - ${planResult.data.plan_id}`);
    
    // Request approval from project manager
    await this.requestPlanApproval(contextId, planResult.data.plan_id);
    
    return planResult.data;
  }

  private async parallelDevelopment(contextId: string, planId: string) {
    console.log('👨‍💻 Developers: Starting parallel development...');
    
    // Get plan tasks
    const planResult = await this.core.moduleServices.planService.getPlanById(planId);
    const tasks = planResult.data.tasks;
    
    // Execute development tasks in parallel where possible
    const developmentPromises = tasks
      .filter(task => task.assigned_to.startsWith('agent-dev-'))
      .map(task => this.executeTask(contextId, task));
    
    const results = await Promise.allSettled(developmentPromises);
    
    console.log('✅ Developers: Parallel development completed');
    return results;
  }

  private async executeTask(contextId: string, task: any) {
    const agent = this.agents.get(task.assigned_to)!;
    
    console.log(`🔧 ${agent.name}: Starting task "${task.name}"`);
    
    // Start tracing for this task
    const traceResult = await this.core.moduleServices.traceService.createTrace({
      context_id: contextId,
      trace_type: 'task_execution',
      name: `Task: ${task.name}`,
      metadata: {
        task_id: task.task_id,
        assigned_agent: agent.id,
        estimated_duration: task.estimated_duration
      }
    });
    
    // Simulate task execution with progress updates
    const startTime = Date.now();
    
    // Record task start event
    await this.core.moduleServices.traceService.recordEvent({
      trace_id: traceResult.data.trace_id,
      event_type: 'task_started',
      level: 'info',
      message: `${agent.name} started task: ${task.name}`,
      data: { task_id: task.task_id, agent_id: agent.id }
    });
    
    // Simulate work progress
    const progressSteps = 5;
    for (let i = 1; i <= progressSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
      
      const progress = (i / progressSteps) * 100;
      await this.core.moduleServices.traceService.recordEvent({
        trace_id: traceResult.data.trace_id,
        event_type: 'task_progress',
        level: 'info',
        message: `Task progress: ${progress}%`,
        data: { progress, step: i, total_steps: progressSteps }
      });
      
      console.log(`  📊 ${agent.name}: ${task.name} - ${progress}% complete`);
    }
    
    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    
    // Record task completion
    await this.core.moduleServices.traceService.recordEvent({
      trace_id: traceResult.data.trace_id,
      event_type: 'task_completed',
      level: 'info',
      message: `${agent.name} completed task: ${task.name}`,
      data: { 
        task_id: task.task_id, 
        actual_duration: actualDuration,
        estimated_duration: task.estimated_duration,
        efficiency: task.estimated_duration / actualDuration
      }
    });
    
    // Update task status
    await this.core.moduleServices.planService.updateTaskStatus(task.task_id, 'completed');
    
    console.log(`✅ ${agent.name}: Completed "${task.name}" in ${actualDuration}ms`);
    
    return {
      task_id: task.task_id,
      agent_id: agent.id,
      status: 'completed',
      actual_duration: actualDuration
    };
  }

  private async qualityAssurance(contextId: string, developmentResults: any[]) {
    console.log('🧪 QA Engineer: Starting quality assurance...');
    
    const qaAgent = this.agents.get('agent-qa-001')!;
    
    // Create QA confirmation request
    const confirmResult = await this.core.moduleServices.confirmService.createConfirmation({
      context_id: contextId,
      type: 'quality_approval',
      title: 'Quality Assurance Approval',
      description: 'QA validation of development deliverables',
      required_approvers: [qaAgent.id],
      approval_threshold: 1,
      metadata: {
        development_results: developmentResults,
        qa_checklist: [
          'Unit tests pass',
          'Integration tests pass',
          'Code quality standards met',
          'Security requirements satisfied',
          'Performance benchmarks achieved'
        ]
      }
    });
    
    // Simulate QA process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Submit QA approval
    await this.core.moduleServices.confirmService.submitApproval(
      confirmResult.data.confirmation_id,
      qaAgent.id,
      'approve',
      'All quality checks passed. Ready for deployment.'
    );
    
    console.log('✅ QA Engineer: Quality assurance completed and approved');
    
    return {
      qa_status: 'approved',
      confirmation_id: confirmResult.data.confirmation_id,
      qa_agent: qaAgent.id
    };
  }

  private async deploymentProcess(contextId: string, qaResults: any) {
    console.log('🚀 DevOps Engineer: Starting deployment process...');
    
    const devopsAgent = this.agents.get('agent-devops-001')!;
    
    // Create deployment trace
    const traceResult = await this.core.moduleServices.traceService.createTrace({
      context_id: contextId,
      trace_type: 'deployment',
      name: 'Production Deployment',
      metadata: {
        qa_approval: qaResults.confirmation_id,
        deployment_agent: devopsAgent.id,
        target_environment: 'production'
      }
    });
    
    // Simulate deployment steps
    const deploymentSteps = [
      'Building application',
      'Running tests',
      'Creating deployment package',
      'Deploying to staging',
      'Running smoke tests',
      'Deploying to production',
      'Verifying deployment'
    ];
    
    for (const [index, step] of deploymentSteps.entries()) {
      console.log(`  🔧 DevOps: ${step}...`);
      
      await this.core.moduleServices.traceService.recordEvent({
        trace_id: traceResult.data.trace_id,
        event_type: 'deployment_step',
        level: 'info',
        message: step,
        data: { step_number: index + 1, total_steps: deploymentSteps.length }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate deployment time
    }
    
    console.log('✅ DevOps Engineer: Deployment completed successfully');
    
    return {
      deployment_status: 'success',
      trace_id: traceResult.data.trace_id,
      deployment_agent: devopsAgent.id
    };
  }

  private async projectCompletion(contextId: string, deploymentResults: any) {
    console.log('🎉 Project Manager: Finalizing project...');
    
    // Update context status to completed
    await this.core.moduleServices.contextService.updateContextStatus(contextId, 'completed');
    
    // Generate project report
    const projectReport = await this.generateProjectReport(contextId);
    
    console.log('✅ Project Manager: Project completed successfully!');
    console.log('📊 Project Report:', projectReport);
    
    return {
      status: 'completed',
      context_id: contextId,
      deployment_results: deploymentResults,
      project_report: projectReport
    };
  }

  private async generateProjectReport(contextId: string) {
    // Get project metrics from trace data
    const metrics = await this.core.moduleServices.traceService.getMetrics({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    });
    
    return {
      total_agents: this.agents.size,
      total_execution_time: metrics.total_duration || 0,
      tasks_completed: metrics.completed_tasks || 0,
      success_rate: metrics.success_rate || 0,
      efficiency_score: metrics.efficiency_score || 0
    };
  }

  private handleWorkflowEvent(event: any) {
    console.log(`📡 Workflow Event: ${event.event_type} - ${event.timestamp}`);
    
    // Handle different event types
    switch (event.event_type) {
      case 'stage_started':
        console.log(`🏁 Stage ${event.stage} started for execution ${event.execution_id}`);
        break;
      case 'stage_completed':
        console.log(`✅ Stage ${event.stage} completed for execution ${event.execution_id}`);
        break;
      case 'workflow_completed':
        console.log(`🎉 Workflow ${event.execution_id} completed successfully`);
        break;
      case 'workflow_failed':
        console.log(`❌ Workflow ${event.execution_id} failed: ${event.error}`);
        break;
    }
  }

  private async assignAgentRoles(contextId: string) {
    // Assign roles to agents for this context
    for (const agent of this.agents.values()) {
      await this.core.moduleServices.roleService.assignRoleToUser(
        agent.id,
        agent.role,
        { context_id: contextId }
      );
    }
  }

  private async requestPlanApproval(contextId: string, planId: string) {
    const confirmResult = await this.core.moduleServices.confirmService.createConfirmation({
      context_id: contextId,
      plan_id: planId,
      type: 'plan_approval',
      title: 'Technical Plan Approval',
      description: 'Architect requests approval for technical implementation plan',
      required_approvers: ['agent-pm-001'],
      approval_threshold: 1
    });
    
    // Auto-approve for demo purposes
    await this.core.moduleServices.confirmService.submitApproval(
      confirmResult.data.confirmation_id,
      'agent-pm-001',
      'approve',
      'Technical plan approved. Proceed with implementation.'
    );
  }
}

// Project specification interface
interface ProjectSpecification {
  name: string;
  description: string;
  type: string;
  priority: string;
  budget: number;
  deadline: string;
  technologies: string[];
}

// Usage example
async function runMultiAgentCollaboration() {
  // Initialize MPLP
  const core = await initializeCoreModule(moduleServices);
  
  // Create multi-agent orchestrator
  const orchestrator = new MultiAgentOrchestrator(core);
  
  // Define project specification
  const projectSpec: ProjectSpecification = {
    name: 'E-commerce Platform v2.0',
    description: 'Next-generation e-commerce platform with AI recommendations',
    type: 'web_application',
    priority: 'high',
    budget: 100000,
    deadline: '2024-03-31T23:59:59Z',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker']
  };
  
  // Execute collaborative project
  const result = await orchestrator.executeCollaborativeProject(projectSpec);
  
  console.log('🎊 Multi-agent collaboration completed!');
  console.log('Final Result:', result);
}

// Run the example
if (require.main === module) {
  runMultiAgentCollaboration().catch(console.error);
}

export { MultiAgentOrchestrator, runMultiAgentCollaboration };
```

## 📊 Expected Output

```
🚀 Starting multi-agent collaborative project...
🤖 Agent ProjectManager-Alpha (project_manager) initialized
🤖 Agent Architect-Beta (architect) initialized
🤖 Agent Developer-Gamma (developer) initialized
🤖 Agent Developer-Delta (developer) initialized
🤖 Agent QA-Epsilon (qa_engineer) initialized
🤖 Agent DevOps-Zeta (devops_engineer) initialized

👔 Project Manager: Creating project context...
✅ Project Manager: Context created - ctx-123e4567-e89b-12d3-a456-426614174000

🏗️ Architect: Designing system architecture...
✅ Architect: Technical plan created - plan-456e7890-f12g-34h5-i678-901234567890

👨‍💻 Developers: Starting parallel development...
🔧 Developer-Gamma: Starting task "Frontend Architecture"
🔧 Developer-Delta: Starting task "Database Design"
  📊 Developer-Gamma: Frontend Architecture - 20% complete
  📊 Developer-Delta: Database Design - 20% complete
  📊 Developer-Gamma: Frontend Architecture - 40% complete
  📊 Developer-Delta: Database Design - 40% complete
  ...
✅ Developer-Gamma: Completed "Frontend Architecture" in 5234ms
✅ Developer-Delta: Completed "Database Design" in 4987ms
✅ Developers: Parallel development completed

🧪 QA Engineer: Starting quality assurance...
✅ QA Engineer: Quality assurance completed and approved

🚀 DevOps Engineer: Starting deployment process...
  🔧 DevOps: Building application...
  🔧 DevOps: Running tests...
  🔧 DevOps: Creating deployment package...
  🔧 DevOps: Deploying to staging...
  🔧 DevOps: Running smoke tests...
  🔧 DevOps: Deploying to production...
  🔧 DevOps: Verifying deployment...
✅ DevOps Engineer: Deployment completed successfully

🎉 Project Manager: Finalizing project...
✅ Project Manager: Project completed successfully!
📊 Project Report: {
  total_agents: 6,
  total_execution_time: 45678,
  tasks_completed: 7,
  success_rate: 1.0,
  efficiency_score: 0.92
}

🎊 Multi-agent collaboration completed!
```

## 🔍 Key Concepts Demonstrated

1. **Agent Coordination**: Multiple agents working together with defined roles
2. **Workflow Orchestration**: Complex multi-stage workflows with dependencies
3. **Real-time Monitoring**: Comprehensive tracing of all agent activities
4. **Role-based Permissions**: Each agent has specific permissions and capabilities
5. **Approval Workflows**: Quality gates and approval processes
6. **Parallel Execution**: Multiple agents working simultaneously
7. **Event-driven Communication**: Agents responding to workflow events

## 🚀 Next Steps

- Extend with more agent types (Security, Documentation, etc.)
- Add machine learning for intelligent task assignment
- Implement dynamic role adjustment based on workload
- Add conflict resolution mechanisms
- Integrate with external AI services

---

This example showcases the power of MPLP v1.0 for orchestrating complex multi-agent collaborations in real-world scenarios. 🤖✨
