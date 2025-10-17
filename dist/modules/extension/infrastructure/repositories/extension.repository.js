"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionRepository = void 0;
class ExtensionRepository {
    extensions = new Map();
    nameIndex = new Map();
    contextIndex = new Map();
    typeIndex = new Map();
    statusIndex = new Map();
    async create(extension) {
        if (this.extensions.has(extension.extensionId)) {
            throw new Error(`Extension with ID '${extension.extensionId}' already exists`);
        }
        if (this.nameIndex.has(extension.name)) {
            throw new Error(`Extension with name '${extension.name}' already exists`);
        }
        this.extensions.set(extension.extensionId, { ...extension });
        this.updateIndexes(extension, 'create');
        return { ...extension };
    }
    async findById(extensionId) {
        const extension = this.extensions.get(extensionId);
        return extension ? { ...extension } : null;
    }
    async update(extensionId, updates) {
        const existingExtension = this.extensions.get(extensionId);
        if (!existingExtension) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        if (updates.name && updates.name !== existingExtension.name) {
            if (this.nameIndex.has(updates.name)) {
                throw new Error(`Extension with name '${updates.name}' already exists`);
            }
        }
        const updatedExtension = {
            ...existingExtension,
            ...updates,
            timestamp: new Date().toISOString()
        };
        this.extensions.set(extensionId, updatedExtension);
        this.updateIndexes(existingExtension, 'delete');
        this.updateIndexes(updatedExtension, 'create');
        return { ...updatedExtension };
    }
    async delete(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (!extension) {
            return false;
        }
        this.extensions.delete(extensionId);
        this.updateIndexes(extension, 'delete');
        return true;
    }
    async findByFilter(filter, pagination, sort) {
        let results = Array.from(this.extensions.values());
        results = this.applyFilters(results, filter);
        if (sort && sort.length > 0) {
            results = this.applySorting(results, sort);
        }
        const total = results.length;
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
    async findByContextId(contextId) {
        const extensionIds = this.contextIndex.get(contextId) || [];
        return extensionIds
            .map(id => this.extensions.get(id))
            .filter((ext) => ext !== undefined)
            .map(ext => ({ ...ext }));
    }
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
    async findByStatus(status) {
        const extensionIds = this.statusIndex.get(status) || [];
        return extensionIds
            .map(id => this.extensions.get(id))
            .filter((ext) => ext !== undefined)
            .map(ext => ({ ...ext }));
    }
    async findAll() {
        return Array.from(this.extensions.values()).map(ext => ({ ...ext }));
    }
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
    async search(searchTerm, searchFields = ['name', 'displayName', 'description'], pagination) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        let results = Array.from(this.extensions.values()).filter(ext => {
            return searchFields.some(field => {
                const value = this.getFieldValue(ext, field);
                return value && value.toString().toLowerCase().includes(lowerSearchTerm);
            });
        });
        const total = results.length;
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
    async count(filter) {
        if (!filter) {
            return this.extensions.size;
        }
        const results = this.applyFilters(Array.from(this.extensions.values()), filter);
        return results.length;
    }
    async exists(extensionId) {
        return this.extensions.has(extensionId);
    }
    async nameExists(name, excludeId) {
        const existingId = this.nameIndex.get(name);
        if (!existingId) {
            return false;
        }
        return excludeId ? existingId !== excludeId : true;
    }
    async getStatistics(filter) {
        let extensions = Array.from(this.extensions.values());
        if (filter) {
            extensions = this.applyFilters(extensions, filter);
        }
        const totalExtensions = extensions.length;
        const activeExtensions = extensions.filter(ext => ext.status === 'active').length;
        const inactiveExtensions = extensions.filter(ext => ext.status === 'inactive').length;
        const errorExtensions = extensions.filter(ext => ext.status === 'error').length;
        const extensionsByType = {
            plugin: 0,
            adapter: 0,
            connector: 0,
            middleware: 0,
            hook: 0,
            transformer: 0
        };
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
        const performanceMetrics = extensions.map(ext => ext.performanceMetrics);
        const averagePerformanceMetrics = {
            responseTime: this.calculateAverage(performanceMetrics.map(m => m.executionTime)),
            errorRate: this.calculateAverage(performanceMetrics.map(m => m.errorRate)),
            availability: this.calculateAverage(performanceMetrics.map(m => m.availability)),
            throughput: this.calculateAverage(performanceMetrics.map(m => m.throughput))
        };
        const topPerformingExtensions = extensions
            .sort((a, b) => b.performanceMetrics.efficiencyScore - a.performanceMetrics.efficiencyScore)
            .slice(0, 5)
            .map(ext => ({
            extensionId: ext.extensionId,
            name: ext.name,
            performanceScore: ext.performanceMetrics.efficiencyScore
        }));
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
    async updateStatusBatch(extensionIds, status) {
        const updates = extensionIds.map(id => ({
            extensionId: id,
            updates: { status, timestamp: new Date().toISOString() }
        }));
        return await this.updateBatch(updates);
    }
    async findActiveExtensions(contextId) {
        let results = await this.findByStatus('active');
        if (contextId) {
            results = results.filter(ext => ext.contextId === contextId);
        }
        return results;
    }
    async findExtensionsWithErrors(contextId) {
        let results = Array.from(this.extensions.values())
            .filter(ext => ext.status === 'error' || ext.lifecycle.errorCount > 0);
        if (contextId) {
            results = results.filter(ext => ext.contextId === contextId);
        }
        return results.map(ext => ({ ...ext }));
    }
    async findExtensionsNeedingUpdate(currentVersion) {
        return Array.from(this.extensions.values())
            .filter(ext => this.isVersionOlder(ext.version, currentVersion))
            .map(ext => ({ ...ext }));
    }
    async findCompatibleExtensions(mplpVersion, requiredModules) {
        return Array.from(this.extensions.values())
            .filter(ext => {
            if (!this.isVersionCompatible(ext.compatibility.mplpVersion, mplpVersion)) {
                return false;
            }
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
    async findExtensionsWithExtensionPoint(extensionPointType) {
        return Array.from(this.extensions.values())
            .filter(ext => ext.extensionPoints.some(ep => ep.type === extensionPointType))
            .map(ext => ({ ...ext }));
    }
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
    async findExtensionsSubscribedToEvent(eventPattern) {
        return Array.from(this.extensions.values())
            .filter(ext => ext.eventSubscriptions.some(sub => sub.eventPattern === eventPattern))
            .map(ext => ({ ...ext }));
    }
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
    async findTopPerformingExtensions(limit = 10, metric = 'efficiencyScore') {
        const extensions = Array.from(this.extensions.values());
        extensions.sort((a, b) => {
            const aValue = this.getMetricValue(a.performanceMetrics, metric);
            const bValue = this.getMetricValue(b.performanceMetrics, metric);
            return metric === 'responseTime' ? aValue - bValue : bValue - aValue;
        });
        return extensions.slice(0, limit).map(ext => ({ ...ext }));
    }
    async findRecentlyUpdatedExtensions(limit = 10, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return Array.from(this.extensions.values())
            .filter(ext => new Date(ext.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)
            .map(ext => ({ ...ext }));
    }
    async clear() {
        this.extensions.clear();
        this.nameIndex.clear();
        this.contextIndex.clear();
        this.typeIndex.clear();
        this.statusIndex.clear();
    }
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
    async optimize() {
    }
    updateIndexes(extension, operation) {
        if (operation === 'create') {
            this.nameIndex.set(extension.name, extension.extensionId);
            const contextExtensions = this.contextIndex.get(extension.contextId) || [];
            contextExtensions.push(extension.extensionId);
            this.contextIndex.set(extension.contextId, contextExtensions);
            const typeExtensions = this.typeIndex.get(extension.extensionType) || [];
            typeExtensions.push(extension.extensionId);
            this.typeIndex.set(extension.extensionType, typeExtensions);
            const statusExtensions = this.statusIndex.get(extension.status) || [];
            statusExtensions.push(extension.extensionId);
            this.statusIndex.set(extension.status, statusExtensions);
        }
        else if (operation === 'delete') {
            this.nameIndex.delete(extension.name);
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
    applyFilters(extensions, filter) {
        return extensions.filter(ext => {
            if (filter.contextId && ext.contextId !== filter.contextId) {
                return false;
            }
            if (filter.extensionType) {
                const types = Array.isArray(filter.extensionType) ? filter.extensionType : [filter.extensionType];
                if (!types.includes(ext.extensionType)) {
                    return false;
                }
            }
            if (filter.status) {
                const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
                if (!statuses.includes(ext.status)) {
                    return false;
                }
            }
            if (filter.name && !ext.name.toLowerCase().includes(filter.name.toLowerCase())) {
                return false;
            }
            if (filter.version && ext.version !== filter.version) {
                return false;
            }
            if (filter.author && ext.metadata.author.name !== filter.author) {
                return false;
            }
            if (filter.organization && ext.metadata.organization?.name !== filter.organization) {
                return false;
            }
            if (filter.category && ext.metadata.category !== filter.category) {
                return false;
            }
            if (filter.keywords && filter.keywords.length > 0) {
                const hasKeywords = filter.keywords.some(keyword => ext.metadata.keywords.includes(keyword));
                if (!hasKeywords) {
                    return false;
                }
            }
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
            if (filter.hasErrors !== undefined) {
                const hasErrors = ext.status === 'error' || ext.lifecycle.errorCount > 0;
                if (filter.hasErrors !== hasErrors) {
                    return false;
                }
            }
            if (filter.isActive !== undefined) {
                const isActive = ext.status === 'active';
                if (filter.isActive !== isActive) {
                    return false;
                }
            }
            if (filter.healthStatus && ext.performanceMetrics.healthStatus !== filter.healthStatus) {
                return false;
            }
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
            if (filter.hasExtensionPointType) {
                const hasType = ext.extensionPoints.some(ep => ep.type === filter.hasExtensionPointType);
                if (!hasType) {
                    return false;
                }
            }
            if (filter.hasApiExtensions !== undefined) {
                const hasApiExtensions = ext.apiExtensions.length > 0;
                if (filter.hasApiExtensions !== hasApiExtensions) {
                    return false;
                }
            }
            if (filter.hasEventSubscriptions !== undefined) {
                const hasEventSubscriptions = ext.eventSubscriptions.length > 0;
                if (filter.hasEventSubscriptions !== hasEventSubscriptions) {
                    return false;
                }
            }
            return true;
        });
    }
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
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }
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
    isVersionOlder(version1, version2) {
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
    isVersionCompatible(requiredVersion, currentVersion) {
        return !this.isVersionOlder(currentVersion, requiredVersion);
    }
}
exports.ExtensionRepository = ExtensionRepository;
