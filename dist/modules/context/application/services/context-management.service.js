"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManagementService = void 0;
const context_entity_1 = require("../../domain/entities/context.entity");
class ContextManagementService {
    contextRepository;
    logger;
    cacheManager;
    versionManager;
    constructor(contextRepository, logger, cacheManager, versionManager) {
        this.contextRepository = contextRepository;
        this.logger = logger;
        this.cacheManager = cacheManager;
        this.versionManager = versionManager;
    }
    async createContext(data) {
        try {
            this.logger.info('Creating new context', { name: data.name });
            await this.validateCreateData(data);
            const existingContext = await this.contextRepository.findByName(data.name);
            if (existingContext) {
                throw new Error(`Context with name '${data.name}' already exists`);
            }
            const context = new context_entity_1.ContextEntity({
                ...data,
                contextId: this.generateContextId(),
                status: 'active',
                lifecycleStage: 'planning',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0'
            });
            const savedContext = await this.contextRepository.save(context);
            await this.cacheManager.set(`context:${savedContext.contextId}`, savedContext, 3600);
            await this.versionManager.createVersion(savedContext);
            await this.handleContextLifecycleEvent(savedContext.contextId, 'created', {
                name: savedContext.name,
                createdAt: savedContext.createdAt
            });
            this.logger.info('Context created successfully', {
                contextId: savedContext.contextId,
                name: savedContext.name
            });
            return savedContext;
        }
        catch (error) {
            this.logger.error('Failed to create context', error, { name: data.name });
            throw error;
        }
    }
    async getContext(contextId) {
        try {
            const cached = await this.cacheManager.get(`context:${contextId}`);
            if (cached) {
                this.logger.debug('Context retrieved from cache', { contextId });
                return cached;
            }
            const context = await this.contextRepository.findById(contextId);
            if (context) {
                await this.cacheManager.set(`context:${contextId}`, context, 3600);
                this.logger.debug('Context cached after database retrieval', { contextId });
            }
            return context;
        }
        catch (error) {
            this.logger.error('Failed to get context', error, { contextId });
            throw error;
        }
    }
    async getContextById(contextId) {
        return this.getContext(contextId);
    }
    async getContextByName(name) {
        try {
            this.logger.debug('Getting context by name', { name });
            const context = await this.contextRepository.findByName(name);
            return context;
        }
        catch (error) {
            this.logger.error('Failed to get context by name', error, { name });
            throw error;
        }
    }
    async queryContexts(filter, pagination) {
        try {
            this.logger.debug('Querying contexts', { filter, pagination });
            if (filter) {
                return await this.contextRepository.findByFilter(filter, pagination);
            }
            else {
                return await this.contextRepository.findAll(pagination);
            }
        }
        catch (error) {
            this.logger.error('Failed to query contexts', error, { filter, pagination });
            throw error;
        }
    }
    async searchContexts(query, pagination) {
        try {
            const searchQuery = typeof query === 'string' ? query : query.query;
            this.logger.debug('Searching contexts', { query: searchQuery, pagination });
            const result = await this.contextRepository.findAll(pagination);
            const filteredData = result.data.filter((context) => context.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (context.description && context.description.toLowerCase().includes(searchQuery.toLowerCase())));
            return {
                data: filteredData,
                total: filteredData.length,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(filteredData.length / (result.limit || filteredData.length))
            };
        }
        catch (error) {
            this.logger.error('Failed to search contexts', error, { query });
            throw error;
        }
    }
    async getContextStatistics() {
        try {
            this.logger.debug('Getting context statistics');
            const result = await this.contextRepository.findAll();
            const allContexts = result.data;
            const stats = {
                total: allContexts.length,
                byStatus: {},
                byLifecycleStage: {}
            };
            allContexts.forEach(context => {
                stats.byStatus[context.status] = (stats.byStatus[context.status] || 0) + 1;
                stats.byLifecycleStage[context.lifecycleStage] = (stats.byLifecycleStage[context.lifecycleStage] || 0) + 1;
            });
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get context statistics', error);
            throw error;
        }
    }
    async createMultipleContexts(requests) {
        try {
            this.logger.info('Creating multiple contexts', { count: requests.length });
            const results = [];
            for (const request of requests) {
                const context = await this.createContext(request);
                results.push(context);
            }
            this.logger.info('Multiple contexts created successfully', {
                count: results.length
            });
            return results;
        }
        catch (error) {
            this.logger.error('Failed to create multiple contexts', error, {
                requestCount: requests.length
            });
            throw error;
        }
    }
    async updateContext(contextId, data) {
        try {
            this.logger.info('Updating context', { contextId });
            const existingContext = await this.getContext(contextId);
            if (!existingContext) {
                throw new Error(`Context with ID '${contextId}' not found`);
            }
            await this.validateUpdateData(data);
            if (data.name && data.name !== existingContext.name) {
                const nameConflict = await this.contextRepository.findByName(data.name);
                if (nameConflict && nameConflict.contextId !== contextId) {
                    throw new Error(`Context with name '${data.name}' already exists`);
                }
            }
            const updatedContext = existingContext.update({
                ...data,
                updatedAt: new Date(),
                version: this.incrementVersion(existingContext.version || '1.0.0')
            });
            const savedContext = await this.contextRepository.update(updatedContext);
            await this.cacheManager.set(`context:${contextId}`, savedContext, 3600);
            await this.versionManager.createVersion(savedContext);
            await this.handleContextLifecycleEvent(contextId, 'updated', {
                changes: data,
                version: savedContext.version
            });
            this.logger.info('Context updated successfully', {
                contextId,
                version: savedContext.version
            });
            return savedContext;
        }
        catch (error) {
            this.logger.error('Failed to update context', error, { contextId });
            throw error;
        }
    }
    async deleteContext(contextId) {
        try {
            this.logger.info('Deleting context', { contextId });
            const context = await this.getContext(contextId);
            if (!context) {
                throw new Error(`Context with ID '${contextId}' not found`);
            }
            if (!this.canBeDeleted(context)) {
                throw new Error(`Context '${context.name}' cannot be deleted in current state: ${context.status}`);
            }
            await this.contextRepository.delete(contextId);
            await this.cacheManager.delete(`context:${contextId}`);
            await this.handleContextLifecycleEvent(contextId, 'terminated', {
                name: context.name,
                deletedAt: new Date()
            });
            this.logger.info('Context deleted successfully', { contextId });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete context', error, { contextId });
            throw error;
        }
    }
    async transitionLifecycleStage(contextId, newStage) {
        try {
            this.logger.info('Transitioning lifecycle stage', { contextId, newStage });
            const context = await this.getContext(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            this.validateLifecycleTransition(context.lifecycleStage, newStage);
            const updatedContext = await this.updateContext(contextId, {
                lifecycleStage: newStage,
                status: this.getStatusForLifecycleStage(newStage)
            });
            this.logger.info('Lifecycle stage transitioned successfully', {
                contextId,
                from: context.lifecycleStage,
                to: newStage
            });
            return updatedContext;
        }
        catch (error) {
            this.logger.error('Failed to transition lifecycle stage', error, { contextId, newStage });
            throw error;
        }
    }
    async activateContext(contextId) {
        return await this.updateContext(contextId, { status: 'active' });
    }
    async deactivateContext(contextId) {
        return await this.updateContext(contextId, { status: 'suspended' });
    }
    async syncSharedState(contextId, stateUpdates) {
        try {
            this.logger.info('Syncing shared state', { contextId });
            const context = await this.getContext(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            const mergedState = this.mergeSharedState(context.sharedState, stateUpdates);
            await this.updateContext(contextId, { sharedState: mergedState });
            await this.publishStateChangeEvent(contextId, stateUpdates);
            this.logger.info('Shared state synced successfully', { contextId });
        }
        catch (error) {
            this.logger.error('Failed to sync shared state', error, { contextId });
            throw error;
        }
    }
    async getStateHistory(contextId) {
        return await this.versionManager.getVersionHistory(contextId);
    }
    async compareStateVersions(contextId, version1, version2) {
        return await this.versionManager.compareVersions(contextId, version1, version2);
    }
    async createContexts(requests) {
        try {
            this.logger.info('Creating contexts in batch', { count: requests.length });
            for (const request of requests) {
                await this.validateCreateData(request);
            }
            const names = requests.map(r => r.name);
            for (const name of names) {
                const existing = await this.contextRepository.findByName(name);
                if (existing) {
                    throw new Error(`Context with name '${name}' already exists`);
                }
            }
            const contexts = requests.map(request => new context_entity_1.ContextEntity({
                ...request,
                contextId: this.generateContextId(),
                status: 'active',
                lifecycleStage: 'planning',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0'
            }));
            const savedContexts = await this.contextRepository.saveMany(contexts);
            await Promise.all(savedContexts.map(context => this.cacheManager.set(`context:${context.contextId}`, context, 3600)));
            await Promise.all(savedContexts.map(context => this.versionManager.createVersion(context)));
            this.logger.info('Contexts created in batch successfully', { count: savedContexts.length });
            return savedContexts;
        }
        catch (error) {
            this.logger.error('Failed to create contexts in batch', error, { count: requests.length });
            throw error;
        }
    }
    async listContexts(filter) {
        try {
            this.logger.debug('Listing contexts', { filter });
            if (this.isSimpleFilter(filter)) {
                const cacheKey = `contexts:${JSON.stringify(filter)}`;
                const cached = await this.cacheManager.get(cacheKey);
                if (cached) {
                    return cached;
                }
            }
            const result = await this.contextRepository.findByFilter(filter);
            const contexts = result.data;
            if (this.isSimpleFilter(filter)) {
                const cacheKey = `contexts:${JSON.stringify(filter)}`;
                await this.cacheManager.set(cacheKey, contexts, 300);
            }
            return contexts;
        }
        catch (error) {
            this.logger.error('Failed to list contexts', error, { filter });
            throw error;
        }
    }
    async countContexts(filter) {
        return await this.contextRepository.countByFilter(filter);
    }
    async healthCheck() {
        try {
            return await this.contextRepository.healthCheck();
        }
        catch {
            return false;
        }
    }
    generateContextId() {
        return `context-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async validateCreateData(data) {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Context name cannot be empty');
        }
        if (data.name.length > 255) {
            throw new Error('Context name cannot exceed 255 characters');
        }
        if (data.description && data.description.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
    }
    async validateUpdateData(data) {
        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length === 0) {
                throw new Error('Context name cannot be empty');
            }
            if (data.name.length > 255) {
                throw new Error('Context name cannot exceed 255 characters');
            }
        }
        if (data.description !== undefined && data.description && data.description.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
    }
    validateLifecycleTransition(currentStage, newStage) {
        const validTransitions = {
            'planning': ['executing'],
            'executing': ['monitoring', 'completed'],
            'monitoring': ['executing', 'completed'],
            'completed': []
        };
        const allowedTransitions = validTransitions[currentStage] || [];
        if (!allowedTransitions.includes(newStage)) {
            throw new Error(`Invalid lifecycle transition from ${currentStage} to ${newStage}`);
        }
    }
    getStatusForLifecycleStage(stage) {
        const stageStatusMap = {
            'planning': 'active',
            'executing': 'active',
            'monitoring': 'active',
            'completed': 'completed'
        };
        return stageStatusMap[stage] || 'active';
    }
    canBeDeleted(context) {
        const deletableStatuses = ['suspended', 'completed', 'terminated'];
        return deletableStatuses.includes(context.status);
    }
    mergeSharedState(currentState, updates) {
        return {
            ...currentState,
            variables: {
                ...currentState.variables,
                ...updates.variables
            },
            resources: updates.resources ? { ...currentState.resources, ...updates.resources } : currentState.resources,
            dependencies: updates.dependencies || currentState.dependencies,
            goals: updates.goals || currentState.goals
        };
    }
    async publishStateChangeEvent(contextId, stateUpdates) {
        this.logger.debug('State change event published', { contextId, stateUpdates });
    }
    incrementVersion(currentVersion) {
        const parts = currentVersion.split('.');
        const patch = parseInt(parts[2] || '0') + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }
    isSimpleFilter(filter) {
        const keys = Object.keys(filter);
        return keys.length <= 2 && keys.every(key => ['status', 'lifecycleStage'].includes(key));
    }
    async handleContextLifecycleEvent(contextId, eventType, eventData) {
        try {
            this.logger.info('Context lifecycle event', { contextId, eventType, eventData });
        }
        catch (error) {
            this.logger.error('Failed to handle context lifecycle event', error, { contextId, eventType });
        }
    }
}
exports.ContextManagementService = ContextManagementService;
