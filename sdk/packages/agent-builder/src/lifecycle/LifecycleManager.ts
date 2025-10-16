/**
 * @fileoverview Lifecycle Manager for managing multiple agents - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { IAgent, AgentStatus } from '../types';
import { AgentLifecycleError } from '../types/errors';

/**
 * Lifecycle events for the manager
 */
export interface LifecycleManagerEvents {
  'agent-added': (agent: IAgent) => void;
  'agent-removed': (agentId: string) => void;
  'agent-started': (agent: IAgent) => void;
  'agent-stopped': (agent: IAgent) => void;
  'agent-error': (agent: IAgent, error: Error) => void;
  'all-agents-started': () => void;
  'all-agents-stopped': () => void;
}

/**
 * Agent lifecycle statistics
 */
export interface LifecycleStats {
  totalAgents: number;
  runningAgents: number;
  stoppedAgents: number;
  errorAgents: number;
  totalStartTime?: Date | undefined;
  totalUptime?: number | undefined;
  totalErrors: number;
  totalMessages: number;
}

/**
 * Manager for handling multiple agent lifecycles - 基于MPLP V1.0 Alpha事件架构
 */
export class LifecycleManager {
  private eventManager: MPLPEventManager;
  private readonly agents: Map<string, IAgent> = new Map();
  private readonly agentStartTimes: Map<string, Date> = new Map();
  private _destroyed: boolean = false;

  constructor() {
    this.eventManager = new MPLPEventManager();
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Add an agent to the lifecycle manager
   */
  public addAgent(agent: IAgent): void {
    if (this._destroyed) {
      throw new AgentLifecycleError('Cannot add agent to destroyed lifecycle manager');
    }

    if (this.agents.has(agent.id)) {
      throw new AgentLifecycleError(`Agent with ID '${agent.id}' is already managed`);
    }

    // Set up event listeners for the agent
    agent.on('started', () => {
      this.agentStartTimes.set(agent.id, new Date());
      this.emit('agent-started', agent);
      
      // Check if all agents are now running
      if (this._areAllAgentsRunning()) {
        this.emit('all-agents-started');
      }
    });

    agent.on('stopped', () => {
      this.agentStartTimes.delete(agent.id);
      this.emit('agent-stopped', agent);
      
      // Check if all agents are now stopped
      if (this._areAllAgentsStopped()) {
        this.emit('all-agents-stopped');
      }
    });

    agent.on('error', (error: Error) => {
      this.emit('agent-error', agent, error);
    });

    this.agents.set(agent.id, agent);
    this.emit('agent-added', agent);
  }

  /**
   * Remove an agent from the lifecycle manager
   */
  public async removeAgent(agentId: string): Promise<boolean> {
    if (this._destroyed) {
      throw new AgentLifecycleError('Cannot remove agent from destroyed lifecycle manager');
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Stop the agent if it's running
    if (agent.status === AgentStatus.RUNNING) {
      await agent.stop();
    }

    // Remove event listeners
    agent.removeAllListeners();
    
    // Remove from maps
    this.agents.delete(agentId);
    this.agentStartTimes.delete(agentId);
    
    this.emit('agent-removed', agentId);
    return true;
  }

  /**
   * Get an agent by ID
   */
  public getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all managed agents
   */
  public getAllAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by status
   */
  public getAgentsByStatus(status: AgentStatus): IAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === status);
  }

