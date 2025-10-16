/**
 * AI Coordination Example - Base Agent Implementation
 * Abstract base class for all AI agents in the coordination system
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  IAgent,
  AgentType,
  AgentCapability,
  AgentStatus,
  Task,
  TaskResult,
  AgentMessage,
  AgentResponse,
  CoordinationEvent,
  AgentError
} from '../types';

export interface BaseAgentConfig {
  readonly name: string;
  readonly type: AgentType;
  readonly capabilities: AgentCapability[];
  readonly max_concurrent_tasks?: number;
  readonly timeout?: number;
  readonly retry_attempts?: number;
}

export abstract class BaseAgent extends EventEmitter implements IAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType;
  public readonly capabilities: AgentCapability[];
  
  protected _status: AgentStatus = 'initializing';
  protected readonly maxConcurrentTasks: number;
  protected readonly timeout: number;
  protected readonly retryAttempts: number;
  protected readonly activeTasks = new Map<string, Task>();
  protected readonly taskHistory: TaskResult[] = [];

  constructor(config: BaseAgentConfig) {
    super();
    
    this.id = uuidv4();
    this.name = config.name;
    this.type = config.type;
    this.capabilities = [...config.capabilities];
    this.maxConcurrentTasks = config.max_concurrent_tasks ?? 5;
    this.timeout = config.timeout ?? 30000;
    this.retryAttempts = config.retry_attempts ?? 3;
  }

  public get status(): AgentStatus {
    return this._status;
  }

  protected setStatus(status: AgentStatus): void {
    const previousStatus = this._status;
    this._status = status;
    
    this.emit('statusChanged', {
      agentId: this.id,
      previousStatus,
      currentStatus: status,
      timestamp: new Date()
    });
  }

  public async initialize(): Promise<void> {
    try {
      this.setStatus('initializing');
      
      // Perform agent-specific initialization
      await this.onInitialize();
      
      this.setStatus('ready');
      
      this.emitEvent('agent_registered', {
        agentId: this.id,
        name: this.name,
        type: this.type,
        capabilities: this.capabilities
      });
      
    } catch (error) {
      this.setStatus('error');
      throw new AgentError(
        `Failed to initialize agent ${this.name}`,
        this.id,
        'INITIALIZATION_FAILED',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  public async process(task: Task): Promise<TaskResult> {
    // Validate agent can handle this task
    if (!this.canHandleTask(task)) {
      throw new AgentError(
        `Agent ${this.name} cannot handle task type ${task.type}`,
        this.id,
        'TASK_NOT_SUPPORTED',
        { taskType: task.type, capabilities: this.capabilities }
      );
    }

    // Check concurrent task limit
    if (this.activeTasks.size >= this.maxConcurrentTasks) {
      throw new AgentError(
        `Agent ${this.name} has reached maximum concurrent tasks limit`,
        this.id,
        'MAX_TASKS_EXCEEDED',
        { maxTasks: this.maxConcurrentTasks, activeTasks: this.activeTasks.size }
      );
    }

    const startTime = Date.now();
    this.activeTasks.set(task.id, task);
    this.setStatus('busy');

    try {
      this.emitEvent('task_started', {
        agentId: this.id,
        taskId: task.id,
        taskType: task.type
      });

      // Execute the task with timeout
      const result = await this.executeWithTimeout(
        () => this.onProcessTask(task),
        this.timeout
      );

      const executionTime = Date.now() - startTime;
      
      const taskResult: TaskResult = {
        task_id: task.id,
        agent_id: this.id,
        status: 'success',
        output: result,
        execution_time: executionTime,
        quality_score: await this.assessQuality(result),
        metadata: {
          agent_name: this.name,
          agent_type: this.type,
          processing_time: executionTime
        }
      };

      this.taskHistory.push(taskResult);
      
      this.emitEvent('task_completed', {
        agentId: this.id,
        taskId: task.id,
        result: taskResult
      });

      return taskResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const taskResult: TaskResult = {
        task_id: task.id,
        agent_id: this.id,
        status: 'failure',
        execution_time: executionTime,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          agent_name: this.name,
          agent_type: this.type,
          processing_time: executionTime
        }
      };

      this.taskHistory.push(taskResult);
      
      this.emitEvent('task_completed', {
        agentId: this.id,
        taskId: task.id,
        result: taskResult
      });

      throw error;

    } finally {
      this.activeTasks.delete(task.id);
      
      if (this.activeTasks.size === 0) {
        this.setStatus('ready');
      }
    }
  }

  public async communicate(message: AgentMessage): Promise<AgentResponse> {
    try {
      const response = await this.onCommunicate(message);
      
      return {
        message_id: message.id,
        agent_id: this.id,
        content: response,
        timestamp: new Date(),
        status: 'success'
      };
      
    } catch (error) {
      return {
        message_id: message.id,
        agent_id: this.id,
        content: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        status: 'error'
      };
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.setStatus('shutdown');
      
      // Cancel all active tasks
      for (const [taskId] of this.activeTasks) {
        this.activeTasks.delete(taskId);
      }
      
      // Perform agent-specific cleanup
      await this.onShutdown();
      
      this.emitEvent('agent_unregistered', {
        agentId: this.id,
        name: this.name
      });
      
      this.removeAllListeners();
      
    } catch (error) {
      throw new AgentError(
        `Failed to shutdown agent ${this.name}`,
        this.id,
        'SHUTDOWN_FAILED',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  // ============================================================================
  // Abstract Methods (to be implemented by subclasses)
  // ============================================================================

  protected abstract onInitialize(): Promise<void>;
  protected abstract onProcessTask(task: Task): Promise<unknown>;
  protected abstract onCommunicate(message: AgentMessage): Promise<unknown>;
  protected abstract onShutdown(): Promise<void>;

  // ============================================================================
  // Protected Helper Methods
  // ============================================================================

  protected canHandleTask(task: Task): boolean {
    // Default implementation - can be overridden by subclasses
    return true;
  }

  protected async assessQuality(result: unknown): Promise<number> {
    // Default quality assessment - can be overridden by subclasses
    return result ? 0.8 : 0.0;
  }

  protected emitEvent(type: string, data: unknown): void {
    const event: CoordinationEvent = {
      type: type as any,
      source: this.id,
      data,
      timestamp: new Date()
    };
    
    this.emit('coordinationEvent', event);
  }

  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new AgentError(
          `Operation timed out after ${timeoutMs}ms`,
          this.id,
          'OPERATION_TIMEOUT'
        ));
      }, timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  // ============================================================================
  // Public Utility Methods
  // ============================================================================

  public getMetrics() {
    const totalTasks = this.taskHistory.length;
    const successfulTasks = this.taskHistory.filter(t => t.status === 'success').length;
    const averageExecutionTime = totalTasks > 0 
      ? this.taskHistory.reduce((sum, t) => sum + (t.execution_time ?? 0), 0) / totalTasks
      : 0;
    const averageQuality = totalTasks > 0
      ? this.taskHistory.reduce((sum, t) => sum + (t.quality_score ?? 0), 0) / totalTasks
      : 0;

    return {
      agentId: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      totalTasks,
      successfulTasks,
      failedTasks: totalTasks - successfulTasks,
      successRate: totalTasks > 0 ? successfulTasks / totalTasks : 0,
      averageExecutionTime,
      averageQuality,
      activeTasks: this.activeTasks.size,
      capabilities: this.capabilities
    };
  }

  public getTaskHistory(): readonly TaskResult[] {
    return [...this.taskHistory];
  }

  public getActiveTasks(): readonly Task[] {
    return Array.from(this.activeTasks.values());
  }
}
