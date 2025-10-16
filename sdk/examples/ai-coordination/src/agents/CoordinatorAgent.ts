/**
 * AI Coordination Example - Coordinator Agent Implementation
 * Central coordination agent that orchestrates multi-agent workflows
 */

import { BaseAgent, BaseAgentConfig } from './BaseAgent';
import {
  IAgent,
  Task,
  TaskResult,
  AgentMessage,
  TaskRequirements,
  DecisionRequest,
  DecisionResult,
  AgentError,
  CoordinationEvent
} from '../types';
import { PlannerAgent, ContentPlan } from './PlannerAgent';
import { CreatorAgent, CreatedContent } from './CreatorAgent';
import { ReviewerAgent, ReviewResult } from './ReviewerAgent';
import { PublisherAgent, PublishingResult } from './PublisherAgent';

export interface CoordinatorAgentConfig extends Omit<BaseAgentConfig, 'type' | 'capabilities'> {
  readonly coordination_strategy?: CoordinationStrategy;
  readonly decision_timeout?: number;
  readonly max_coordination_rounds?: number;
  readonly consensus_threshold?: number;
}

export type CoordinationStrategy = 
  | 'sequential'
  | 'parallel'
  | 'adaptive'
  | 'consensus_driven'
  | 'priority_based';

export interface WorkflowResult {
  readonly workflow_id: string;
  readonly coordinator_id: string;
  readonly status: WorkflowStatus;
  readonly stages: StageResult[];
  readonly final_output: unknown;
  readonly execution_metadata: ExecutionMetadata;
  readonly coordination_metrics: CoordinationMetrics;
}

export type WorkflowStatus = 
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled'
  | 'in_progress';

export interface StageResult {
  readonly stage_name: string;
  readonly agent_id: string;
  readonly status: 'success' | 'failed' | 'skipped';
  readonly result?: unknown;
  readonly execution_time: number;
  readonly error?: string;
}

export interface ExecutionMetadata {
  readonly started_at: Date;
  readonly completed_at?: Date;
  readonly total_execution_time: number;
  readonly coordination_rounds: number;
  readonly decisions_made: number;
  readonly conflicts_resolved: number;
}

export interface CoordinationMetrics {
  readonly agent_utilization: Record<string, number>;
  readonly communication_efficiency: number;
  readonly decision_accuracy: number;
  readonly workflow_efficiency: number;
  readonly quality_score: number;
}

export class CoordinatorAgent extends BaseAgent {
  private readonly coordinationStrategy: CoordinationStrategy;
  private readonly decisionTimeout: number;
  private readonly maxCoordinationRounds: number;
  private readonly consensusThreshold: number;
  
  private readonly registeredAgents = new Map<string, IAgent>();
  private readonly workflowHistory: WorkflowResult[] = [];
  private readonly activeWorkflows = new Map<string, WorkflowExecution>();

  constructor(config: CoordinatorAgentConfig) {
    super({
      ...config,
      type: 'coordinator',
      capabilities: [
        'task_coordination',
        'decision_making',
        'conflict_resolution',
        'quality_assessment'
      ]
    });

    this.coordinationStrategy = config.coordination_strategy ?? 'adaptive';
    this.decisionTimeout = config.decision_timeout ?? 30000;
    this.maxCoordinationRounds = config.max_coordination_rounds ?? 5;
    this.consensusThreshold = config.consensus_threshold ?? 0.8;
  }

  protected async onInitialize(): Promise<void> {
    // Initialize coordination systems
    await this.initializeCoordinationSystems();
    
    console.log(`🎯 CoordinatorAgent "${this.name}" initialized with strategy: ${this.coordinationStrategy}`);
  }

