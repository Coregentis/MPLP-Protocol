"use strict";
/**
 * @fileoverview Error type definitions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSendError = exports.PlatformConnectionError = exports.AgentStateError = exports.AgentBuildError = exports.PlatformAdapterRegistrationError = exports.PlatformAdapterNotFoundError = exports.PlatformAdapterError = exports.AgentLifecycleError = exports.AgentConfigurationError = exports.AgentBuilderError = void 0;
exports.isAgentBuilderError = isAgentBuilderError;
exports.isAgentConfigurationError = isAgentConfigurationError;
exports.isPlatformAdapterError = isPlatformAdapterError;
exports.isAgentLifecycleError = isAgentLifecycleError;
/**
 * Base error class for all agent builder errors
 */
class AgentBuilderError extends Error {
    constructor(message, code = 'AGENT_BUILDER_ERROR', context) {
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
exports.AgentBuilderError = AgentBuilderError;
/**
 * Error thrown when agent configuration is invalid
 */
class AgentConfigurationError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'AGENT_CONFIGURATION_ERROR', context);
        this.name = 'AgentConfigurationError';
    }
}
exports.AgentConfigurationError = AgentConfigurationError;
/**
 * Error thrown when agent lifecycle operations fail
 */
class AgentLifecycleError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'AGENT_LIFECYCLE_ERROR', context);
        this.name = 'AgentLifecycleError';
    }
}
exports.AgentLifecycleError = AgentLifecycleError;
/**
 * Error thrown when platform adapter operations fail
 */
class PlatformAdapterError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'PLATFORM_ADAPTER_ERROR', context);
        this.name = 'PlatformAdapterError';
    }
}
exports.PlatformAdapterError = PlatformAdapterError;
/**
 * Error thrown when platform adapter is not found
 */
class PlatformAdapterNotFoundError extends PlatformAdapterError {
    constructor(platformName) {
        super(`Platform adapter '${platformName}' not found. Please register the adapter first.`, { platformName });
        this.name = 'PlatformAdapterNotFoundError';
    }
}
exports.PlatformAdapterNotFoundError = PlatformAdapterNotFoundError;
/**
 * Error thrown when platform adapter registration fails
 */
class PlatformAdapterRegistrationError extends PlatformAdapterError {
    constructor(message, context) {
        super(message, context);
        this.name = 'PlatformAdapterRegistrationError';
    }
}
exports.PlatformAdapterRegistrationError = PlatformAdapterRegistrationError;
/**
 * Error thrown when agent building fails
 */
class AgentBuildError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'AGENT_BUILD_ERROR', context);
        this.name = 'AgentBuildError';
    }
}
exports.AgentBuildError = AgentBuildError;
/**
 * Error thrown when agent is in invalid state for operation
 */
class AgentStateError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'AGENT_STATE_ERROR', context);
        this.name = 'AgentStateError';
    }
}
exports.AgentStateError = AgentStateError;
/**
 * Error thrown when platform connection fails
 */
class PlatformConnectionError extends PlatformAdapterError {
    constructor(message, context) {
        super(message, context);
        this.name = 'PlatformConnectionError';
    }
}
exports.PlatformConnectionError = PlatformConnectionError;
/**
 * Error thrown when message sending fails
 */
class MessageSendError extends AgentBuilderError {
    constructor(message, context) {
        super(message, 'MESSAGE_SEND_ERROR', context);
        this.name = 'MessageSendError';
    }
}
exports.MessageSendError = MessageSendError;
/**
 * Type guard to check if error is an AgentBuilderError
 */
function isAgentBuilderError(error) {
    return error instanceof AgentBuilderError;
}
/**
 * Type guard to check if error is an AgentConfigurationError
 */
function isAgentConfigurationError(error) {
    return error instanceof AgentConfigurationError;
}
/**
 * Type guard to check if error is a PlatformAdapterError
 */
function isPlatformAdapterError(error) {
    return error instanceof PlatformAdapterError;
}
/**
 * Type guard to check if error is an AgentLifecycleError
 */
function isAgentLifecycleError(error) {
    return error instanceof AgentLifecycleError;
}
//# sourceMappingURL=errors.js.map