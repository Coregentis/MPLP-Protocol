"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCoreRepository = void 0;
const core_entity_1 = require("../../domain/entities/core.entity");
class MemoryCoreRepository {
    entities = new Map();
    async save(entity) {
        this.entities.set(entity.workflowId, entity.clone());
        return entity;
    }
    async findById(workflowId) {
        const entity = this.entities.get(workflowId);
        return entity ? entity.clone() : null;
    }
    async findAll() {
        return Array.from(this.entities.values()).map(entity => entity.clone());
    }
    async findByStatus(status) {
        return Array.from(this.entities.values())
            .filter(entity => entity.executionStatus.status === status)
            .map(entity => entity.clone());
    }
    async findByOrchestratorId(orchestratorId) {
        return Array.from(this.entities.values())
            .filter(entity => entity.orchestratorId === orchestratorId)
            .map(entity => entity.clone());
    }
    async delete(workflowId) {
        return this.entities.delete(workflowId);
    }
    async exists(workflowId) {
        return this.entities.has(workflowId);
    }
    async count() {
        return this.entities.size;
    }
    async findByCriteria(criteria) {
        let results = Array.from(this.entities.values());
        if (criteria.status) {
            results = results.filter(entity => entity.executionStatus.status === criteria.status);
        }
        if (criteria.orchestratorId) {
            results = results.filter(entity => entity.orchestratorId === criteria.orchestratorId);
        }
        if (criteria.userId) {
            results = results.filter(entity => entity.executionContext.userId === criteria.userId);
        }
        if (criteria.startDate) {
            results = results.filter(entity => {
                const entityDate = new Date(entity.timestamp);
                return entityDate >= criteria.startDate;
            });
        }
        if (criteria.endDate) {
            results = results.filter(entity => {
                const entityDate = new Date(entity.timestamp);
                return entityDate <= criteria.endDate;
            });
        }
        return results.map(entity => entity.clone());
    }
    async findWithPagination(offset, limit) {
        const allEntities = Array.from(this.entities.values());
        const total = allEntities.length;
        const entities = allEntities
            .slice(offset, offset + limit)
            .map(entity => entity.clone());
        const hasMore = offset + limit < total;
        return {
            entities,
            total,
            hasMore
        };
    }
    async saveBatch(entities) {
        const savedEntities = [];
        for (const entity of entities) {
            this.entities.set(entity.workflowId, entity.clone());
            savedEntities.push(entity);
        }
        return savedEntities;
    }
    async deleteBatch(workflowIds) {
        let deletedCount = 0;
        for (const workflowId of workflowIds) {
            if (this.entities.delete(workflowId)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async clear() {
        this.entities.clear();
    }
    getMemoryUsage() {
        const entityCount = this.entities.size;
        const memoryEstimate = `${Math.round(entityCount * 2)} KB`;
        return {
            entityCount,
            memoryEstimate
        };
    }
    async exportData() {
        return Array.from(this.entities.values()).map(entity => entity.toJSON());
    }
    async importData(data) {
        let importedCount = 0;
        for (const item of data) {
            try {
                const entity = new core_entity_1.CoreEntity(item);
                this.entities.set(entity.workflowId, entity);
                importedCount++;
            }
            catch (error) {
                continue;
            }
        }
        return importedCount;
    }
    async getStatistics() {
        const entities = Array.from(this.entities.values());
        const totalEntities = entities.length;
        const entitiesByStatus = {
            'created': 0,
            'in_progress': 0,
            'completed': 0,
            'failed': 0,
            'cancelled': 0,
            'paused': 0
        };
        entities.forEach(entity => {
            entitiesByStatus[entity.executionStatus.status]++;
        });
        let oldestEntity;
        let newestEntity;
        if (entities.length > 0) {
            const sortedByTime = entities.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            oldestEntity = {
                workflowId: sortedByTime[0].workflowId,
                timestamp: sortedByTime[0].timestamp
            };
            newestEntity = {
                workflowId: sortedByTime[sortedByTime.length - 1].workflowId,
                timestamp: sortedByTime[sortedByTime.length - 1].timestamp
            };
        }
        return {
            totalEntities,
            entitiesByStatus,
            oldestEntity,
            newestEntity
        };
    }
}
exports.MemoryCoreRepository = MemoryCoreRepository;