  protected async onProcessTask(task: Task): Promise<WorkflowResult> {
    const workflowId = `workflow_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Create workflow execution context
      const workflowExecution = this.createWorkflowExecution(workflowId, task);
      this.activeWorkflows.set(workflowId, workflowExecution);

      // Execute the coordination workflow
      const result = await this.executeCoordinationWorkflow(workflowExecution);
      
      // Store in workflow history
      this.workflowHistory.push(result);
      
      return result;

    } catch (error) {
      // Handle workflow failure
      const failedResult: WorkflowResult = {
        workflow_id: workflowId,
        coordinator_id: this.id,
        status: 'failed',
        stages: [],
        final_output: null,
        execution_metadata: {
          started_at: new Date(startTime),
          completed_at: new Date(),
          total_execution_time: Date.now() - startTime,
          coordination_rounds: 0,
          decisions_made: 0,
          conflicts_resolved: 0
        },
        coordination_metrics: this.getEmptyMetrics()
      };

      this.workflowHistory.push(failedResult);
      throw error;

    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  protected async onCommunicate(message: AgentMessage): Promise<unknown> {
    switch (message.type) {
      case 'decision_request':
        return await this.handleDecisionRequest(message);
      
      case 'coordination_request':
        return await this.handleCoordinationRequest(message);
      
      case 'status_update':
        return await this.handleStatusUpdate(message);
      
      default:
        return {
          status: 'acknowledged',
          message: `CoordinatorAgent received ${message.type} message`,
          timestamp: new Date()
        };
    }
  }

  protected async onShutdown(): Promise<void> {
    // Cancel all active workflows
    for (const [workflowId] of this.activeWorkflows) {
      await this.cancelWorkflow(workflowId);
    }

    // Unregister all agents
    this.registeredAgents.clear();

    // Save workflow history
    await this.saveWorkflowHistory();
    
    console.log(`🎯 CoordinatorAgent "${this.name}" shutdown completed`);
  }

  // ============================================================================
  // Agent Registration and Management
  // ============================================================================

  public async registerAgent(agent: IAgent): Promise<void> {
    this.registeredAgents.set(agent.id, agent);
    
    // Set up event listeners for the agent
    agent.on('coordinationEvent', (event: CoordinationEvent) => {
      this.handleAgentEvent(event);
    });

    console.log(`🤝 Registered agent: ${agent.name} (${agent.type})`);
  }

  public async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.registeredAgents.get(agentId);
    if (agent) {
      agent.removeAllListeners('coordinationEvent');
      this.registeredAgents.delete(agentId);
      console.log(`👋 Unregistered agent: ${agent.name}`);
    }
  }

  public getRegisteredAgents(): IAgent[] {
    return Array.from(this.registeredAgents.values());
  }

  // ============================================================================
  // Workflow Execution
  // ============================================================================

  private async executeCoordinationWorkflow(execution: WorkflowExecution): Promise<WorkflowResult> {
    const stages: StageResult[] = [];
    let currentOutput: unknown = null;
    let coordinationRounds = 0;
    let decisionsMade = 0;
    let conflictsResolved = 0;

    try {
      // Stage 1: Planning
      const planningResult = await this.executePlanningStage(execution);
      stages.push(planningResult);
      currentOutput = planningResult.result;

      // Stage 2: Content Creation
      const creationResult = await this.executeCreationStage(execution, currentOutput as ContentPlan);
      stages.push(creationResult);
      currentOutput = creationResult.result;

      // Stage 3: Review
      const reviewResult = await this.executeReviewStage(execution, currentOutput as CreatedContent);
      stages.push(reviewResult);

      // Handle review feedback
      if (reviewResult.result && !(reviewResult.result as ReviewResult).approval_decision.approved) {
        // Content needs revision - coordinate revision process
        const revisionResult = await this.coordinateRevisionProcess(
          execution,
          currentOutput as CreatedContent,
          reviewResult.result as ReviewResult
        );
        stages.push(...revisionResult.stages);
        currentOutput = revisionResult.finalContent;
        coordinationRounds += revisionResult.rounds;
        conflictsResolved += revisionResult.conflicts;
      }

      // Stage 4: Publishing
      const publishingResult = await this.executePublishingStage(
        execution,
        currentOutput as CreatedContent,
        reviewResult.result as ReviewResult
      );
      stages.push(publishingResult);
      currentOutput = publishingResult.result;

      // Calculate metrics
      const metrics = await this.calculateCoordinationMetrics(stages, execution);

      return {
        workflow_id: execution.workflowId,
        coordinator_id: this.id,
        status: 'completed',
        stages,
        final_output: currentOutput,
        execution_metadata: {
          started_at: execution.startTime,
          completed_at: new Date(),
          total_execution_time: Date.now() - execution.startTime.getTime(),
          coordination_rounds: coordinationRounds,
          decisions_made: decisionsMade,
          conflicts_resolved: conflictsResolved
        },
        coordination_metrics: metrics
      };

    } catch (error) {
      return {
        workflow_id: execution.workflowId,
        coordinator_id: this.id,
        status: 'failed',
        stages,
        final_output: null,
        execution_metadata: {
          started_at: execution.startTime,
          completed_at: new Date(),
          total_execution_time: Date.now() - execution.startTime.getTime(),
          coordination_rounds: coordinationRounds,
          decisions_made: decisionsMade,
          conflicts_resolved: conflictsResolved
        },
        coordination_metrics: this.getEmptyMetrics()
      };
    }
  }

  private async executePlanningStage(execution: WorkflowExecution): Promise<StageResult> {
    const planner = this.findAgentByType('planner') as PlannerAgent;
    if (!planner) {
      throw new AgentError('No planner agent available', this.id, 'MISSING_AGENT');
    }

    const startTime = Date.now();
    try {
      const planningTask: Task = {
        id: `planning_${execution.workflowId}`,
        type: 'content_creation',
        priority: 'high',
        requirements: execution.originalTask.requirements,
        context: execution.originalTask.context
      };

      const result = await planner.process(planningTask);
      
      return {
        stage_name: 'planning',
        agent_id: planner.id,
        status: 'success',
        result: result.output,
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage_name: 'planning',
        agent_id: planner.id,
        status: 'failed',
        execution_time: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async executeCreationStage(execution: WorkflowExecution, plan: ContentPlan): Promise<StageResult> {
    const creator = this.findAgentByType('creator') as CreatorAgent;
    if (!creator) {
      throw new AgentError('No creator agent available', this.id, 'MISSING_AGENT');
    }

    const startTime = Date.now();
    try {
      const creationTask: Task = {
        id: `creation_${execution.workflowId}`,
        type: 'content_creation',
        priority: 'high',
        requirements: execution.originalTask.requirements,
        context: {
          ...execution.originalTask.context,
          metadata: {
            ...execution.originalTask.context.metadata,
            contentPlan: plan
          }
        }
      };

      const result = await creator.process(creationTask);
      
      return {
        stage_name: 'creation',
        agent_id: creator.id,
        status: 'success',
        result: result.output,
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage_name: 'creation',
        agent_id: creator.id,
        status: 'failed',
        execution_time: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async executeReviewStage(execution: WorkflowExecution, content: CreatedContent): Promise<StageResult> {
    const reviewer = this.findAgentByType('reviewer') as ReviewerAgent;
    if (!reviewer) {
      throw new AgentError('No reviewer agent available', this.id, 'MISSING_AGENT');
    }

    const startTime = Date.now();
    try {
      const reviewTask: Task = {
        id: `review_${execution.workflowId}`,
        type: 'content_review',
        priority: 'high',
        requirements: execution.originalTask.requirements,
        context: {
          ...execution.originalTask.context,
          metadata: {
            ...execution.originalTask.context.metadata,
            content
          }
        }
      };

      const result = await reviewer.process(reviewTask);
      
      return {
        stage_name: 'review',
        agent_id: reviewer.id,
        status: 'success',
        result: result.output,
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage_name: 'review',
        agent_id: reviewer.id,
        status: 'failed',
        execution_time: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async executePublishingStage(
    execution: WorkflowExecution,
    content: CreatedContent,
    reviewResult: ReviewResult
  ): Promise<StageResult> {
    const publisher = this.findAgentByType('publisher') as PublisherAgent;
    if (!publisher) {
      throw new AgentError('No publisher agent available', this.id, 'MISSING_AGENT');
    }

    const startTime = Date.now();
    try {
      const publishingTask: Task = {
        id: `publishing_${execution.workflowId}`,
        type: 'content_publishing',
        priority: 'high',
        requirements: execution.originalTask.requirements,
        context: {
          ...execution.originalTask.context,
          metadata: {
            ...execution.originalTask.context.metadata,
            content,
            reviewResult
          }
        }
      };

      const result = await publisher.process(publishingTask);
      
      return {
        stage_name: 'publishing',
        agent_id: publisher.id,
        status: 'success',
        result: result.output,
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage_name: 'publishing',
        agent_id: publisher.id,
        status: 'failed',
        execution_time: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async coordinateRevisionProcess(
    execution: WorkflowExecution,
    content: CreatedContent,
    reviewResult: ReviewResult
  ): Promise<{ stages: StageResult[]; finalContent: CreatedContent; rounds: number; conflicts: number }> {
    // Simplified revision process - in a real implementation, this would be more sophisticated
    const stages: StageResult[] = [];
    let rounds = 1;
    let conflicts = 0;

    // For this example, we'll simulate a revision by creating a "revised" version
    const revisedContent: CreatedContent = {
      ...content,
      title: `${content.title} (Revised)`,
      metadata: {
        ...content.metadata,
        created_at: new Date()
      }
    };

    stages.push({
      stage_name: 'revision',
      agent_id: this.id,
      status: 'success',
      result: revisedContent,
      execution_time: 1000
    });

    return {
      stages,
      finalContent: revisedContent,
      rounds,
      conflicts
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private createWorkflowExecution(workflowId: string, task: Task): WorkflowExecution {
    return {
      workflowId,
      originalTask: task,
      startTime: new Date(),
      currentStage: 'planning',
      stageResults: []
    };
  }

  private findAgentByType(type: string): IAgent | undefined {
    return Array.from(this.registeredAgents.values()).find(agent => agent.type === type);
  }

  private async calculateCoordinationMetrics(
    stages: StageResult[],
    execution: WorkflowExecution
  ): Promise<CoordinationMetrics> {
    const successfulStages = stages.filter(s => s.status === 'success').length;
    const totalStages = stages.length;

    return {
      agent_utilization: this.calculateAgentUtilization(stages),
      communication_efficiency: 0.85, // Simplified calculation
      decision_accuracy: successfulStages / totalStages,
      workflow_efficiency: 0.80, // Simplified calculation
      quality_score: 0.85 // Simplified calculation
    };
  }

  private calculateAgentUtilization(stages: StageResult[]): Record<string, number> {
    const utilization: Record<string, number> = {};
    
    for (const stage of stages) {
      if (!utilization[stage.agent_id]) {
        utilization[stage.agent_id] = 0;
      }
      utilization[stage.agent_id] = (utilization[stage.agent_id] || 0) + stage.execution_time;
    }

    return utilization;
  }

  private getEmptyMetrics(): CoordinationMetrics {
    return {
      agent_utilization: {},
      communication_efficiency: 0,
      decision_accuracy: 0,
      workflow_efficiency: 0,
      quality_score: 0
    };
  }

  private async handleAgentEvent(event: CoordinationEvent): Promise<void> {
    // Handle events from registered agents
    console.log(`📡 Received event: ${event.type} from ${event.source}`);
  }

  private async cancelWorkflow(workflowId: string): Promise<void> {
    const execution = this.activeWorkflows.get(workflowId);
    if (execution) {
      console.log(`❌ Cancelling workflow: ${workflowId}`);
      this.activeWorkflows.delete(workflowId);
    }
  }

  private async initializeCoordinationSystems(): Promise<void> {
    // Simulate coordination system initialization
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async saveWorkflowHistory(): Promise<void> {
    console.log(`Saved ${this.workflowHistory.length} workflows to history`);
  }

  // ============================================================================
  // Communication Handlers
  // ============================================================================

  private async handleDecisionRequest(message: AgentMessage): Promise<unknown> {
    return {
      agent_perspective: 'coordination',
      recommendation: 'Optimize for overall workflow efficiency',
      confidence: 0.9,
      reasoning: 'Based on coordination experience and workflow optimization'
    };
  }

  private async handleCoordinationRequest(message: AgentMessage): Promise<unknown> {
    return {
      status: 'coordination_available',
      available_agents: this.registeredAgents.size,
      active_workflows: this.activeWorkflows.size,
      estimated_response_time: '2 minutes'
    };
  }

  private async handleStatusUpdate(message: AgentMessage): Promise<unknown> {
    return {
      status: 'status_received',
      coordinator_status: this.status,
      timestamp: new Date()
    };
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  public getWorkflowHistory(): readonly WorkflowResult[] {
    return [...this.workflowHistory];
  }

  public getActiveWorkflows(): string[] {
    return Array.from(this.activeWorkflows.keys());
  }

  public getCoordinationStrategy(): CoordinationStrategy {
    return this.coordinationStrategy;
  }
}

// ============================================================================
// Supporting Interfaces
// ============================================================================

interface WorkflowExecution {
  readonly workflowId: string;
  readonly originalTask: Task;
  readonly startTime: Date;
  currentStage: string;
  stageResults: StageResult[];
}
