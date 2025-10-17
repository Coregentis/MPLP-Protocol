"use strict";
/**
 * @fileoverview Core type definitions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentStatus = void 0;
/**
 * Agent status enumeration
 */
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["STARTING"] = "starting";
    AgentStatus["RUNNING"] = "running";
    AgentStatus["STOPPING"] = "stopping";
    AgentStatus["STOPPED"] = "stopped";
    AgentStatus["ERROR"] = "error";
    AgentStatus["DESTROYED"] = "destroyed";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
//# sourceMappingURL=index.js.map