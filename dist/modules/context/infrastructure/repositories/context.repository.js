"use strict";
/**
 * Context仓库实现
 *
 * @description Context模块的仓库实现，提供数据持久化功能
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryContextRepository = void 0;
/**
 * 内存Context仓库实现
 *
 * @description 基于内存的Context仓库实现，用于开发和测试
 * @note 生产环境应替换为数据库实现
 */
class MemoryContextRepository {
    constructor() {
        this.contexts = new Map();
        this.nameIndex = new Map();
    }
    // ===== 基础CRUD操作 =====
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
        // 更新主索引
        this.contexts.set(contextId, context);
        // 更新名称索引
        this.nameIndex.set(context.name, contextId);
        return context;
    }
    async update(context) {
        const contextId = context.contextId;
        // 检查是否存在
        if (!this.contexts.has(contextId)) {
            throw new Error(`Context with ID '${contextId}' not found`);
        }
        // 更新主索引
        this.contexts.set(contextId, context);
        // 更新名称索引
        this.nameIndex.set(context.name, contextId);
        return context;
    }
    async delete(contextId) {
        const context = this.contexts.get(contextId);
        if (!context)
            return false;
        // 从主索引删除
        this.contexts.delete(contextId);
        // 从名称索引删除
        this.nameIndex.delete(context.name);
        return true;
    }
    async exists(contextId) {
        return this.contexts.has(contextId);
    }
    // ===== 查询操作 =====
    async findAll(pagination) {
        const allContexts = Array.from(this.contexts.values());
        return this.applyPagination(allContexts, pagination);
    }
    async findByFilter(filter, pagination) {
        let contexts = Array.from(this.contexts.values());
        // 应用过滤条件
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
    // ===== 统计操作 =====
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
    // ===== 批量操作 =====
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
    // ===== 事务操作 =====
    async executeInTransaction(operation) {
        // 内存实现不需要真正的事务，直接执行操作
        return await operation(this);
    }
    // ===== 缓存操作 =====
    async clearCache() {
        // 内存实现清空所有数据
        this.contexts.clear();
        this.nameIndex.clear();
    }
    async clearCacheForContext(contextId) {
        // 内存实现删除特定Context
        await this.delete(contextId);
    }
    // ===== 健康检查 =====
    async healthCheck() {
        try {
            // 简单的健康检查：验证数据结构完整性
            const contextCount = this.contexts.size;
            const nameIndexCount = this.nameIndex.size;
            // 验证索引一致性
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
            cacheHitRate: 100, // 内存实现始终命中
            averageResponseTime: 1 // 内存实现响应时间很快
        };
    }
    // ===== 私有辅助方法 =====
    /**
     * 检查Context是否匹配过滤条件
     */
    matchesFilter(context, filter) {
        // 状态过滤
        if (filter.status) {
            const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
            if (!statusArray.includes(context.status))
                return false;
        }
        // 生命周期阶段过滤
        if (filter.lifecycleStage) {
            const stageArray = Array.isArray(filter.lifecycleStage) ? filter.lifecycleStage : [filter.lifecycleStage];
            if (!stageArray.includes(context.lifecycleStage))
                return false;
        }
        // 所有者过滤
        if (filter.owner) {
            // 处理不同的owner结构
            const ownerValue = typeof context.accessControl.owner === 'string'
                ? context.accessControl.owner
                : context.accessControl.owner?.userId;
            if (ownerValue !== filter.owner)
                return false;
        }
        // 时间范围过滤
        if (filter.createdAfter) {
            if (new Date(context.timestamp) < new Date(filter.createdAfter))
                return false;
        }
        if (filter.createdBefore) {
            if (new Date(context.timestamp) > new Date(filter.createdBefore))
                return false;
        }
        // 名称模式过滤
        if (filter.namePattern) {
            const pattern = filter.namePattern.toLowerCase();
            if (!context.name.toLowerCase().includes(pattern))
                return false;
        }
        return true;
    }
    /**
     * 应用分页
     */
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
//# sourceMappingURL=context.repository.js.map