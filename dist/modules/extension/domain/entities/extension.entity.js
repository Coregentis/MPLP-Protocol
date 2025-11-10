"use strict";
/**
 * Extension实体
 *
 * @description Extension模块的核心聚合根，封装扩展管理的所有业务逻辑
 * @version 1.0.0
 * @layer Domain层 - 实体
 * @pattern DDD聚合根 + 业务逻辑封装
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionEntity = void 0;
/**
 * Extension实体类
 * 作为扩展管理的聚合根，封装所有扩展相关的业务逻辑
 */
class ExtensionEntity {
    /**
     * 构造函数
     * @param data - 扩展实体数据
     */
    constructor(data) {
        // 验证必需字段
        this.validateRequiredFields(data);
        // 初始化核心属性
        this.extensionId = data.extensionId;
        this.contextId = data.contextId;
        this.protocolVersion = data.protocolVersion;
        // 初始化基础属性
        this._name = data.name;
        this._displayName = data.displayName;
        this._description = data.description;
        this._version = data.version;
        this._extensionType = data.extensionType;
        this._status = data.status;
        this._timestamp = data.timestamp;
        // 初始化复杂属性
        this._compatibility = data.compatibility;
        this._configuration = data.configuration;
        this._extensionPoints = data.extensionPoints;
        this._apiExtensions = data.apiExtensions;
        this._eventSubscriptions = data.eventSubscriptions;
        this._lifecycle = data.lifecycle;
        this._security = data.security;
        this._metadata = data.metadata;
        this._auditTrail = data.auditTrail;
        this._performanceMetrics = data.performanceMetrics;
        this._monitoringIntegration = data.monitoringIntegration;
        this._versionHistory = data.versionHistory;
        this._searchMetadata = data.searchMetadata;
        this._eventIntegration = data.eventIntegration;
    }
    // ============================================================================
    // 公共访问器属性
    // ============================================================================
    get name() { return this._name; }
    get displayName() { return this._displayName; }
    get description() { return this._description; }
    get version() { return this._version; }
    get extensionType() { return this._extensionType; }
    get status() { return this._status; }
    get timestamp() { return this._timestamp; }
    get compatibility() { return this._compatibility; }
    get configuration() { return this._configuration; }
    get extensionPoints() { return [...this._extensionPoints]; }
    get apiExtensions() { return [...this._apiExtensions]; }
    get eventSubscriptions() { return [...this._eventSubscriptions]; }
    get lifecycle() { return this._lifecycle; }
    get security() { return this._security; }
    get metadata() { return this._metadata; }
    get auditTrail() { return this._auditTrail; }
    get performanceMetrics() { return this._performanceMetrics; }
    get monitoringIntegration() { return this._monitoringIntegration; }
    get versionHistory() { return this._versionHistory; }
    get searchMetadata() { return this._searchMetadata; }
    get eventIntegration() { return this._eventIntegration; }
    // ============================================================================
    // 核心业务方法
    // ============================================================================
    /**
     * 激活扩展
     * @param userId - 操作用户ID
     * @returns 是否激活成功
     */
    activate(userId) {
        if (this._status === 'active') {
            return true; // 已经激活
        }
        if (this._status !== 'installed' && this._status !== 'inactive') {
            throw new Error(`Cannot activate extension in status: ${this._status}`);
        }
        // 检查兼容性
        if (!this.isCompatible()) {
            throw new Error('Extension is not compatible with current MPLP version');
        }
        // 更新状态
        this._status = 'active';
        this._timestamp = new Date().toISOString();
        // 更新生命周期信息
        this._lifecycle = {
            ...this._lifecycle,
            activationCount: this._lifecycle.activationCount + 1
        };
        // 记录审计事件
        this.addAuditEvent('activate', userId, {
            previousStatus: this._status,
            newStatus: 'active'
        });
        return true;
    }
    /**
     * 停用扩展
     * @param userId - 操作用户ID
     * @returns 是否停用成功
     */
    deactivate(userId) {
        if (this._status === 'inactive') {
            return true; // 已经停用
        }
        if (this._status !== 'active') {
            throw new Error(`Cannot deactivate extension in status: ${this._status}`);
        }
        // 更新状态
        const previousStatus = this._status;
        this._status = 'inactive';
        this._timestamp = new Date().toISOString();
        // 记录审计事件
        this.addAuditEvent('deactivate', userId, {
            previousStatus,
            newStatus: 'inactive'
        });
        return true;
    }
    /**
     * 标记扩展为错误状态
     * @param error - 错误信息
     * @param userId - 操作用户ID
     */
    markAsError(error, userId) {
        const previousStatus = this._status;
        this._status = 'error';
        this._timestamp = new Date().toISOString();
        // 增加错误计数
        this._lifecycle = {
            ...this._lifecycle,
            errorCount: this._lifecycle.errorCount + 1
        };
        // 记录审计事件
        this.addAuditEvent('error', userId, {
            previousStatus,
            newStatus: 'error',
            error: error || 'Unknown error'
        });
    }
    /**
     * 验证扩展的有效性
     * @returns 是否有效
     */
    validate() {
        try {
            // 验证必需字段
            if (!this.extensionId || !this.contextId || !this.name || !this.version) {
                return false;
            }
            // 验证扩展类型
            const validTypes = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
            if (!validTypes.includes(this.extensionType)) {
                return false;
            }
            // 验证状态
            const validStatuses = ['installed', 'active', 'inactive', 'disabled', 'error', 'updating', 'uninstalling'];
            if (!validStatuses.includes(this.status)) {
                return false;
            }
            // 验证配置
            if (!this._configuration || typeof this._configuration !== 'object') {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 更新扩展配置
     * @param newConfig - 新的配置
     * @param userId - 操作用户ID
     */
    updateConfiguration(newConfig, userId) {
        // 验证配置
        this.validateConfiguration(newConfig);
        const previousConfig = { ...this._configuration.currentConfig };
        // 更新配置
        this._configuration = {
            ...this._configuration,
            currentConfig: newConfig
        };
        this._timestamp = new Date().toISOString();
        // 记录审计事件
        this.addAuditEvent('configure', userId, {
            previousConfig,
            newConfig
        });
    }
    /**
     * 更新扩展版本
     * @param newVersion - 新版本号
     * @param changelog - 变更日志
     * @param userId - 操作用户ID
     */
    updateVersion(newVersion, changelog, userId) {
        if (!this.isValidVersion(newVersion)) {
            throw new Error(`Invalid version format: ${newVersion}`);
        }
        const previousVersion = this._version;
        // 更新版本
        this._version = newVersion;
        this._timestamp = new Date().toISOString();
        // 更新版本历史
        this._versionHistory = {
            ...this._versionHistory,
            versions: [
                ...this._versionHistory.versions,
                {
                    version: newVersion,
                    releaseDate: new Date().toISOString(),
                    changelog,
                    breaking: this.isBreakingChange(previousVersion, newVersion),
                    deprecated: []
                }
            ]
        };
        // 记录审计事件
        this.addAuditEvent('update', userId, {
            previousVersion,
            newVersion,
            changelog
        });
    }
    /**
     * 添加扩展点
     * @param extensionPoint - 扩展点定义
     * @param userId - 操作用户ID
     */
    addExtensionPoint(extensionPoint, userId) {
        // 检查扩展点ID是否已存在
        if (this._extensionPoints.some(ep => ep.id === extensionPoint.id)) {
            throw new Error(`Extension point with ID '${extensionPoint.id}' already exists`);
        }
        // 添加扩展点
        this._extensionPoints = [...this._extensionPoints, extensionPoint];
        this._timestamp = new Date().toISOString();
        // 记录审计事件
        this.addAuditEvent('configure', userId, {
            action: 'add_extension_point',
            extensionPointId: extensionPoint.id,
            extensionPointType: extensionPoint.type
        });
    }
    /**
     * 移除扩展点
     * @param extensionPointId - 扩展点ID
     * @param userId - 操作用户ID
     */
    removeExtensionPoint(extensionPointId, userId) {
        const index = this._extensionPoints.findIndex(ep => ep.id === extensionPointId);
        if (index === -1) {
            throw new Error(`Extension point with ID '${extensionPointId}' not found`);
        }
        // 移除扩展点
        this._extensionPoints = this._extensionPoints.filter(ep => ep.id !== extensionPointId);
        this._timestamp = new Date().toISOString();
        // 记录审计事件
        this.addAuditEvent('configure', userId, {
            action: 'remove_extension_point',
            extensionPointId
        });
    }
    /**
     * 更新性能指标
     * @param metrics - 新的性能指标
     */
    updatePerformanceMetrics(metrics) {
        // 更新lifecycle中的性能指标
        this._lifecycle = {
            ...this._lifecycle,
            performanceMetrics: {
                ...this._lifecycle.performanceMetrics,
                ...metrics
            }
        };
        // 同时更新主性能指标
        this._performanceMetrics = {
            ...this._performanceMetrics,
            ...metrics,
            healthStatus: this.calculateHealthStatus(metrics)
        };
        this._timestamp = new Date().toISOString();
    }
    // ============================================================================
    // 查询方法
    // ============================================================================
    /**
     * 检查扩展是否处于活动状态
     */
    isActive() {
        return this._status === 'active';
    }
    /**
     * 检查扩展是否有错误
     */
    hasError() {
        return this._status === 'error' || this._lifecycle.errorCount > 0;
    }
    /**
     * 检查扩展是否兼容当前MPLP版本
     */
    isCompatible() {
        // TODO: 实现版本兼容性检查逻辑
        return true;
    }
    /**
     * 获取扩展的健康状态
     */
    getHealthStatus() {
        return this._performanceMetrics.healthStatus;
    }
    /**
     * 检查是否有特定类型的扩展点
     * @param type - 扩展点类型
     */
    hasExtensionPointType(type) {
        return this._extensionPoints.some(ep => ep.type === type);
    }
    /**
     * 获取特定类型的扩展点
     * @param type - 扩展点类型
     */
    getExtensionPointsByType(type) {
        return this._extensionPoints.filter(ep => ep.type === type);
    }
    // ============================================================================
    // 数据转换方法
    // ============================================================================
    /**
     * 转换为数据对象
     * @returns 扩展实体数据
     */
    toData() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this._timestamp,
            extensionId: this.extensionId,
            contextId: this.contextId,
            name: this._name,
            displayName: this._displayName,
            description: this._description,
            version: this._version,
            extensionType: this._extensionType,
            status: this._status,
            compatibility: this._compatibility,
            configuration: this._configuration,
            extensionPoints: [...this._extensionPoints],
            apiExtensions: [...this._apiExtensions],
            eventSubscriptions: [...this._eventSubscriptions],
            lifecycle: this._lifecycle,
            security: this._security,
            metadata: this._metadata,
            auditTrail: this._auditTrail,
            performanceMetrics: this._performanceMetrics,
            monitoringIntegration: this._monitoringIntegration,
            versionHistory: this._versionHistory,
            searchMetadata: this._searchMetadata,
            eventIntegration: this._eventIntegration
        };
    }
    // ============================================================================
    // 私有辅助方法
    // ============================================================================
    /**
     * 验证必需字段
     */
    validateRequiredFields(data) {
        const requiredFields = ['extensionId', 'contextId', 'name', 'version', 'extensionType'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
    /**
     * 验证配置
     */
    validateConfiguration(config) {
        // TODO: 根据配置Schema验证配置
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid configuration: must be an object');
        }
    }
    /**
     * 验证版本格式
     */
    isValidVersion(version) {
        // 简单的语义版本验证
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?(\+[a-zA-Z0-9-]+)?$/;
        return semverRegex.test(version);
    }
    /**
     * 检查是否为破坏性变更
     */
    isBreakingChange(oldVersion, newVersion) {
        const oldParts = oldVersion.split('.');
        const newParts = newVersion.split('.');
        const oldMajor = parseInt(oldParts[0] || '0');
        const newMajor = parseInt(newParts[0] || '0');
        return newMajor > oldMajor;
    }
    /**
     * 计算健康状态
     */
    calculateHealthStatus(metrics) {
        const errorRate = metrics.errorRate ?? this._performanceMetrics.errorRate;
        const availability = metrics.availability ?? this._performanceMetrics.availability;
        if (errorRate > 0.1 || availability < 0.9) {
            return 'unhealthy';
        }
        else if (errorRate > 0.05 || availability < 0.95) {
            return 'degraded';
        }
        else {
            return 'healthy';
        }
    }
    /**
     * 添加审计事件
     */
    addAuditEvent(eventType, userId, details) {
        const auditEvent = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date().toISOString(),
            eventType,
            userId,
            details: details || {},
            ipAddress: undefined, // TODO: 从上下文获取
            userAgent: undefined // TODO: 从上下文获取
        };
        this._auditTrail = {
            ...this._auditTrail,
            events: [...this._auditTrail.events, auditEvent]
        };
    }
}
exports.ExtensionEntity = ExtensionEntity;
//# sourceMappingURL=extension.entity.js.map