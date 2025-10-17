"use strict";
/**
 * @fileoverview Core type definitions for MPLP Agent Builder - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
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