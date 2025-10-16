/**
 * @fileoverview Workflow Execution Engine
 * Handles the execution of workflow steps with parallel processing and error handling
 */

import { MPLPEventManager } from '../utils/EventEmitter';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowResult,
  WorkflowStatus,
  StepResult,
  StepStatus,
  AnyStepConfig,
  AgentStepConfig,
  ParallelStepConfig,
  SequentialStepConfig,
  ConditionalStepConfig,
  LoopStepConfig,
  ExecutionOptions,
  WorkflowProgress,
  WorkflowExecutionError,
  StepExecutionError
} from '../types';
import { IAgent } from '../types';

/**
 * Workflow execution engine - 基于MPLP V1.0 Alpha架构
 */
export class ExecutionEngine extends MPLPEventManager {
  private readonly agents = new Map<string, IAgent>();
  private readonly executions = new Map<string, WorkflowResult>();
  private readonly contexts = new Map<string, WorkflowContext>();

  /**
   * Register an agent for workflow execution
   */
  public registerAgent(agent: IAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Unregister an agent
   */
  public unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Get registered agent
   */
  public getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Execute a workflow
   */
  public async executeWorkflow(
    workflow: WorkflowDefinition,
    parameters: Record<string, unknown> = {},
    options: ExecutionOptions = {}
  ): Promise<WorkflowResult> {
    const executionId = uuidv4();
    const startTime = new Date();

    // Create execution context
    const context: WorkflowContext = {
      workflowId: workflow.id,
      executionId,
      startTime,
      variables: new Map(Object.entries(parameters)),
      results: new Map(),
      metadata: { ...workflow.metadata, ...options.metadata }
    };

    // Initialize workflow result
    const result: WorkflowResult = {
      workflowId: workflow.id,
      executionId,
      status: WorkflowStatus.RUNNING,
      startTime,
      steps: [],
      metadata: context.metadata
    };

    this.contexts.set(executionId, context);
    this.executions.set(executionId, result);

    try {
      // Execute workflow steps
      await this.executeSteps(workflow.steps, context, options);

      // Update final result
      result.status = WorkflowStatus.COMPLETED;
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
      result.steps = Array.from(context.results.values());

      this.emit('workflowCompleted', result);
      return result;

    } catch (error) {
      // Handle execution error
      result.status = WorkflowStatus.FAILED;
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
      result.error = error as Error;
      result.steps = Array.from(context.results.values());

      this.emit('workflowFailed', result, error);
      throw error;

    } finally {
      this.contexts.delete(executionId);
    }
  }

  /**
   * Get execution result
   */
  public getExecution(executionId: string): WorkflowResult | undefined {
    return this.executions.get(executionId);
  }

  /**
   * List all executions
   */
  public listExecutions(): WorkflowResult[] {
    return Array.from(this.executions.values());
  }

  // ============================================================================
  // Step Execution Methods
  // ============================================================================

  private async executeSteps(
    steps: AnyStepConfig[],
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<void> {
    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(steps);
    const executed = new Set<string>();
    const executing = new Set<string>();

    // Execute steps in dependency order
    const executeStep = async (stepId: string): Promise<void> => {
      if (executed.has(stepId) || executing.has(stepId)) {
        return;
      }

      const step = steps.find(s => s.id === stepId);
      if (!step) {
        throw new WorkflowExecutionError(`Step not found: ${stepId}`);
      }

      // Wait for dependencies
      if (step.dependencies) {
        await Promise.all(step.dependencies.map(dep => executeStep(dep)));
      }

      executing.add(stepId);

      try {
        await this.executeSingleStep(step, context, options);
        executed.add(stepId);
      } finally {
        executing.delete(stepId);
      }
    };

    // Execute all steps
    await Promise.all(steps.map(step => executeStep(step.id)));
  }

  private async executeSingleStep(
    step: AnyStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<void> {
    const startTime = new Date();
    
    // Create step result
    const stepResult: StepResult = {
      stepId: step.id,
      status: StepStatus.RUNNING,
      startTime,
      metadata: step.metadata || undefined
    };

    context.results.set(step.id, stepResult);
    this.emitProgress(context);

    try {
      // Check step condition
      if (step.condition && !(await step.condition.predicate(context))) {
        stepResult.status = StepStatus.SKIPPED;
        stepResult.endTime = new Date();
        stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
        return;
      }

      // Execute step based on type
      let result: unknown;
      switch (step.type) {
        case 'agent':
          result = await this.executeAgentStep(step, context, options);
          break;
        case 'parallel':
          result = await this.executeParallelStep(step, context, options);
          break;
        case 'sequential':
          result = await this.executeSequentialStep(step, context, options);
          break;
        case 'conditional':
          result = await this.executeConditionalStep(step, context, options);
          break;
        case 'loop':
          result = await this.executeLoopStep(step, context, options);
          break;
        default:
          throw new StepExecutionError(`Unknown step type: ${(step as any).type}`);
      }

      // Update step result
      stepResult.status = StepStatus.COMPLETED;
      stepResult.endTime = new Date();
      stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
      stepResult.result = result;

      this.emit('stepCompleted', stepResult);

    } catch (error) {
      // Handle step error
      stepResult.status = StepStatus.FAILED;
      stepResult.endTime = new Date();
      stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
      stepResult.error = error as Error;

      this.emit('stepFailed', stepResult, error);

      // Retry logic
      const retries = step.retries ?? options.retries ?? 0;
      if (retries > 0) {
        // TODO: Implement retry logic
      }

      throw error;
    }
  }

  private async executeAgentStep(
    step: AgentStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<unknown> {
    const agent = this.agents.get(step.agentId);
    if (!agent) {
      throw new StepExecutionError(`Agent not found: ${step.agentId}`);
    }

    // Execute agent action
    const parameters = { ...step.parameters };
    
    // Add context variables to parameters
    context.variables.forEach((value, key) => {
      parameters[`context_${key}`] = value;
    });

    // 基于MPLP V1.0 Alpha Agent接口的真实实现
    try {
      // 检查Agent是否有sendMessage方法 (MPLP V1.0 Alpha标准接口)
      if (typeof (agent as any).sendMessage === 'function') {
        const message = {
          action: step.action,
          parameters,
          context: Object.fromEntries(context.variables),
          timestamp: new Date().toISOString()
        };

        await (agent as any).sendMessage(message);

        return {
          agentId: step.agentId,
          action: step.action,
          parameters,
          success: true,
          timestamp: new Date().toISOString()
        };
      }

      // 检查Agent是否有execute方法
      if (typeof (agent as any).execute === 'function') {
        const result = await (agent as any).execute(step.action, parameters);

        return {
          agentId: step.agentId,
          action: step.action,
          parameters,
          result,
          success: true,
          timestamp: new Date().toISOString()
        };
      }

      // 如果Agent没有标准执行方法，抛出错误
      throw new StepExecutionError(
        `Agent ${step.agentId} does not implement required execution interface (sendMessage or execute method)`
      );

    } catch (error) {
      throw new StepExecutionError(
        `Failed to execute agent step: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async executeParallelStep(
    step: ParallelStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<unknown[]> {
    const concurrency = step.concurrency ?? options.concurrency ?? step.steps.length;
    const results: unknown[] = [];

    // Execute steps in parallel with concurrency limit
    const executeWithConcurrency = async (steps: AnyStepConfig[]): Promise<unknown[]> => {
      const executing: Promise<unknown>[] = [];
      const stepResults: unknown[] = [];

      for (let i = 0; i < steps.length; i++) {
        const currentStep = steps[i];
        if (currentStep) {
          const stepPromise = this.executeSingleStep(currentStep, context, options);
          executing.push(stepPromise);

          if (executing.length >= concurrency || i === steps.length - 1) {
            const batchResults = await Promise.all(executing);
            stepResults.push(...batchResults);
            executing.length = 0;
          }
        }
      }

      return stepResults;
    };

    if (step.failFast) {
      // Fail fast: stop on first error
      return await executeWithConcurrency(step.steps as AnyStepConfig[]);
    } else {
      // Continue on error: collect all results
      const promises = step.steps.map(async (subStep) => {
        try {
          await this.executeSingleStep(subStep as AnyStepConfig, context, options);
          return { success: true, stepId: subStep.id };
        } catch (error) {
          return { success: false, stepId: subStep.id, error };
        }
      });

      return await Promise.all(promises);
    }
  }

  private async executeSequentialStep(
    step: SequentialStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<unknown[]> {
    const results: unknown[] = [];

    for (const subStep of step.steps) {
      const result = await this.executeSingleStep(subStep as AnyStepConfig, context, options);
      results.push(result);
    }

    return results;
  }

  private async executeConditionalStep(
    step: ConditionalStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<unknown> {
    const conditionResult = await step.condition.predicate(context);

    if (conditionResult) {
      return await this.executeSingleStep(step.thenStep as AnyStepConfig, context, options);
    } else if (step.elseStep) {
      return await this.executeSingleStep(step.elseStep as AnyStepConfig, context, options);
    }

    return null;
  }

  private async executeLoopStep(
    step: LoopStepConfig,
    context: WorkflowContext,
    options: ExecutionOptions
  ): Promise<unknown[]> {
    const results: unknown[] = [];
    const maxIterations = step.maxIterations ?? 1000;
    let iteration = 0;

    while (iteration < maxIterations && await step.condition.predicate(context)) {
      const result = await this.executeSingleStep(step.body as AnyStepConfig, context, options);
      results.push(result);
      iteration++;
    }

    return results;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private buildDependencyGraph(steps: AnyStepConfig[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.id, step.dependencies ?? []);
    }

    return graph;
  }

  private emitProgress(context: WorkflowContext): void {
    const totalSteps = context.results.size;
    const completedSteps = Array.from(context.results.values())
      .filter(r => r.status === StepStatus.COMPLETED).length;
    const failedSteps = Array.from(context.results.values())
      .filter(r => r.status === StepStatus.FAILED).length;
    const skippedSteps = Array.from(context.results.values())
      .filter(r => r.status === StepStatus.SKIPPED).length;

    const progress: WorkflowProgress = {
      workflowId: context.workflowId,
      executionId: context.executionId,
      totalSteps,
      completedSteps,
      failedSteps,
      skippedSteps,
      progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    };

    this.emit('progress', progress);
  }
}
