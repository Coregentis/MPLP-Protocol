"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryContextRepository = void 0;
class MemoryContextRepository {
    contexts = new Map();
    nameIndex = new Map();
    async findById(contextId) {
        return this.contexts.get(contextId) || null;
    }
    async findByName(name) {
        const contextId = this.nameIndex.get(name);
        if (!contextId)
            return null;
        return this.contexts.get(contextId) || null;
    }
    async save(context) {
        const contextId = context.contextId;
        this.contexts.set(contextId, context);
        this.nameIndex.set(context.name, contextId);
        return context;
    }
    async update(context) {
        const contextId = context.contextId;
        if (!this.contexts.has(contextId)) {
            throw new Error(`Context with ID '${contextId}' not found`);
        }
        this.contexts.set(contextId, context);
        this.nameIndex.set(context.name, contextId);
        return context;
    }
    async delete(contextId) {
        const context = this.contexts.get(contextId);
        if (!context)
            return false;
        this.contexts.delete(contextId);
        this.nameIndex.delete(context.name);
        return true;
    }
    async exists(contextId) {
        return this.contexts.has(contextId);
    }
    async findAll(pagination) {
        const allContexts = Array.from(this.contexts.values());
        return this.applyPagination(allContexts, pagination);
    }
    async findByFilter(filter, pagination) {
        let contexts = Array.from(this.contexts.values());
        contexts = contexts.filter(context => this.matchesFilter(context, filter));
        return this.applyPagination(contexts, pagination);
    }
    async findByStatus(status, pagination) {
        const statusArray = Array.isArray(status) ? status : [status];
        const contexts = Array.from(this.contexts.values())
            .filter(context => statusArray.includes(context.status));
        return this.applyPagination(contexts, pagination);
    }
    async findByLifecycleStage(stage, pagination) {
        const stageArray = Array.isArray(stage) ? stage : [stage];
        const contexts = Array.from(this.contexts.values())
            .filter(context => stageArray.includes(context.lifecycleStage));
        return this.applyPagination(contexts, pagination);
    }
    async findByOwner(ownerId, pagination) {
        const contexts = Array.from(this.contexts.values())
            .filter(context => context.accessControl.owner.userId === ownerId);
        return this.applyPagination(contexts, pagination);
    }
    async searchByName(namePattern, pagination) {
        const pattern = namePattern.toLowerCase();
        const contexts = Array.from(this.contexts.values())
            .filter(context => context.name.toLowerCase().includes(pattern));
        return this.applyPagination(contexts, pagination);
    }
    async count() {
        return this.contexts.size;
    }
    async countByFilter(filter) {
        const contexts = Array.from(this.contexts.values())
            .filter(context => this.matchesFilter(context, filter));
        return contexts.length;
    }
    async countByStatus(status) {
        const statusArray = Array.isArray(status) ? status : [status];
        const contexts = Array.from(this.contexts.values())
            .filter(context => statusArray.includes(context.status));
        return contexts.length;
    }
    async countByLifecycleStage(stage) {
        const stageArray = Array.isArray(stage) ? stage : [stage];
        const contexts = Array.from(this.contexts.values())
            .filter(context => stageArray.includes(context.lifecycleStage));
        return contexts.length;
    }
    async saveMany(contexts) {
        const results = [];
        for (const context of contexts) {
            const saved = await this.save(context);
            results.push(saved);
        }
        return results;
    }
    async updateMany(contexts) {
        const results = [];
        for (const context of contexts) {
            const updated = await this.update(context);
            results.push(updated);
        }
        return results;
    }
    async deleteMany(contextIds) {
        let deletedCount = 0;
        for (const contextId of contextIds) {
            const deleted = await this.delete(contextId);
            if (deleted)
                deletedCount++;
        }
        return deletedCount;
    }
    async deleteByFilter(filter) {
        const contextsToDelete = Array.from(this.contexts.values())
            .filter(context => this.matchesFilter(context, filter));
        const contextIds = contextsToDelete.map(context => context.contextId);
        return await this.deleteMany(contextIds);
    }
    async executeInTransaction(operation) {
        return await operation(this);
    }
    async clearCache() {
        this.contexts.clear();
        this.nameIndex.clear();
    }
    async clearCacheForContext(contextId) {
        await this.delete(contextId);
    }
    async healthCheck() {
        try {
            const contextCount = this.contexts.size;
            const nameIndexCount = this.nameIndex.size;
            return contextCount === nameIndexCount;
        }
        catch {
            return false;
        }
    }
    async getStatistics() {
        const [totalContexts, activeContexts, suspendedContexts, completedContexts, terminatedContexts] = await Promise.all([
            this.count(),
            this.countByStatus('active'),
            this.countByStatus('suspended'),
            this.countByStatus('completed'),
            this.countByStatus('terminated')
        ]);
        return {
            totalContexts,
            activeContexts,
            suspendedContexts,
            completedContexts,
            terminatedContexts,
            cacheHitRate: 100,
            averageResponseTime: 1
        };
    }
    matchesFilter(context, filter) {
        if (filter.status) {
            const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
            if (!statusArray.includes(context.status))
                return false;
        }
        if (filter.lifecycleStage) {
            const stageArray = Array.isArray(filter.lifecycleStage) ? filter.lifecycleStage : [filter.lifecycleStage];
            if (!stageArray.includes(context.lifecycleStage))
                return false;
        }
        if (filter.owner) {
            const ownerValue = typeof context.accessControl.owner === 'string'
                ? context.accessControl.owner
                : context.accessControl.owner?.userId;
            if (ownerValue !== filter.owner)
                return false;
        }
        if (filter.createdAfter) {
            if (new Date(context.timestamp) < new Date(filter.createdAfter))
                return false;
        }
        if (filter.createdBefore) {
            if (new Date(context.timestamp) > new Date(filter.createdBefore))
                return false;
        }
        if (filter.namePattern) {
            const pattern = filter.namePattern.toLowerCase();
            if (!context.name.toLowerCase().includes(pattern))
                return false;
        }
        return true;
    }
    applyPagination(items, pagination) {
        if (!pagination) {
            return {
                data: items,
                total: items.length,
                page: 1,
                limit: items.length,
                totalPages: 1
            };
        }
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;
        const paginatedItems = items.slice(offset, offset + limit);
        const totalPages = Math.ceil(items.length / limit);
        return {
            data: paginatedItems,
            total: items.length,
            page,
            limit,
            totalPages
        };
    }
}
exports.MemoryContextRepository = MemoryContextRepository;
