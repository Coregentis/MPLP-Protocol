/**
 * Social Media Bot - Base Agent Implementation
 * Abstract base class for all social media automation agents
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
  TaskStatus,
  AgentMessage,
  TaskMetrics,
  ResourceUsage,
  SocialMediaError
} from '../types';

/**
 * Abstract base agent class for social media automation
 * Provides common functionality for all social media agents
 */
export abstract class BaseAgent extends EventEmitter implements IAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType;
  public readonly capabilities: AgentCapability[];
  
  protected _status: AgentStatus = AgentStatus.OFFLINE;
  protected _isInitialized = false;
  protected _activeTasks = new Map<string, Task>();
  protected _metrics: TaskMetrics[] = [];

  constructor(
    name: string,
    type: AgentType,
    capabilities: AgentCapability[]
  ) {
    super();
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
  }

  /**
   * Get current agent status
   */
  get status(): AgentStatus {
    return this._status;
  }

  /**
   * Check if agent is initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Get active tasks count
   */
  get activeTasksCount(): number {
    return this._activeTasks.size;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    try {
      this._status = AgentStatus.IDLE;
      await this.onInitialize();
      this._isInitialized = true;
      this.emit('initialized', { agentId: this.id, timestamp: new Date() });
    } catch (error) {
      this._status = AgentStatus.ERROR;
      this.emit('error', error);
      throw new SocialMediaError(
        `Failed to initialize agent ${this.name}`,
        'AGENT_INIT_ERROR',
        undefined,
        { agentId: this.id, error }
      );
    }
  }

  /**
   * Process a task
   */
  async process(task: Task): Promise<TaskResult> {
    if (!this._isInitialized) {
      throw new SocialMediaError(
        'Agent not initialized',
        'AGENT_NOT_INITIALIZED',
        undefined,
        { agentId: this.id }
      );
    }

    if (this._status === AgentStatus.ERROR) {
      throw new SocialMediaError(
        'Agent in error state',
        'AGENT_ERROR_STATE',
        undefined,
        { agentId: this.id }
      );
    }

    const startTime = Date.now();
    this._status = AgentStatus.BUSY;
    this._activeTasks.set(task.id, task);

    try {
      this.emit('taskStarted', { agentId: this.id, taskId: task.id, timestamp: new Date() });
      
      const result = await this.processTask(task);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const taskResult: TaskResult = {
        taskId: task.id,
        status: TaskStatus.COMPLETED,
        result: result,
        completedAt: new Date(),
        duration,
        metrics: this.calculateTaskMetrics(task, duration)
      };

      this._activeTasks.delete(task.id);
      this._status = this._activeTasks.size > 0 ? AgentStatus.BUSY : AgentStatus.IDLE;
      
      this.emit('taskCompleted', { 
        agentId: this.id, 
        taskId: task.id, 
        result: taskResult,
        timestamp: new Date() 
      });

      return taskResult;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const taskResult: TaskResult = {
        taskId: task.id,
        status: TaskStatus.FAILED,
        error: error as Error,
        completedAt: new Date(),
        duration,
        metrics: this.calculateTaskMetrics(task, duration)
      };

      this._activeTasks.delete(task.id);
      this._status = this._activeTasks.size > 0 ? AgentStatus.BUSY : AgentStatus.IDLE;
      
      this.emit('taskFailed', { 
        agentId: this.id, 
        taskId: task.id, 
        error,
        timestamp: new Date() 
      });

      throw error;
    }
  }

  /**
   * Handle inter-agent communication
   */
  async communicate(message: AgentMessage): Promise<void> {
    try {
      await this.handleMessage(message);
      this.emit('messageReceived', { 
        agentId: this.id, 
        messageId: message.id,
        from: message.from,
        timestamp: new Date() 
      });
    } catch (error) {
      this.emit('communicationError', { 
        agentId: this.id, 
        messageId: message.id,
        error,
        timestamp: new Date() 
      });
      throw error;
    }
  }

  /**
   * Shutdown the agent
   */
  async shutdown(): Promise<void> {
    try {
      // Wait for active tasks to complete or timeout
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (this._activeTasks.size > 0 && (Date.now() - startTime) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force cancel remaining tasks
      for (const [taskId] of this._activeTasks) {
        this.emit('taskCancelled', { 
          agentId: this.id, 
          taskId,
          reason: 'Agent shutdown',
          timestamp: new Date() 
        });
      }

      this._activeTasks.clear();
      await this.onShutdown();
      this._status = AgentStatus.OFFLINE;
      this._isInitialized = false;
      
      this.emit('shutdown', { agentId: this.id, timestamp: new Date() });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get agent performance metrics
   */
  getMetrics(): TaskMetrics[] {
    return [...this._metrics];
  }

  /**
   * Check if agent has specific capability
   */
  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Get agent health status
   */
  getHealthStatus(): { status: AgentStatus; activeTasksCount: number; isInitialized: boolean } {
    return {
      status: this._status,
      activeTasksCount: this._activeTasks.size,
      isInitialized: this._isInitialized
    };
  }

  // Abstract methods to be implemented by concrete agents

  /**
   * Agent-specific initialization logic
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Process a specific task
   */
  protected abstract processTask(task: Task): Promise<unknown>;

  /**
   * Handle incoming messages
   */
  protected abstract handleMessage(message: AgentMessage): Promise<void>;

  /**
   * Agent-specific shutdown logic
   */
  protected abstract onShutdown(): Promise<void>;

  // Helper methods

  /**
   * Calculate task execution metrics
   */
  private calculateTaskMetrics(task: Task, duration: number): TaskMetrics {
    const metrics: TaskMetrics = {
      processingTime: duration,
      resourceUsage: this.getResourceUsage(),
      qualityScore: this.calculateQualityScore(task),
      successRate: this.calculateSuccessRate()
    };

    this._metrics.push(metrics);
    
    // Keep only last 100 metrics
    if (this._metrics.length > 100) {
      this._metrics.shift();
    }

    return metrics;
  }

  /**
   * Get current resource usage
   */
  private getResourceUsage(): ResourceUsage {
    return {
      cpuTime: process.cpuUsage().user / 1000, // Convert to milliseconds
      memoryUsage: process.memoryUsage().heapUsed,
      networkRequests: 0, // To be implemented by concrete agents
      apiCalls: 0 // To be implemented by concrete agents
    };
  }

  /**
   * Calculate quality score for task execution
   */
  private calculateQualityScore(task: Task): number {
    // Base implementation - can be overridden by concrete agents
    return 1.0;
  }

  /**
   * Calculate success rate based on recent metrics
   */
  private calculateSuccessRate(): number {
    if (this._metrics.length === 0) return 1.0;
    
    const recentMetrics = this._metrics.slice(-10); // Last 10 tasks
    const successCount = recentMetrics.filter(m => !m.processingTime || m.processingTime > 0).length;
    return successCount / recentMetrics.length;
  }
}
