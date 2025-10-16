/**
 * @fileoverview Multi-Agent Orchestrator
 * Main orchestrator class for managing agents and executing workflows
 */

import { MPLPEventManager } from '../utils/EventEmitter';
import { IAgent } from '../types';
import {
  IMultiAgentOrchestrator,
  WorkflowDefinition,
  WorkflowResult,
  ExecutionOptions,
  ProgressHandler,
  ErrorHandler,
  OrchestratorError,
  AgentNotFoundError,
  WorkflowNotFoundError,
  WorkflowDefinitionError
} from '../types';
import { ExecutionEngine } from '../execution/ExecutionEngine';
import { WorkflowBuilder } from '../workflow/WorkflowBuilder';

/**
 * Multi-agent orchestrator implementation - 基于MPLP V1.0 Alpha架构
 * Enhanced with enterprise-grade features for production deployment
 */
export class MultiAgentOrchestrator extends MPLPEventManager implements IMultiAgentOrchestrator {
  private readonly agents = new Map<string, IAgent>();
  private readonly workflows = new Map<string, WorkflowDefinition>();
  private readonly executionEngine: ExecutionEngine;

  // Enterprise features
  private readonly performanceMetrics = new Map<string, any>();
  private readonly auditLog: any[] = [];
  private readonly workflowTemplates = new Map<string, WorkflowDefinition>();
  private readonly loadBalancer = new Map<string, number>();
  private readonly securityPolicies = new Map<string, any>();

  constructor() {
    super();
    this.executionEngine = new ExecutionEngine();
    this.setupExecutionEngineEvents();
  }

  // ============================================================================
  // Agent Management
  // ============================================================================

  /**
   * Register an agent with the orchestrator
   */
  public async registerAgent(agent: IAgent): Promise<void> {
    if (!agent || !agent.id) {
      throw new OrchestratorError('Invalid agent: agent must have an ID');
    }

    if (this.agents.has(agent.id)) {
      throw new OrchestratorError(`Agent already registered: ${agent.id}`);
    }

    this.agents.set(agent.id, agent);
    this.executionEngine.registerAgent(agent);

    this.emit('agentRegistered', agent);
  }

  /**
   * Unregister an agent from the orchestrator
   */
  public async unregisterAgent(agentId: string): Promise<void> {
    if (!agentId || typeof agentId !== 'string') {
      throw new OrchestratorError('Invalid agent ID');
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new AgentNotFoundError(agentId);
    }

    this.agents.delete(agentId);
    this.executionEngine.unregisterAgent(agentId);

    this.emit('agentUnregistered', agent);
  }

  /**
   * Get a registered agent
   */
  public getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all registered agents
   */
  public listAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  // ============================================================================
  // Workflow Management
  // ============================================================================

  /**
   * Register a workflow definition
   */
  public async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    if (!workflow || !workflow.id) {
      throw new WorkflowDefinitionError('Invalid workflow: workflow must have an ID');
    }

    if (this.workflows.has(workflow.id)) {
      throw new WorkflowDefinitionError(`Workflow already registered: ${workflow.id}`);
    }

    // Validate workflow
    this.validateWorkflow(workflow);

