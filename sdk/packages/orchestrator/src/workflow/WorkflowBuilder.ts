/**
 * @fileoverview Workflow Builder implementation
 * Provides fluent API for building complex multi-agent workflows
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IWorkflowBuilder,
  WorkflowDefinition,
  AnyStepConfig,
  AgentStepConfig,
  ParallelStepConfig,
  SequentialStepConfig,
  ConditionalStepConfig,
  LoopStepConfig,
  WorkflowDefinitionError
} from '../types';

/**
 * Fluent workflow builder implementation
 */
export class WorkflowBuilder implements IWorkflowBuilder {
  private readonly _id: string;
  private _name: string;
  private _description?: string;
  private _version?: string;
  private _steps: AnyStepConfig[] = [];
  private _timeout?: number;
  private _retries?: number;
  private _metadata?: Record<string, unknown>;

  constructor(name: string, id?: string) {
    this._id = id ?? uuidv4();
    this._name = name;
  }

  /**
   * Create a new workflow builder
   */
  public static create(name: string, id?: string): WorkflowBuilder {
    return new WorkflowBuilder(name, id);
  }

  /**
   * Set workflow description
   */
  public description(description: string): WorkflowBuilder {
    this._description = description;
    return this;
  }

  /**
   * Set workflow version
   */
  public version(version: string): WorkflowBuilder {
    this._version = version;
    return this;
  }

  /**
   * Add an agent step
   */
  public step(id: string, config: Omit<AgentStepConfig, 'id' | 'type'>): WorkflowBuilder {
    this.validateStepId(id);
    
    const stepConfig: AgentStepConfig = {
      ...config,
      id,
      type: 'agent'
    };

    this.validateAgentStepConfig(stepConfig);
    this._steps.push(stepConfig);
    return this;
  }

  /**
   * Add a parallel execution step
   */
  public parallel(id: string, config: Omit<ParallelStepConfig, 'id' | 'type'>): WorkflowBuilder {
    this.validateStepId(id);
    
    const stepConfig: ParallelStepConfig = {
      ...config,
      id,
      type: 'parallel'
    };

    this.validateParallelStepConfig(stepConfig);
    this._steps.push(stepConfig);
    return this;
  }

  /**
   * Add a sequential execution step
   */
  public sequential(id: string, config: Omit<SequentialStepConfig, 'id' | 'type'>): WorkflowBuilder {
    this.validateStepId(id);
    
    const stepConfig: SequentialStepConfig = {
      ...config,
      id,
      type: 'sequential'
    };

    this.validateSequentialStepConfig(stepConfig);
    this._steps.push(stepConfig);
    return this;
  }

  /**
   * Add a conditional step
   */
  public condition(id: string, config: Omit<ConditionalStepConfig, 'id' | 'type'>): WorkflowBuilder {
    this.validateStepId(id);
    
    const stepConfig: ConditionalStepConfig = {
      ...config,
      id,
      type: 'conditional'
    };

    this.validateConditionalStepConfig(stepConfig);
    this._steps.push(stepConfig);
    return this;
  }

  /**
   * Add a loop step
   */
  public loop(id: string, config: Omit<LoopStepConfig, 'id' | 'type'>): WorkflowBuilder {
    this.validateStepId(id);
    
    const stepConfig: LoopStepConfig = {
      ...config,
      id,
      type: 'loop'
    };

    this.validateLoopStepConfig(stepConfig);
    this._steps.push(stepConfig);
    return this;
  }

  /**
   * Set workflow timeout
   */
  public timeout(timeout: number): WorkflowBuilder {
    if (timeout <= 0) {
      throw new WorkflowDefinitionError('Timeout must be positive');
    }
    this._timeout = timeout;
    return this;
  }

  /**
   * Set workflow retries
   */
  public retries(retries: number): WorkflowBuilder {
    if (retries < 0) {
      throw new WorkflowDefinitionError('Retries must be non-negative');
    }
    this._retries = retries;
    return this;
  }

  /**
   * Set workflow metadata
   */
  public metadata(metadata: Record<string, unknown>): WorkflowBuilder {
    this._metadata = { ...this._metadata, ...metadata };
    return this;
  }

