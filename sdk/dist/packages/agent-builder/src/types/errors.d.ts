/**
 * @fileoverview Error type definitions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
/**
 * Base error class for all agent builder errors
 */
export declare class AgentBuilderError extends Error {
    readonly code: string;
    readonly timestamp: Date;
    readonly context?: Record<string, unknown> | undefined;
    constructor(message: string, code?: string, context?: Record<string, unknown> | undefined);
}
/**
 * Error thrown when agent configuration is invalid
 */
export declare class AgentConfigurationError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when agent lifecycle operations fail
 */
export declare class AgentLifecycleError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when platform adapter operations fail
 */
export declare class PlatformAdapterError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when platform adapter is not found
 */
export declare class PlatformAdapterNotFoundError extends PlatformAdapterError {
    constructor(platformName: string);
}
/**
 * Error thrown when platform adapter registration fails
 */
export declare class PlatformAdapterRegistrationError extends PlatformAdapterError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when agent building fails
 */
export declare class AgentBuildError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when agent is in invalid state for operation
 */
export declare class AgentStateError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when platform connection fails
 */
export declare class PlatformConnectionError extends PlatformAdapterError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error thrown when message sending fails
 */
export declare class MessageSendError extends AgentBuilderError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Type guard to check if error is an AgentBuilderError
 */
export declare function isAgentBuilderError(error: unknown): error is AgentBuilderError;
/**
 * Type guard to check if error is an AgentConfigurationError
 */
export declare function isAgentConfigurationError(error: unknown): error is AgentConfigurationError;
/**
 * Type guard to check if error is a PlatformAdapterError
 */
export declare function isPlatformAdapterError(error: unknown): error is PlatformAdapterError;
/**
 * Type guard to check if error is an AgentLifecycleError
 */
export declare function isAgentLifecycleError(error: unknown): error is AgentLifecycleError;
//# sourceMappingURL=errors.d.ts.map