"use strict";
/**
 * AI Coordination Example - Type Definitions
 * Comprehensive type system for multi-agent AI coordination
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionError = exports.AgentError = exports.CoordinationError = void 0;
// ============================================================================
// Error Types
// ============================================================================
class CoordinationError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'CoordinationError';
    }
}
exports.CoordinationError = CoordinationError;
class AgentError extends Error {
    constructor(message, agentId, code, details) {
        super(message);
        this.agentId = agentId;
        this.code = code;
        this.details = details;
        this.name = 'AgentError';
    }
}
exports.AgentError = AgentError;
class DecisionError extends Error {
    constructor(message, decisionId, code, details) {
        super(message);
        this.decisionId = decisionId;
        this.code = code;
        this.details = details;
        this.name = 'DecisionError';
    }
}
exports.DecisionError = DecisionError;
//# sourceMappingURL=index.js.map