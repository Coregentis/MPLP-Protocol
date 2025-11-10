"use strict";
/**
 * Core模块类型定义
 * 基于mplp-core.json Schema的TypeScript类型定义
 * 遵循双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageStatus = exports.WorkflowStatusAlias = exports.WorkflowStatus = exports.WorkflowStage = exports.ExecutionMode = exports.Priority = void 0;
// 枚举定义（用于测试和代码中的常量访问）
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
// 枚举定义（用于测试和代码中的常量访问）
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
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
    WorkflowStatus["PAUSED"] = "paused";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
// 向后兼容的类型别名
exports.WorkflowStatusAlias = {
    ...WorkflowStatus,
    RUNNING: WorkflowStatus.IN_PROGRESS
};
var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "pending";
    StageStatus["RUNNING"] = "running";
    StageStatus["COMPLETED"] = "completed";
    StageStatus["FAILED"] = "failed";
    StageStatus["SKIPPED"] = "skipped";
})(StageStatus || (exports.StageStatus = StageStatus = {}));
//# sourceMappingURL=types.js.map