  /**
   * Start all agents
   */
  public async startAll(): Promise<void> {
    if (this._destroyed) {
      throw new AgentLifecycleError('Cannot start agents from destroyed lifecycle manager');
    }

    const agents = Array.from(this.agents.values());
    const errors: Error[] = [];

    // Start all agents in parallel
    const startPromises = agents.map(async (agent) => {
      try {
        if (agent.status !== AgentStatus.RUNNING) {
          await agent.start();
        }
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    });

    await Promise.all(startPromises);

    if (errors.length > 0) {
      throw new AgentLifecycleError(
        `Failed to start ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`
      );
    }
  }

  /**
   * Stop all agents
   */
  public async stopAll(): Promise<void> {
    if (this._destroyed) {
      return; // Already destroyed
    }

    const agents = Array.from(this.agents.values());
    const errors: Error[] = [];

    // Stop all agents in parallel
    const stopPromises = agents.map(async (agent) => {
      try {
        if (agent.status === AgentStatus.RUNNING) {
          await agent.stop();
        }
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    });

    await Promise.all(stopPromises);

    if (errors.length > 0) {
      throw new AgentLifecycleError(
        `Failed to stop ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`
      );
    }
  }

  /**
   * Restart all agents
   */
  public async restartAll(): Promise<void> {
    await this.stopAll();
    await this.startAll();
  }

  /**
   * Get lifecycle statistics
   */
  public getStats(): LifecycleStats {
    const agents = Array.from(this.agents.values());
    const runningAgents = agents.filter(a => a.status === AgentStatus.RUNNING);
    const stoppedAgents = agents.filter(a => a.status === AgentStatus.STOPPED || a.status === AgentStatus.IDLE);
    const errorAgents = agents.filter(a => a.status === AgentStatus.ERROR);

    let totalErrors = 0;
    let totalMessages = 0;
    let earliestStartTime: Date | undefined;

    for (const agent of agents) {
      const status = agent.getStatus();
      totalErrors += status.errorCount;
      totalMessages += status.messageCount;

      if (status.startTime && (!earliestStartTime || status.startTime < earliestStartTime)) {
        earliestStartTime = status.startTime;
      }
    }

    return {
      totalAgents: agents.length,
      runningAgents: runningAgents.length,
      stoppedAgents: stoppedAgents.length,
      errorAgents: errorAgents.length,
      totalStartTime: earliestStartTime,
      totalUptime: earliestStartTime ? Date.now() - earliestStartTime.getTime() : undefined,
      totalErrors,
      totalMessages
    };
  }

  /**
   * Check if all agents are running
   */
  public areAllAgentsRunning(): boolean {
    return this._areAllAgentsRunning();
  }

  /**
   * Check if all agents are stopped
   */
  public areAllAgentsStopped(): boolean {
    return this._areAllAgentsStopped();
  }

  /**
   * Get the number of managed agents
   */
  public size(): number {
    return this.agents.size;
  }

  /**
   * Check if manager has any agents
   */
  public isEmpty(): boolean {
    return this.agents.size === 0;
  }

  /**
   * Destroy the lifecycle manager and all managed agents
   */
  public async destroy(): Promise<void> {
    if (this._destroyed) {
      return; // Already destroyed
    }

    const agents = Array.from(this.agents.values());
    const errors: Error[] = [];

    // Destroy all agents
    const destroyPromises = agents.map(async (agent) => {
      try {
        await agent.destroy();
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    });

    await Promise.all(destroyPromises);

    // Clear all maps
    this.agents.clear();
    this.agentStartTimes.clear();

    // Remove all listeners
    this.removeAllListeners();

    this._destroyed = true;

    if (errors.length > 0) {
      throw new AgentLifecycleError(
        `Failed to destroy ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`
      );
    }
  }

  /**
   * Check if manager is destroyed
   */
  public isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Private method to check if all agents are running
   */
  private _areAllAgentsRunning(): boolean {
    if (this.agents.size === 0) {
      return false;
    }
    return Array.from(this.agents.values()).every(agent => agent.status === AgentStatus.RUNNING);
  }

  /**
   * Private method to check if all agents are stopped
   */
  private _areAllAgentsStopped(): boolean {
    if (this.agents.size === 0) {
      return true;
    }
    return Array.from(this.agents.values()).every(agent => 
      agent.status === AgentStatus.STOPPED || agent.status === AgentStatus.IDLE
    );
  }
}
