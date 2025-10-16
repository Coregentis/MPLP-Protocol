/**
 * @fileoverview Error type definitions for MPLP Agent Builder
 * @version 1.1.0-beta
 */

/**
 * Base error class for all agent builder errors
 */
export class AgentBuilderError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string = 'AGENT_BUILDER_ERROR',
    context?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'AgentBuilderError';
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentBuilderError);
    }
  }
}

/**
 * Error thrown when agent configuration is invalid
 */
export class AgentConfigurationError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AGENT_CONFIGURATION_ERROR', context);
    this.name = 'AgentConfigurationError';
  }
}

/**
 * Error thrown when agent lifecycle operations fail
 */
export class AgentLifecycleError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AGENT_LIFECYCLE_ERROR', context);
    this.name = 'AgentLifecycleError';
  }
}

/**
 * Error thrown when platform adapter operations fail
 */
export class PlatformAdapterError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PLATFORM_ADAPTER_ERROR', context);
    this.name = 'PlatformAdapterError';
  }
}

/**
 * Error thrown when platform adapter is not found
 */
export class PlatformAdapterNotFoundError extends PlatformAdapterError {
  constructor(platformName: string) {
    super(
      `Platform adapter '${platformName}' not found. Please register the adapter first.`,
      { platformName }
    );
    this.name = 'PlatformAdapterNotFoundError';
  }
}

/**
 * Error thrown when platform adapter registration fails
 */
export class PlatformAdapterRegistrationError extends PlatformAdapterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = 'PlatformAdapterRegistrationError';
  }
}

/**
 * Error thrown when agent building fails
 */
export class AgentBuildError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AGENT_BUILD_ERROR', context);
    this.name = 'AgentBuildError';
  }
}

/**
 * Error thrown when agent is in invalid state for operation
 */
export class AgentStateError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AGENT_STATE_ERROR', context);
    this.name = 'AgentStateError';
  }
}

/**
 * Error thrown when platform connection fails
 */
export class PlatformConnectionError extends PlatformAdapterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = 'PlatformConnectionError';
  }
}

/**
 * Error thrown when message sending fails
 */
export class MessageSendError extends AgentBuilderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'MESSAGE_SEND_ERROR', context);
    this.name = 'MessageSendError';
  }
}

/**
 * Type guard to check if error is an AgentBuilderError
 */
export function isAgentBuilderError(error: unknown): error is AgentBuilderError {
  return error instanceof AgentBuilderError;
}

/**
 * Type guard to check if error is an AgentConfigurationError
 */
export function isAgentConfigurationError(error: unknown): error is AgentConfigurationError {
  return error instanceof AgentConfigurationError;
}

/**
 * Type guard to check if error is a PlatformAdapterError
 */
export function isPlatformAdapterError(error: unknown): error is PlatformAdapterError {
  return error instanceof PlatformAdapterError;
}

/**
 * Type guard to check if error is an AgentLifecycleError
 */
export function isAgentLifecycleError(error: unknown): error is AgentLifecycleError {
  return error instanceof AgentLifecycleError;
}
