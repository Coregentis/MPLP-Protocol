"use strict";
/**
 * @fileoverview Type definitions for Agent Orchestrator Platform
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionMode = exports.DeploymentStrategy = exports.MPLPLogger = void 0;
var core_1 = require("@mplp/core");
Object.defineProperty(exports, "MPLPLogger", { enumerable: true, get: function () { return core_1.Logger; } });
/**
 * Agent deployment strategy
 */
var DeploymentStrategy;
(function (DeploymentStrategy) {
    DeploymentStrategy["SINGLE"] = "single";
    DeploymentStrategy["REPLICATED"] = "replicated";
    DeploymentStrategy["DISTRIBUTED"] = "distributed";
    DeploymentStrategy["LOAD_BALANCED"] = "load_balanced";
})(DeploymentStrategy || (exports.DeploymentStrategy = DeploymentStrategy = {}));
/**
 * Workflow execution mode
 */
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode["SEQUENTIAL"] = "sequential";
    ExecutionMode["PARALLEL"] = "parallel";
    ExecutionMode["CONDITIONAL"] = "conditional";
    ExecutionMode["EVENT_DRIVEN"] = "event_driven";
})(ExecutionMode || (exports.ExecutionMode = ExecutionMode = {}));
//# sourceMappingURL=index.js.map