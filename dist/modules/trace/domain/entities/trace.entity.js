"use strict";
/**
 * Trace领域实体
 *
 * @description Trace模块的核心领域实体，包含业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 基于Context模块的IDENTICAL企业级模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceEntity = void 0;
/**
 * Trace领域实体
 *
 * @description 封装Trace的业务逻辑和不变量
 */
class TraceEntity {
    constructor(data) {
        this.data = this.initializeData(data);
        this.validateInvariants();
    }
    // ===== 访问器方法 =====
    get traceId() {
        return this.data.traceId;
    }
    get contextId() {
        return this.data.contextId;
    }
    get planId() {
        return this.data.planId;
    }
    get taskId() {
        return this.data.taskId;
    }
    get traceType() {
        return this.data.traceType;
    }
    get severity() {
        return this.data.severity;
    }
    get event() {
        return this.data.event;
    }
    get timestamp() {
        return this.data.timestamp;
    }
    get status() {
        return this.data.traceOperation || 'active';
    }
    get duration() {
        return this.data.performanceMetrics?.metrics?.traceProcessingLatencyMs;
    }
    get spans() {
        return this.data.spans || [];
    }
    get containsSensitiveData() {
        return this.data.containsSensitiveData || false;
    }
    // ===== 新增业务方法 =====
    /**
     * 添加跨度
     */
    addSpan(span) {
        if (!this.data.spans) {
            this.data.spans = [];
        }
        this.data.spans.push(span);
    }
    /**
     * 结束追踪
     */
    end(endTime, finalStatus) {
        this.data.traceOperation = finalStatus;
        this.data.timestamp = endTime.toISOString();
        // 计算持续时间
        if (this.data.performanceMetrics) {
            const startTime = new Date(this.data.timestamp);
            // 更新traceProcessingLatencyMs指标
            if (!this.data.performanceMetrics.metrics) {
                this.data.performanceMetrics.metrics = {};
            }
            this.data.performanceMetrics.metrics.traceProcessingLatencyMs = endTime.getTime() - startTime.getTime();
        }
    }
    /**
     * 设置统计信息
     */
    setStatistics(statistics) {
        this.data.statistics = statistics;
    }
    /**
     * 标记为包含敏感数据
     */
    markAsSensitive() {
        this.data.containsSensitiveData = true;
    }
    get traceOperation() {
        return this.data.traceOperation;
    }
    get contextSnapshot() {
        return this.data.contextSnapshot;
    }
    get errorInformation() {
        return this.data.errorInformation;
    }
    get decisionLog() {
        return this.data.decisionLog;
    }
    get traceDetails() {
        return this.data.traceDetails;
    }
    // ===== 业务方法 =====
    /**
     * 更新追踪严重程度
     */
    updateSeverity(newSeverity) {
        this.validateSeverity(newSeverity);
        this.data.severity = newSeverity;
        this.updateTimestamp();
    }
    /**
     * 添加错误信息
     */
    addErrorInformation(errorInfo) {
        this.validateErrorInformation(errorInfo);
        this.data.errorInformation = errorInfo;
        this.updateSeverity('error'); // 自动提升严重程度
        this.updateTimestamp();
    }
    /**
     * 添加决策日志
     */
    addDecisionLog(decisionLog) {
        this.validateDecisionLog(decisionLog);
        this.data.decisionLog = decisionLog;
        this.updateTimestamp();
    }
    /**
     * 更新上下文快照
     */
    updateContextSnapshot(snapshot) {
        this.data.contextSnapshot = snapshot;
        this.updateTimestamp();
    }
    /**
     * 检查是否为错误追踪
     */
    isError() {
        return this.data.severity === 'error' || this.data.errorInformation !== undefined;
    }
    /**
     * 检查是否包含决策信息
     */
    hasDecision() {
        return this.data.decisionLog !== undefined;
    }
    /**
     * 获取追踪持续时间（如果有结束时间）
     */
    getDuration() {
        if (this.data.traceDetails?.samplingRate) {
            // 基于采样率计算估算持续时间
            return Date.now() - new Date(this.data.timestamp).getTime();
        }
        return undefined;
    }
    /**
     * 转换为数据对象
     */
    toData() {
        return { ...this.data };
    }
    // ===== 私有方法 =====
    /**
     * 初始化数据
     */
    initializeData(data) {
        const now = new Date().toISOString();
        return {
            protocolVersion: '1.0.0',
            timestamp: now,
            traceId: data.traceId || this.generateTraceId(),
            contextId: data.contextId,
            traceType: data.traceType || 'execution',
            severity: data.severity || 'info',
            event: data.event || this.createDefaultEvent(),
            traceOperation: data.traceOperation || 'start',
            // 可选字段
            planId: data.planId,
            taskId: data.taskId,
            contextSnapshot: data.contextSnapshot,
            errorInformation: data.errorInformation,
            decisionLog: data.decisionLog,
            traceDetails: data.traceDetails,
            // 系统字段
            auditTrail: data.auditTrail || { enabled: true, retentionDays: 30 },
            performanceMetrics: data.performanceMetrics || { enabled: true, collectionIntervalSeconds: 60 },
            monitoringIntegration: data.monitoringIntegration || { enabled: true, supportedProviders: ['prometheus'] },
            versionHistory: data.versionHistory || { enabled: true, maxVersions: 10 },
            searchMetadata: data.searchMetadata || { enabled: true, indexingStrategy: 'keyword' },
            eventIntegration: data.eventIntegration || { enabled: true },
            correlations: data.correlations || []
        };
    }
    /**
     * 验证不变量
     */
    validateInvariants() {
        if (!this.data.contextId) {
            throw new Error('Context ID is required');
        }
        if (!this.data.event?.name) {
            throw new Error('Event name is required');
        }
        this.validateSeverity(this.data.severity);
        this.validateTraceType(this.data.traceType);
    }
    /**
     * 验证严重程度
     */
    validateSeverity(severity) {
        const validSeverities = ['debug', 'info', 'warn', 'error', 'critical'];
        if (!validSeverities.includes(severity)) {
            throw new Error(`Invalid severity: ${severity}`);
        }
    }
    /**
     * 验证追踪类型
     */
    validateTraceType(traceType) {
        const validTypes = ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'];
        if (!validTypes.includes(traceType)) {
            throw new Error(`Invalid trace type: ${traceType}`);
        }
    }
    /**
     * 验证错误信息
     */
    validateErrorInformation(errorInfo) {
        if (!errorInfo.errorCode || !errorInfo.errorMessage) {
            throw new Error('Error code and message are required');
        }
    }
    /**
     * 验证决策日志
     */
    validateDecisionLog(decisionLog) {
        if (!decisionLog.decisionPoint || !decisionLog.selectedOption) {
            throw new Error('Decision point and selected option are required');
        }
    }
    /**
     * 生成追踪ID
     */
    generateTraceId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `trace-${timestamp}-${random}`;
    }
    /**
     * 创建默认事件
     */
    createDefaultEvent() {
        return {
            type: 'start',
            name: 'Default Trace Event',
            category: 'system',
            source: {
                component: 'trace-entity'
            }
        };
    }
    /**
     * 更新时间戳
     */
    updateTimestamp() {
        this.data.timestamp = new Date().toISOString();
    }
}
exports.TraceEntity = TraceEntity;
//# sourceMappingURL=trace.entity.js.map