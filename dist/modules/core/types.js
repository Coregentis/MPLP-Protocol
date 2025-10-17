"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageStatus = exports.WorkflowStatus = exports.WorkflowStage = exports.ExecutionMode = exports.Priority = void 0;
var Priority;
(function (Priority) {
    Priority["CRITICAL"] = "critical";
    Priority["HIGH"] = "high";
    Priority["MEDIUM"] = "medium";
    Priority["LOW"] = "low";
})(Priority || (exports.Priority = Priority = {}));
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode["SEQUENTIAL"] = "sequential";
    ExecutionMode["PARALLEL"] = "parallel";
    ExecutionMode["CONDITIONAL"] = "conditional";
    ExecutionMode["HYBRID"] = "hybrid";
})(ExecutionMode || (exports.ExecutionMode = ExecutionMode = {}));
var WorkflowStage;
(function (WorkflowStage) {
    WorkflowStage["CONTEXT"] = "context";
    WorkflowStage["PLAN"] = "plan";
    WorkflowStage["CONFIRM"] = "confirm";
    WorkflowStage["TRACE"] = "trace";
    WorkflowStage["ROLE"] = "role";
    WorkflowStage["EXTENSION"] = "extension";
    WorkflowStage["COLLAB"] = "collab";
    WorkflowStage["DIALOG"] = "dialog";
    WorkflowStage["NETWORK"] = "network";
})(WorkflowStage || (exports.WorkflowStage = WorkflowStage = {}));
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["CREATED"] = "created";
    WorkflowStatus["IN_PROGRESS"] = "in_progress";
    WorkflowStatus["RUNNING"] = "in_progress";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
    WorkflowStatus["PAUSED"] = "paused";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "pending";
    StageStatus["RUNNING"] = "running";
    StageStatus["COMPLETED"] = "completed";
    StageStatus["FAILED"] = "failed";
    StageStatus["SKIPPED"] = "skipped";
})(StageStatus || (exports.StageStatus = StageStatus = {}));
