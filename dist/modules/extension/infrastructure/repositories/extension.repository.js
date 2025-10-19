"use strict";
/**
 * Extension仓储实现
 *
 * @description Extension模块的内存仓储实现，提供完整的数据访问功能
 * @version 1.0.0
 * @layer Infrastructure层 - 仓储实现
 * @pattern Repository Pattern + 内存存储
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionRepository = void 0;
/**
 * Extension内存仓储实现
 * 使用内存存储提供快速的数据访问
 */
class ExtensionRepository {
    constructor() {
        // 内存存储
        this.extensions = new Map();
        this.nameIndex = new Map();
        this.contextIndex = new Map();
        this.typeIndex = new Map();
        this.statusIndex = new Map();
    }
    // ============================================================================
    // 基本CRUD操作
    // ============================================================================
    /**
     * 创建扩展记录
     */
    async create(extension) {
        // 检查ID是否已存在
        if (this.extensions.has(extension.extensionId)) {
            throw new Error(`Extension with ID '${extension.extensionId}' already exists`);
        }
        // 检查名称是否已存在
        if (this.nameIndex.has(extension.name)) {
            throw new Error(`Extension with name '${extension.name}' already exists`);
        }
        // 存储扩展
        this.extensions.set(extension.extensionId, { ...extension });
        // 更新索引
        this.updateIndexes(extension, 'create');
        return { ...extension };
    }
    /**
     * 根据ID查找扩展
     */
    async findById(extensionId) {
        const extension = this.extensions.get(extensionId);
        return extension ? { ...extension } : null;
    }
    /**
     * 更新扩展记录
     */
    async update(extensionId, updates) {
        const existingExtension = this.extensions.get(extensionId);
        if (!existingExtension) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        // 如果更新名称，检查新名称是否已存在
        if (updates.name && updates.name !== existingExtension.name) {
            if (this.nameIndex.has(updates.name)) {
                throw new Error(`Extension with name '${updates.name}' already exists`);
            }
        }
        // 合并更新
        const updatedExtension = {
            ...existingExtension,
            ...updates,
            timestamp: new Date().toISOString() // 更新时间戳
        };
        // 更新存储
        this.extensions.set(extensionId, updatedExtension);
        // 更新索引
        this.updateIndexes(existingExtension, 'delete');
        this.updateIndexes(updatedExtension, 'create');
        return { ...updatedExtension };
    }
    /**
     * 删除扩展记录
     */
    async delete(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (!extension) {
            return false;
        }
        // 删除扩展
        this.extensions.delete(extensionId);
        // 更新索引
        this.updateIndexes(extension, 'delete');
        return true;
    }
    // ============================================================================
    // 查询操作
    // ============================================================================
    /**
     * 根据过滤条件查找扩展
     */
    async findByFilter(filter, pagination, sort) {
        let results = Array.from(this.extensions.values());
        // 应用过滤器
        results = this.applyFilters(results, filter);
        // 应用排序
        if (sort && sort.length > 0) {
            results = this.applySorting(results, sort);
        }
        // 计算总数
        const total = results.length;
        // 应用分页
        if (pagination) {
            const { page = 1, limit = 10, offset } = pagination;
            const startIndex = offset !== undefined ? offset : (page - 1) * limit;
            const endIndex = startIndex + limit;
            results = results.slice(startIndex, endIndex);
        }
        return {
            extensions: results.map(ext => ({ ...ext })),
            total,
            page: pagination?.page,
            limit: pagination?.limit,
            hasMore: pagination ? (pagination.page || 1) * (pagination.limit || 10) < total : false
        };
    }
    /**
     * 根据上下文ID查找扩展
     */
    async findByContextId(contextId) {
        const extensionIds = this.contextIndex.get(contextId) || [];
        return extensionIds
            .map(id => this.extensions.get(id))
            .filter((ext) => ext !== undefined)
            .map(ext => ({ ...ext }));
    }
    /**
     * 根据扩展类型查找扩展
     */
    async findByType(extensionType, status) {
        const extensionIds = this.typeIndex.get(extensionType) || [];
        let results = extensionIds
            .map(id => this.extensions.get(id))
            .filter((ext) => ext !== undefined);
        if (status) {
            results = results.filter(ext => ext.status === status);
        }
        return results.map(ext => ({ ...ext }));
    }
    /**
     * 根据状态查找扩展
     */
    async findByStatus(status) {
        const extensionIds = this.statusIndex.get(status) || [];
        return extensionIds
            .map(id => this.extensions.get(id))
            .filter((ext) => ext !== undefined)
            .map(ext => ({ ...ext }));
    }
    /**
     * 查找所有扩展
     */
    async findAll() {
        return Array.from(this.extensions.values()).map(ext => ({ ...ext }));
    }
    /**
     * 根据名称查找扩展
     */
    async findByName(name, exactMatch = true) {
        if (exactMatch) {
            const extensionId = this.nameIndex.get(name);
            if (extensionId) {
                const extension = this.extensions.get(extensionId);
                return extension ? [{ ...extension }] : [];
            }
            return [];
        }
        else {
            const results = Array.from(this.extensions.values())
                .filter(ext => ext.name.toLowerCase().includes(name.toLowerCase()));
            return results.map(ext => ({ ...ext }));
        }
    }
    /**
     * 搜索扩展
     */
    async search(searchTerm, searchFields = ['name', 'displayName', 'description'], pagination) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        let results = Array.from(this.extensions.values()).filter(ext => {
            return searchFields.some(field => {
                const value = this.getFieldValue(ext, field);
                return value && value.toString().toLowerCase().includes(lowerSearchTerm);
            });
        });
        const total = results.length;
        // 应用分页
        if (pagination) {
            const { page = 1, limit = 10, offset } = pagination;
            const startIndex = offset !== undefined ? offset : (page - 1) * limit;
            const endIndex = startIndex + limit;
            results = results.slice(startIndex, endIndex);
        }
        return {
            extensions: results.map(ext => ({ ...ext })),
            total,
            page: pagination?.page,
            limit: pagination?.limit,
            hasMore: pagination ? (pagination.page || 1) * (pagination.limit || 10) < total : false
        };
    }
    // ============================================================================
    // 统计和聚合操作
    // ============================================================================
    /**
     * 获取扩展总数
     */
    async count(filter) {
        if (!filter) {
            return this.extensions.size;
        }
        const results = this.applyFilters(Array.from(this.extensions.values()), filter);
        return results.length;
    }
    /**
     * 检查扩展是否存在
     */
    async exists(extensionId) {
        return this.extensions.has(extensionId);
    }
    /**
     * 检查扩展名称是否已存在
     */
    async nameExists(name, excludeId) {
        const existingId = this.nameIndex.get(name);
        if (!existingId) {
            return false;
        }
        return excludeId ? existingId !== excludeId : true;
    }
    /**
     * 获取扩展统计信息
     */
    async getStatistics(filter) {
        let extensions = Array.from(this.extensions.values());
        if (filter) {
            extensions = this.applyFilters(extensions, filter);
        }
        const totalExtensions = extensions.length;
        const activeExtensions = extensions.filter(ext => ext.status === 'active').length;
        const inactiveExtensions = extensions.filter(ext => ext.status === 'inactive').length;
        const errorExtensions = extensions.filter(ext => ext.status === 'error').length;
        // 按类型统计
        const extensionsByType = {
            plugin: 0,
            adapter: 0,
            connector: 0,
            middleware: 0,
            hook: 0,
            transformer: 0
        };
        // 按状态统计
        const extensionsByStatus = {
            installed: 0,
            active: 0,
            inactive: 0,
            disabled: 0,
            error: 0,
            updating: 0,
            uninstalling: 0
        };
        extensions.forEach(ext => {
            extensionsByType[ext.extensionType]++;
            extensionsByStatus[ext.status]++;
        });
        // 计算平均性能指标
        const performanceMetrics = extensions.map(ext => ext.performanceMetrics);
        const averagePerformanceMetrics = {
            responseTime: this.calculateAverage(performanceMetrics.map(m => m.executionTime)),
            errorRate: this.calculateAverage(performanceMetrics.map(m => m.errorRate)),
            availability: this.calculateAverage(performanceMetrics.map(m => m.availability)),
            throughput: this.calculateAverage(performanceMetrics.map(m => m.throughput))
        };
        // 获取性能最佳的扩展
        const topPerformingExtensions = extensions
            .sort((a, b) => b.performanceMetrics.efficiencyScore - a.performanceMetrics.efficiencyScore)
            .slice(0, 5)
            .map(ext => ({
            extensionId: ext.extensionId,
            name: ext.name,
            performanceScore: ext.performanceMetrics.efficiencyScore
        }));
        // 获取最近更新的扩展
        const recentlyUpdated = extensions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map(ext => ({
            extensionId: ext.extensionId,
            name: ext.name,
            lastUpdate: ext.timestamp
        }));
        return {
            totalExtensions,
            activeExtensions,
            inactiveExtensions,
            errorExtensions,
            extensionsByType,
            extensionsByStatus,
            averagePerformanceMetrics,
            topPerformingExtensions,
            recentlyUpdated
        };
    }
    // ============================================================================
    // 批量操作
    // ============================================================================
    /**
     * 批量创建扩展
     */
    async createBatch(extensions) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        for (const extension of extensions) {
            try {
                await this.create(extension);
                results.push({ id: extension.extensionId, success: true });
                successCount++;
            }
            catch (error) {
                results.push({
                    id: extension.extensionId,
                    success: false,
                    error: error.message
                });
                failureCount++;
            }
        }
        return { successCount, failureCount, results };
    }
    /**
     * 批量更新扩展
     */
    async updateBatch(updates) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        for (const { extensionId, updates: updateData } of updates) {
            try {
                await this.update(extensionId, updateData);
                results.push({ id: extensionId, success: true });
                successCount++;
            }
            catch (error) {
                results.push({
                    id: extensionId,
                    success: false,
                    error: error.message
                });
                failureCount++;
            }
        }
        return { successCount, failureCount, results };
    }
    /**
     * 批量删除扩展
     */
    async deleteBatch(extensionIds) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        for (const extensionId of extensionIds) {
            try {
                const deleted = await this.delete(extensionId);
                if (deleted) {
                    results.push({ id: extensionId, success: true });
                    successCount++;
                }
                else {
                    results.push({
                        id: extensionId,
                        success: false,
                        error: 'Extension not found'
                    });
                    failureCount++;
                }
            }
            catch (error) {
                results.push({
                    id: extensionId,
                    success: false,
                    error: error.message
                });
                failureCount++;
            }
        }
        return { successCount, failureCount, results };
    }
    /**
     * 批量更新状态
     */
    async updateStatusBatch(extensionIds, status) {
        const updates = extensionIds.map(id => ({
            extensionId: id,
            updates: { status, timestamp: new Date().toISOString() }
        }));
        return await this.updateBatch(updates);
    }
    // ============================================================================
    // 高级查询操作
    // ============================================================================
    /**
     * 查找活动的扩展
     */
    async findActiveExtensions(contextId) {
        let results = await this.findByStatus('active');
        if (contextId) {
            results = results.filter(ext => ext.contextId === contextId);
        }
        return results;
    }
    /**
     * 查找有错误的扩展
     */
    async findExtensionsWithErrors(contextId) {
        let results = Array.from(this.extensions.values())
            .filter(ext => ext.status === 'error' || ext.lifecycle.errorCount > 0);
        if (contextId) {
            results = results.filter(ext => ext.contextId === contextId);
        }
        return results.map(ext => ({ ...ext }));
    }
    /**
     * 查找需要更新的扩展
     */
    async findExtensionsNeedingUpdate(currentVersion) {
        // 简单的版本比较逻辑
        return Array.from(this.extensions.values())
            .filter(ext => this.isVersionOlder(ext.version, currentVersion))
            .map(ext => ({ ...ext }));
    }
    /**
     * 查找兼容的扩展
     */
    async findCompatibleExtensions(mplpVersion, requiredModules) {
        return Array.from(this.extensions.values())
            .filter(ext => {
            // 检查MPLP版本兼容性
            if (!this.isVersionCompatible(ext.compatibility.mplpVersion, mplpVersion)) {
                return false;
            }
            // 检查必需模块
            if (requiredModules && requiredModules.length > 0) {
                const hasAllModules = requiredModules.every(module => ext.compatibility.requiredModules.includes(module));
                if (!hasAllModules) {
                    return false;
                }
            }
            return true;
        })
            .map(ext => ({ ...ext }));
    }
    /**
     * 查找具有特定扩展点的扩展
     */
    async findExtensionsWithExtensionPoint(extensionPointType) {
        return Array.from(this.extensions.values())
            .filter(ext => ext.extensionPoints.some(ep => ep.type === extensionPointType))
            .map(ext => ({ ...ext }));
    }
    /**
     * 查找具有API扩展的扩展
     */
    async findExtensionsWithApiExtensions(endpoint, method) {
        return Array.from(this.extensions.values())
            .filter(ext => {
            if (ext.apiExtensions.length === 0) {
                return false;
            }
            if (endpoint || method) {
                return ext.apiExtensions.some(api => {
                    const endpointMatch = !endpoint || api.endpoint === endpoint;
                    const methodMatch = !method || api.method.toLowerCase() === method.toLowerCase();
                    return endpointMatch && methodMatch;
                });
            }
            return true;
        })
            .map(ext => ({ ...ext }));
    }
    /**
     * 查找订阅特定事件的扩展
     */
    async findExtensionsSubscribedToEvent(eventPattern) {
        return Array.from(this.extensions.values())
            .filter(ext => ext.eventSubscriptions.some(sub => sub.eventPattern === eventPattern))
            .map(ext => ({ ...ext }));
    }
    // ============================================================================
    // 性能和监控操作
    // ============================================================================
    /**
     * 更新扩展性能指标
     */
    async updatePerformanceMetrics(extensionId, metrics) {
        const extension = this.extensions.get(extensionId);
        if (!extension) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        extension.performanceMetrics = {
            ...extension.performanceMetrics,
            ...metrics
        };
        extension.timestamp = new Date().toISOString();
    }
    /**
     * 获取性能最佳的扩展
     */
    async findTopPerformingExtensions(limit = 10, metric = 'efficiencyScore') {
        const extensions = Array.from(this.extensions.values());
        extensions.sort((a, b) => {
            const aValue = this.getMetricValue(a.performanceMetrics, metric);
            const bValue = this.getMetricValue(b.performanceMetrics, metric);
            // 对于responseTime，值越小越好；对于其他指标，值越大越好
            return metric === 'responseTime' ? aValue - bValue : bValue - aValue;
        });
        return extensions.slice(0, limit).map(ext => ({ ...ext }));
    }
    /**
     * 获取最近更新的扩展
     */
    async findRecentlyUpdatedExtensions(limit = 10, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return Array.from(this.extensions.values())
            .filter(ext => new Date(ext.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)
            .map(ext => ({ ...ext }));
    }
    // ============================================================================
    // 清理和维护操作
    // ============================================================================
    /**
     * 清理所有扩展数据
     */
    async clear() {
        this.extensions.clear();
        this.nameIndex.clear();
        this.contextIndex.clear();
        this.typeIndex.clear();
        this.statusIndex.clear();
    }
    /**
     * 清理过期的审计记录
     */
    async cleanupExpiredAuditRecords(retentionDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        let cleanedCount = 0;
        for (const extension of this.extensions.values()) {
            const originalCount = extension.auditTrail.events.length;
            extension.auditTrail.events = extension.auditTrail.events.filter(event => new Date(event.timestamp) >= cutoffDate);
            cleanedCount += originalCount - extension.auditTrail.events.length;
        }
        return cleanedCount;
    }
    /**
     * 优化存储性能
     */
    async optimize() {
        // 对于内存存储，这里可以进行一些优化操作
        // 例如重建索引、压缩数据等
        // Storage optimization completed
    }
    // ============================================================================
    // 私有辅助方法
    // ============================================================================
    /**
     * 更新索引
     */
    updateIndexes(extension, operation) {
        if (operation === 'create') {
            // 更新名称索引
            this.nameIndex.set(extension.name, extension.extensionId);
            // 更新上下文索引
            const contextExtensions = this.contextIndex.get(extension.contextId) || [];
            contextExtensions.push(extension.extensionId);
            this.contextIndex.set(extension.contextId, contextExtensions);
            // 更新类型索引
            const typeExtensions = this.typeIndex.get(extension.extensionType) || [];
            typeExtensions.push(extension.extensionId);
            this.typeIndex.set(extension.extensionType, typeExtensions);
            // 更新状态索引
            const statusExtensions = this.statusIndex.get(extension.status) || [];
            statusExtensions.push(extension.extensionId);
            this.statusIndex.set(extension.status, statusExtensions);
        }
        else if (operation === 'delete') {
            // 删除名称索引
            this.nameIndex.delete(extension.name);
            // 删除上下文索引
            const contextExtensions = this.contextIndex.get(extension.contextId) || [];
            const contextIndex = contextExtensions.indexOf(extension.extensionId);
            if (contextIndex > -1) {
                contextExtensions.splice(contextIndex, 1);
                if (contextExtensions.length === 0) {
                    this.contextIndex.delete(extension.contextId);
                }
                else {
                    this.contextIndex.set(extension.contextId, contextExtensions);
                }
            }
            // 删除类型索引
            const typeExtensions = this.typeIndex.get(extension.extensionType) || [];
            const typeIndex = typeExtensions.indexOf(extension.extensionId);
            if (typeIndex > -1) {
                typeExtensions.splice(typeIndex, 1);
                if (typeExtensions.length === 0) {
                    this.typeIndex.delete(extension.extensionType);
                }
                else {
                    this.typeIndex.set(extension.extensionType, typeExtensions);
                }
            }
            // 删除状态索引
            const statusExtensions = this.statusIndex.get(extension.status) || [];
            const statusIndex = statusExtensions.indexOf(extension.extensionId);
            if (statusIndex > -1) {
                statusExtensions.splice(statusIndex, 1);
                if (statusExtensions.length === 0) {
                    this.statusIndex.delete(extension.status);
                }
                else {
                    this.statusIndex.set(extension.status, statusExtensions);
                }
            }
        }
    }
    /**
     * 应用过滤器
     */
    applyFilters(extensions, filter) {
        return extensions.filter(ext => {
            // 上下文ID过滤
            if (filter.contextId && ext.contextId !== filter.contextId) {
                return false;
            }
            // 扩展类型过滤
            if (filter.extensionType) {
                const types = Array.isArray(filter.extensionType) ? filter.extensionType : [filter.extensionType];
                if (!types.includes(ext.extensionType)) {
                    return false;
                }
            }
            // 状态过滤
            if (filter.status) {
                const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
                if (!statuses.includes(ext.status)) {
                    return false;
                }
            }
            // 名称过滤
            if (filter.name && !ext.name.toLowerCase().includes(filter.name.toLowerCase())) {
                return false;
            }
            // 版本过滤
            if (filter.version && ext.version !== filter.version) {
                return false;
            }
            // 作者过滤
            if (filter.author && ext.metadata.author.name !== filter.author) {
                return false;
            }
            // 组织过滤
            if (filter.organization && ext.metadata.organization?.name !== filter.organization) {
                return false;
            }
            // 分类过滤
            if (filter.category && ext.metadata.category !== filter.category) {
                return false;
            }
            // 关键词过滤
            if (filter.keywords && filter.keywords.length > 0) {
                const hasKeywords = filter.keywords.some(keyword => ext.metadata.keywords.includes(keyword));
                if (!hasKeywords) {
                    return false;
                }
            }
            // 时间范围过滤
            if (filter.createdAfter && new Date(ext.lifecycle.installDate) < new Date(filter.createdAfter)) {
                return false;
            }
            if (filter.createdBefore && new Date(ext.lifecycle.installDate) > new Date(filter.createdBefore)) {
                return false;
            }
            if (filter.lastUpdateAfter && new Date(ext.timestamp) < new Date(filter.lastUpdateAfter)) {
                return false;
            }
            if (filter.lastUpdateBefore && new Date(ext.timestamp) > new Date(filter.lastUpdateBefore)) {
                return false;
            }
            // 错误状态过滤
            if (filter.hasErrors !== undefined) {
                const hasErrors = ext.status === 'error' || ext.lifecycle.errorCount > 0;
                if (filter.hasErrors !== hasErrors) {
                    return false;
                }
            }
            // 活动状态过滤
            if (filter.isActive !== undefined) {
                const isActive = ext.status === 'active';
                if (filter.isActive !== isActive) {
                    return false;
                }
            }
            // 健康状态过滤
            if (filter.healthStatus && ext.performanceMetrics.healthStatus !== filter.healthStatus) {
                return false;
            }
            // 性能阈值过滤
            if (filter.performanceThreshold) {
                const { errorRate, availability, responseTime } = filter.performanceThreshold;
                if (errorRate !== undefined && ext.performanceMetrics.errorRate > errorRate) {
                    return false;
                }
                if (availability !== undefined && ext.performanceMetrics.availability < availability) {
                    return false;
                }
                if (responseTime !== undefined && ext.performanceMetrics.executionTime > responseTime) {
                    return false;
                }
            }
            // 扩展点类型过滤
            if (filter.hasExtensionPointType) {
                const hasType = ext.extensionPoints.some(ep => ep.type === filter.hasExtensionPointType);
                if (!hasType) {
                    return false;
                }
            }
            // API扩展过滤
            if (filter.hasApiExtensions !== undefined) {
                const hasApiExtensions = ext.apiExtensions.length > 0;
                if (filter.hasApiExtensions !== hasApiExtensions) {
                    return false;
                }
            }
            // 事件订阅过滤
            if (filter.hasEventSubscriptions !== undefined) {
                const hasEventSubscriptions = ext.eventSubscriptions.length > 0;
                if (filter.hasEventSubscriptions !== hasEventSubscriptions) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * 应用排序
     */
    applySorting(extensions, sort) {
        return extensions.sort((a, b) => {
            for (const sortParam of sort) {
                const aValue = this.getFieldValue(a, sortParam.field);
                const bValue = this.getFieldValue(b, sortParam.field);
                let comparison = 0;
                const aStr = String(aValue || '');
                const bStr = String(bValue || '');
                if (aStr < bStr) {
                    comparison = -1;
                }
                else if (aStr > bStr) {
                    comparison = 1;
                }
                if (comparison !== 0) {
                    return sortParam.direction === 'desc' ? -comparison : comparison;
                }
            }
            return 0;
        });
    }
    /**
     * 获取字段值
     */
    getFieldValue(extension, field) {
        const parts = field.split('.');
        let value = extension;
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            }
            else {
                value = undefined;
                break;
            }
        }
        return value;
    }
    /**
     * 计算平均值
     */
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }
    /**
     * 获取性能指标值
     */
    getMetricValue(metrics, metric) {
        switch (metric) {
            case 'responseTime':
                return metrics.executionTime;
            case 'throughput':
                return metrics.throughput;
            case 'availability':
                return metrics.availability;
            case 'efficiencyScore':
                return metrics.efficiencyScore;
            default:
                return 0;
        }
    }
    /**
     * 检查版本是否较旧
     */
    isVersionOlder(version1, version2) {
        // 简单的版本比较逻辑
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            if (v1Part < v2Part)
                return true;
            if (v1Part > v2Part)
                return false;
        }
        return false;
    }
    /**
     * 检查版本兼容性
     */
    isVersionCompatible(requiredVersion, currentVersion) {
        // 简单的兼容性检查逻辑
        // 这里可以实现更复杂的语义版本兼容性检查
        return !this.isVersionOlder(currentVersion, requiredVersion);
    }
}
exports.ExtensionRepository = ExtensionRepository;
//# sourceMappingURL=extension.repository.js.map