    this.workflows.set(workflow.id, workflow);
    this.emit('workflowRegistered', workflow);
  }

  /**
   * Unregister a workflow definition
   */
  public async unregisterWorkflow(workflowId: string): Promise<void> {
    if (!workflowId || typeof workflowId !== 'string') {
      throw new WorkflowDefinitionError('Invalid workflow ID');
    }

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new WorkflowNotFoundError(workflowId);
    }

    this.workflows.delete(workflowId);
    this.emit('workflowUnregistered', workflow);
  }

  /**
   * Get a registered workflow
   */
  public getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * List all registered workflows
   */
  public listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  // ============================================================================
  // Execution Management
  // ============================================================================

  /**
   * Execute a workflow
   */
  public async executeWorkflow(
    workflowId: string,
    parameters: Record<string, unknown> = {},
    options: ExecutionOptions = {}
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new WorkflowNotFoundError(workflowId);
    }

    // Validate that all required agents are registered
    this.validateWorkflowAgents(workflow);

    try {
      const result = await this.executionEngine.executeWorkflow(workflow, parameters, options);
      this.emit('workflowExecuted', result);
      return result;
    } catch (error) {
      this.emit('workflowExecutionFailed', workflowId, error);
      throw error;
    }
  }

  /**
   * Pause workflow execution
   */
  public async pauseExecution(executionId: string): Promise<void> {
    // TODO: Implement pause functionality
    throw new OrchestratorError('Pause functionality not yet implemented');
  }

  /**
   * Resume workflow execution
   */
  public async resumeExecution(executionId: string): Promise<void> {
    // TODO: Implement resume functionality
    throw new OrchestratorError('Resume functionality not yet implemented');
  }

  /**
   * Cancel workflow execution
   */
  public async cancelExecution(executionId: string): Promise<void> {
    // TODO: Implement cancel functionality
    throw new OrchestratorError('Cancel functionality not yet implemented');
  }

  /**
   * Get execution status
   */
  public getExecutionStatus(executionId: string): WorkflowResult | undefined {
    return this.executionEngine.getExecution(executionId);
  }

  /**
   * List all executions
   */
  public listExecutions(): WorkflowResult[] {
    return this.executionEngine.listExecutions();
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Register progress handler
   */
  public onProgress(handler: ProgressHandler): void {
    this.on('progress', handler);
  }

  /**
   * Register error handler
   */
  public onError(handler: ErrorHandler): void {
    this.on('error', handler);
  }

  /**
   * Get listener count for an event
   */
  public listenerCount(event: string): number {
    return super.listenerCount(event);
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a new orchestrator instance
   */
  public static create(): MultiAgentOrchestrator {
    return new MultiAgentOrchestrator();
  }

  /**
   * Create a workflow builder
   */
  public static createWorkflow(name: string, id?: string): WorkflowBuilder {
    return WorkflowBuilder.create(name, id);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private setupExecutionEngineEvents(): void {
    this.executionEngine.on('progress', (progress) => {
      this.emit('progress', progress);
    });

    this.executionEngine.on('stepCompleted', (stepResult) => {
      this.emit('stepCompleted', stepResult);
    });

    this.executionEngine.on('stepFailed', (stepResult, error) => {
      this.emit('stepFailed', stepResult, error);
    });

    this.executionEngine.on('workflowCompleted', (result) => {
      this.emit('workflowCompleted', result);
    });

    this.executionEngine.on('workflowFailed', (result, error) => {
      this.emit('workflowFailed', result, error);
    });
  }

  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.name || typeof workflow.name !== 'string') {
      throw new WorkflowDefinitionError('Workflow must have a valid name');
    }

    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      throw new WorkflowDefinitionError('Workflow must have at least one step');
    }

    // Validate step IDs are unique
    const stepIds = new Set<string>();
    for (const step of workflow.steps) {
      if (stepIds.has(step.id)) {
        throw new WorkflowDefinitionError(`Duplicate step ID: ${step.id}`);
      }
      stepIds.add(step.id);
    }

    // Validate dependencies exist
    for (const step of workflow.steps) {
      if (step.dependencies) {
        for (const dep of step.dependencies) {
          if (!stepIds.has(dep)) {
            throw new WorkflowDefinitionError(
              `Step '${step.id}' depends on non-existent step '${dep}'`
            );
          }
        }
      }
    }
  }

  private validateWorkflowAgents(workflow: WorkflowDefinition): void {
    const requiredAgents = new Set<string>();

    // Collect all agent IDs from workflow steps
    const collectAgentIds = (steps: any[]): void => {
      for (const step of steps) {
        if (step.type === 'agent' && step.agentId) {
          requiredAgents.add(step.agentId);
        } else if (step.steps) {
          collectAgentIds(step.steps);
        } else if (step.thenStep) {
          collectAgentIds([step.thenStep]);
          if (step.elseStep) {
            collectAgentIds([step.elseStep]);
          }
        } else if (step.body) {
          collectAgentIds([step.body]);
        }
      }
    };

    collectAgentIds(workflow.steps);

    // Check that all required agents are registered
    requiredAgents.forEach(agentId => {
      if (!this.agents.has(agentId)) {
        throw new AgentNotFoundError(agentId);
      }
    });
  }

  // ============================================================================
  // Enterprise Features - Performance Monitoring
  // ============================================================================

  /**
   * Get performance metrics for agents and workflows
   */
  public getPerformanceMetrics(): Record<string, any> {
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Record performance metric
   */
  public recordPerformanceMetric(key: string, value: any): void {
    const timestamp = new Date().toISOString();
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    this.performanceMetrics.get(key)!.push({ value, timestamp });

    // Keep only last 100 entries per metric
    const metrics = this.performanceMetrics.get(key)!;
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Get agent performance statistics
   */
  public getAgentPerformanceStats(agentId: string): any {
    const metrics = this.performanceMetrics.get(`agent_${agentId}`) || [];
    if (metrics.length === 0) return null;

    const executionTimes = metrics.map((m: any) => m.value.executionTime).filter(Boolean);
    const successRate = metrics.filter((m: any) => m.value.success).length / metrics.length;

    return {
      totalExecutions: metrics.length,
      averageExecutionTime: executionTimes.reduce((a: number, b: number) => a + b, 0) / executionTimes.length || 0,
      successRate: successRate,
      lastExecution: metrics[metrics.length - 1]?.timestamp
    };
  }

  // ============================================================================
  // Enterprise Features - Load Balancing
  // ============================================================================

  /**
   * Get optimal agent for execution based on load balancing
   */
  public getOptimalAgent(agentType: string): string | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => (agent as any).type === agentType)
      .map(agent => agent.id);

    if (availableAgents.length === 0) return null;
    if (availableAgents.length === 1) return availableAgents[0] || null;

    // Simple round-robin load balancing
    const currentLoad = this.loadBalancer.get(agentType) || 0;
    const selectedIndex = currentLoad % availableAgents.length;
    this.loadBalancer.set(agentType, currentLoad + 1);

    return availableAgents[selectedIndex] || null;
  }

  /**
   * Set agent load balancing weight
   */
  public setAgentWeight(agentId: string, weight: number): void {
    if (!this.agents.has(agentId)) {
      throw new AgentNotFoundError(agentId);
    }

    this.recordAuditEvent('agent_weight_changed', {
      agentId,
      weight,
      timestamp: new Date().toISOString()
    });
  }

  // ============================================================================
  // Enterprise Features - Audit and Security
  // ============================================================================

  /**
   * Record audit event
   */
  public recordAuditEvent(event: string, details: any): void {
    this.auditLog.push({
      event,
      details,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 audit events
    if (this.auditLog.length > 1000) {
      this.auditLog.splice(0, this.auditLog.length - 1000);
    }
  }

  /**
   * Get audit log
   */
  public getAuditLog(limit: number = 100): any[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Set security policy
   */
  public setSecurityPolicy(policyName: string, policy: any): void {
    this.securityPolicies.set(policyName, policy);
    this.recordAuditEvent('security_policy_updated', {
      policyName,
      policy,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validate security policy
   */
  public validateSecurityPolicy(policyName: string, context: any): boolean {
    const policy = this.securityPolicies.get(policyName);
    if (!policy) return true; // No policy means allowed

    // Simple policy validation (can be extended)
    if (policy.allowedAgents && context.agentId) {
      return policy.allowedAgents.includes(context.agentId);
    }

    return true;
  }

  // ============================================================================
  // Enterprise Features - Workflow Templates
  // ============================================================================

  /**
   * Register workflow template
   */
  public registerWorkflowTemplate(templateId: string, template: WorkflowDefinition): void {
    this.workflowTemplates.set(templateId, { ...template });
    this.recordAuditEvent('workflow_template_registered', {
      templateId,
      template: template.name,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create workflow from template
   */
  public createWorkflowFromTemplate(templateId: string, workflowId: string, parameters: any = {}): WorkflowDefinition {
    const template = this.workflowTemplates.get(templateId);
    if (!template) {
      throw new WorkflowNotFoundError(`Template not found: ${templateId}`);
    }

    // Clone template and apply parameters
    const workflow: WorkflowDefinition = {
      ...JSON.parse(JSON.stringify(template)),
      id: workflowId,
      name: parameters.name || `${template.name} (${workflowId})`,
      metadata: {
        ...template.metadata,
        ...parameters.metadata,
        templateId,
        createdFrom: templateId,
        createdAt: new Date().toISOString()
      }
    };

    // Apply parameter substitution in steps
    this.applyParameterSubstitution(workflow.steps, parameters);

    this.recordAuditEvent('workflow_created_from_template', {
      templateId,
      workflowId,
      parameters,
      timestamp: new Date().toISOString()
    });

    return workflow;
  }

  /**
   * List available workflow templates
   */
  public listWorkflowTemplates(): Array<{ id: string; name: string; description?: string }> {
    return Array.from(this.workflowTemplates.entries()).map(([id, template]) => {
      const result: { id: string; name: string; description?: string } = {
        id,
        name: template.name
      };

      if (typeof template.metadata?.description === 'string') {
        result.description = template.metadata.description;
      }

      return result;
    });
  }

  /**
   * Apply parameter substitution to workflow steps
   */
  private applyParameterSubstitution(steps: any[], parameters: any): void {
    for (const step of steps) {
      // Apply substitution to all step properties
      for (const [key, value] of Object.entries(step)) {
        if (key !== 'steps' && key !== 'thenStep' && key !== 'elseStep' && key !== 'body') {
          step[key] = this.substituteParameters(value, parameters);
        }
      }

      // Recursively apply to nested steps
      if (step.steps) {
        this.applyParameterSubstitution(step.steps, parameters);
      }
      if (step.thenStep) {
        this.applyParameterSubstitution([step.thenStep], parameters);
      }
      if (step.elseStep) {
        this.applyParameterSubstitution([step.elseStep], parameters);
      }
      if (step.body) {
        this.applyParameterSubstitution([step.body], parameters);
      }
    }
  }

  /**
   * Substitute parameters in configuration
   */
  private substituteParameters(config: any, parameters: any): any {
    if (typeof config === 'string') {
      return config.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return parameters[key] !== undefined ? parameters[key] : match;
      });
    }

    if (Array.isArray(config)) {
      return config.map(item => this.substituteParameters(item, parameters));
    }

    if (typeof config === 'object' && config !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(config)) {
        result[key] = this.substituteParameters(value, parameters);
      }
      return result;
    }

    return config;
  }

  // ============================================================================
  // Enterprise Features - Advanced Analytics
  // ============================================================================

  /**
   * Get workflow execution analytics
   */
  public getWorkflowAnalytics(workflowId?: string): any {
    const executions = this.executionEngine.listExecutions();
    const filteredExecutions = workflowId
      ? executions.filter(exec => exec.workflowId === workflowId)
      : executions;

    if (filteredExecutions.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        failureReasons: {}
      };
    }

    const successfulExecutions = filteredExecutions.filter(exec => exec.status === 'completed');
    const failedExecutions = filteredExecutions.filter(exec => exec.status === 'failed');

    const executionTimes = successfulExecutions
      .map(exec => exec.endTime && exec.startTime ?
        new Date(exec.endTime).getTime() - new Date(exec.startTime).getTime() : 0)
      .filter(time => time > 0);

    const failureReasons: Record<string, number> = {};
    failedExecutions.forEach(exec => {
      const reason = exec.error?.message || 'Unknown error';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    return {
      totalExecutions: filteredExecutions.length,
      successfulExecutions: successfulExecutions.length,
      failedExecutions: failedExecutions.length,
      successRate: successfulExecutions.length / filteredExecutions.length,
      averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length || 0,
      failureReasons,
      lastExecution: filteredExecutions[filteredExecutions.length - 1]?.startTime
    };
  }

  /**
   * Get system health status
   */
  public getSystemHealth(): any {
    const totalAgents = this.agents.size;
    const totalWorkflows = this.workflows.size;
    const totalExecutions = this.executionEngine.listExecutions().length;
    const recentExecutions = this.executionEngine.listExecutions()
      .filter(exec => {
        const execTime = new Date(exec.startTime).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return execTime > oneHourAgo;
      });

    const healthyAgents = Array.from(this.agents.values())
      .filter(agent => (agent as any).status !== 'error').length;

    return {
      status: healthyAgents === totalAgents ? 'healthy' : 'degraded',
      agents: {
        total: totalAgents,
        healthy: healthyAgents,
        unhealthy: totalAgents - healthyAgents
      },
      workflows: {
        total: totalWorkflows,
        templates: this.workflowTemplates.size
      },
      executions: {
        total: totalExecutions,
        recentHour: recentExecutions.length,
        recentSuccessRate: recentExecutions.length > 0
          ? recentExecutions.filter(exec => exec.status === 'completed').length / recentExecutions.length
          : 0
      },
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate average response time from recent metrics
   */
  private calculateAverageResponseTime(): number {
    const allMetrics = Array.from(this.performanceMetrics.values()).flat();
    const recentMetrics = allMetrics.filter((metric: any) => {
      const metricTime = new Date(metric.timestamp).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return metricTime > oneHourAgo && metric.value.executionTime;
    });

    if (recentMetrics.length === 0) return 0;

    const totalTime = recentMetrics.reduce((sum: number, metric: any) =>
      sum + (metric.value.executionTime || 0), 0);

    return totalTime / recentMetrics.length;
  }
}