  /**
   * Build the workflow definition
   */
  public build(): WorkflowDefinition {
    this.validateWorkflow();

    return {
      id: this._id,
      name: this._name,
      description: this._description || undefined,
      version: this._version || undefined,
      steps: [...this._steps],
      timeout: this._timeout || undefined,
      retries: this._retries || undefined,
      metadata: this._metadata ? { ...this._metadata } : undefined
    };
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  private validateStepId(id: string): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new WorkflowDefinitionError('Step ID must be a non-empty string');
    }

    if (this._steps.some(step => step.id === id)) {
      throw new WorkflowDefinitionError(`Step ID '${id}' already exists`);
    }
  }

  private validateAgentStepConfig(config: AgentStepConfig): void {
    if (!config.agentId || typeof config.agentId !== 'string') {
      throw new WorkflowDefinitionError('Agent step must have a valid agentId');
    }

    if (!config.action || typeof config.action !== 'string') {
      throw new WorkflowDefinitionError('Agent step must have a valid action');
    }

    this.validateCommonStepConfig(config);
  }

  private validateParallelStepConfig(config: ParallelStepConfig): void {
    if (!Array.isArray(config.steps) || config.steps.length === 0) {
      throw new WorkflowDefinitionError('Parallel step must have at least one sub-step');
    }

    if (config.concurrency !== undefined && config.concurrency <= 0) {
      throw new WorkflowDefinitionError('Parallel step concurrency must be positive');
    }

    this.validateCommonStepConfig(config);
  }

  private validateSequentialStepConfig(config: SequentialStepConfig): void {
    if (!Array.isArray(config.steps) || config.steps.length === 0) {
      throw new WorkflowDefinitionError('Sequential step must have at least one sub-step');
    }

    this.validateCommonStepConfig(config);
  }

  private validateConditionalStepConfig(config: ConditionalStepConfig): void {
    if (!config.condition || typeof config.condition.predicate !== 'function') {
      throw new WorkflowDefinitionError('Conditional step must have a valid condition');
    }

    if (!config.thenStep) {
      throw new WorkflowDefinitionError('Conditional step must have a thenStep');
    }

    this.validateCommonStepConfig(config);
  }

  private validateLoopStepConfig(config: LoopStepConfig): void {
    if (!config.condition || typeof config.condition.predicate !== 'function') {
      throw new WorkflowDefinitionError('Loop step must have a valid condition');
    }

    if (!config.body) {
      throw new WorkflowDefinitionError('Loop step must have a body');
    }

    if (config.maxIterations !== undefined && config.maxIterations <= 0) {
      throw new WorkflowDefinitionError('Loop step maxIterations must be positive');
    }

    this.validateCommonStepConfig(config);
  }

  private validateCommonStepConfig(config: AnyStepConfig): void {
    if (!config.name || typeof config.name !== 'string') {
      throw new WorkflowDefinitionError('Step must have a valid name');
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new WorkflowDefinitionError('Step timeout must be positive');
    }

    if (config.retries !== undefined && config.retries < 0) {
      throw new WorkflowDefinitionError('Step retries must be non-negative');
    }

    if (config.dependencies) {
      if (!Array.isArray(config.dependencies)) {
        throw new WorkflowDefinitionError('Step dependencies must be an array');
      }

      for (const dep of config.dependencies) {
        if (typeof dep !== 'string') {
          throw new WorkflowDefinitionError('Step dependency must be a string');
        }
      }
    }
  }

  private validateWorkflow(): void {
    if (!this._name || typeof this._name !== 'string' || this._name.trim().length === 0) {
      throw new WorkflowDefinitionError('Workflow must have a valid name');
    }

    if (this._steps.length === 0) {
      throw new WorkflowDefinitionError('Workflow must have at least one step');
    }

    // Validate step dependencies
    this.validateStepDependencies();

    // Validate no circular dependencies
    this.validateNoCycles();
  }

  private validateStepDependencies(): void {
    const stepIds = new Set(this._steps.map(step => step.id));

    for (const step of this._steps) {
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

  private validateNoCycles(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true;
      }

      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = this._steps.find(s => s.id === stepId);
      if (step?.dependencies) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of this._steps) {
      if (hasCycle(step.id)) {
        throw new WorkflowDefinitionError('Workflow contains circular dependencies');
      }
    }
  }
}
