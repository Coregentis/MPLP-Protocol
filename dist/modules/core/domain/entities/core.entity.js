"use strict";
/**
 * Core领域实体
 *
 * @description Core模块的核心领域实体，封装MPLP协议栈的核心工作流和协调逻辑
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的DDD实体封装模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEntity = void 0;
/**
 * Core核心实体
 * 代表MPLP协议栈的核心工作流和协调实体
 */
class CoreEntity {
    constructor(data) {
        // 验证必需字段
        this.validateRequiredFields(data);
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.workflowId = data.workflowId;
        this.orchestratorId = data.orchestratorId;
        this.workflowConfig = data.workflowConfig;
        this.executionContext = data.executionContext;
        this.executionStatus = data.executionStatus;
        this.moduleCoordination = data.moduleCoordination;
        this.eventHandling = data.eventHandling;
        this.auditTrail = data.auditTrail;
        this.monitoringIntegration = data.monitoringIntegration;
        this.performanceMetrics = data.performanceMetrics;
        this.versionHistory = data.versionHistory;
        this.searchMetadata = data.searchMetadata;
        this.coreOperation = data.coreOperation;
        this.coreDetails = data.coreDetails;
        this.eventIntegration = data.eventIntegration;
    }
    /**
     * 验证必需字段
     * @param data 实体数据
     */
    validateRequiredFields(data) {
        // 验证必需字段 - 只验证核心必需字段，其他字段使用默认值
        const requiredFields = [
            'protocolVersion',
            'timestamp',
            'workflowId',
            'orchestratorId'
        ];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        // 为可选字段提供简单默认值 - 与测试期望保持一致
        if (!data.workflowConfig) {
            data.workflowConfig = {};
        }
        if (!data.executionContext) {
            data.executionContext = {};
        }
        if (!data.executionStatus) {
            data.executionStatus = {};
        }
        if (!data.auditTrail) {
            data.auditTrail = {};
        }
        if (!data.monitoringIntegration) {
            data.monitoringIntegration = {};
        }
        if (!data.performanceMetrics) {
            data.performanceMetrics = {};
        }
        if (!data.versionHistory) {
            data.versionHistory = {};
        }
        if (!data.searchMetadata) {
            data.searchMetadata = {};
        }
        if (!data.coreOperation) {
            data.coreOperation = {};
        }
        if (!data.eventIntegration) {
            data.eventIntegration = {};
        }
        // 验证协议版本
        if (data.protocolVersion !== '1.0.0') {
            throw new Error('Invalid protocol version, must be "1.0.0"');
        }
        // 验证UUID格式
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        if (!uuidRegex.test(data.workflowId)) {
            throw new Error('Invalid workflowId UUID format');
        }
        if (!uuidRegex.test(data.orchestratorId)) {
            throw new Error('Invalid orchestratorId UUID format');
        }
        // 验证时间戳格式
        const date = new Date(data.timestamp);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp format');
        }
    }
    /**
     * 更新工作流配置
     * @param config 新的工作流配置
     */
    updateWorkflowConfig(config) {
        this.workflowConfig = config;
    }
    /**
     * 更新执行状态
     * @param status 新的执行状态
     */
    updateExecutionStatus(status) {
        this.executionStatus = status;
    }
    /**
     * 添加审计事件
     * @param event 审计事件
     */
    addAuditEvent(event) {
        if (!this.auditTrail.auditEvents) {
            this.auditTrail.auditEvents = [];
        }
        this.auditTrail.auditEvents.push(event);
    }
    /**
     * 检查工作流是否完成
     * @returns 是否完成
     */
    isWorkflowCompleted() {
        return this.executionStatus.status === 'completed';
    }
    /**
     * 检查工作流是否失败
     * @returns 是否失败
     */
    isWorkflowFailed() {
        return this.executionStatus.status === 'failed';
    }
    /**
     * 检查工作流是否正在进行
     * @returns 是否正在进行
     */
    isWorkflowInProgress() {
        return this.executionStatus.status === 'in_progress';
    }
    /**
     * 获取当前阶段
     * @returns 当前阶段
     */
    getCurrentStage() {
        return this.executionStatus.currentStage;
    }
    /**
     * 获取已完成的阶段
     * @returns 已完成的阶段列表
     */
    getCompletedStages() {
        return this.executionStatus.completedStages || [];
    }
    /**
     * 获取工作流持续时间
     * @returns 持续时间（毫秒）
     */
    getWorkflowDuration() {
        return this.executionStatus.durationMs;
    }
    /**
     * 检查是否启用了审计
     * @returns 是否启用审计
     */
    isAuditEnabled() {
        return this.auditTrail.enabled;
    }
    /**
     * 检查是否启用了监控
     * @returns 是否启用监控
     */
    isMonitoringEnabled() {
        return this.monitoringIntegration.enabled;
    }
    /**
     * 检查是否启用了性能指标收集
     * @returns 是否启用性能指标收集
     */
    isPerformanceMetricsEnabled() {
        return this.performanceMetrics.enabled;
    }
    /**
     * 检查是否启用了版本历史
     * @returns 是否启用版本历史
     */
    isVersionHistoryEnabled() {
        return this.versionHistory.enabled;
    }
    /**
     * 检查是否启用了搜索元数据
     * @returns 是否启用搜索元数据
     */
    isSearchMetadataEnabled() {
        return this.searchMetadata.enabled;
    }
    /**
     * 检查是否启用了事件集成
     * @returns 是否启用事件集成
     */
    isEventIntegrationEnabled() {
        return this.eventIntegration.enabled;
    }
    /**
     * 获取实体的JSON表示
     * @returns JSON对象
     */
    toJSON() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            workflowId: this.workflowId,
            orchestratorId: this.orchestratorId,
            workflowConfig: this.workflowConfig,
            executionContext: this.executionContext,
            executionStatus: this.executionStatus,
            moduleCoordination: this.moduleCoordination,
            eventHandling: this.eventHandling,
            auditTrail: this.auditTrail,
            monitoringIntegration: this.monitoringIntegration,
            performanceMetrics: this.performanceMetrics,
            versionHistory: this.versionHistory,
            searchMetadata: this.searchMetadata,
            coreOperation: this.coreOperation,
            coreDetails: this.coreDetails,
            eventIntegration: this.eventIntegration
        };
    }
    /**
     * 创建实体的副本
     * @returns 新的实体实例
     */
    clone() {
        return new CoreEntity({
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            workflowId: this.workflowId,
            orchestratorId: this.orchestratorId,
            workflowConfig: { ...this.workflowConfig },
            executionContext: { ...this.executionContext },
            executionStatus: { ...this.executionStatus },
            moduleCoordination: this.moduleCoordination ? { ...this.moduleCoordination } : undefined,
            eventHandling: this.eventHandling ? { ...this.eventHandling } : undefined,
            auditTrail: { ...this.auditTrail },
            monitoringIntegration: { ...this.monitoringIntegration },
            performanceMetrics: { ...this.performanceMetrics },
            versionHistory: { ...this.versionHistory },
            searchMetadata: { ...this.searchMetadata },
            coreOperation: this.coreOperation,
            coreDetails: this.coreDetails ? { ...this.coreDetails } : undefined,
            eventIntegration: { ...this.eventIntegration }
        });
    }
}
exports.CoreEntity = CoreEntity;
//# sourceMappingURL=core.entity.js.map