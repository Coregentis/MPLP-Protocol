/**
 * Type definitions for {{name}}
 */

/**
 * Agent capability result
 */
export interface AgentCapabilityResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

/**
 * Agent status
 */
export interface AgentStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastActivity: Date;
  capabilities: string[];
  metrics?: AgentMetrics;
}

/**
 * Agent metrics
 */
export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
}

/**
 * Application status
 */
export interface ApplicationStatus {
  name: string;
  version: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  uptime: number;
  agents: AgentStatus[];
  environment: string;
}

/**
 * Message interface for agent communication
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  capabilities: string[];
  maxConcurrentRequests?: number;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Application event
 */
export interface ApplicationEvent {
  type: string;
  source: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}

/**
 * Error types
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly agentName: string,
    public readonly capability?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, public readonly configPath?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ApplicationError extends Error {
  constructor(message: string, public readonly component?: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}
