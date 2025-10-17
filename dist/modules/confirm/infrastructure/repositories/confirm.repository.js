"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryConfirmRepository = void 0;
const confirm_entity_1 = require("../../domain/entities/confirm.entity");
class MemoryConfirmRepository {
    confirms = new Map();
    async create(confirm) {
        this.confirms.set(confirm.confirmId, confirm);
        return confirm;
    }
    async findById(confirmId) {
        return this.confirms.get(confirmId) || null;
    }
    async update(confirmId, updates) {
        const existing = this.confirms.get(confirmId);
        if (!existing) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        const updated = new confirm_entity_1.ConfirmEntity({
            protocolVersion: existing.protocolVersion,
            timestamp: new Date(),
            confirmId: existing.confirmId,
            contextId: existing.contextId,
            planId: existing.planId,
            confirmationType: updates.confirmationType || existing.confirmationType,
            status: updates.status || existing.status,
            priority: updates.priority || existing.priority,
            requester: updates.requester || existing.requester,
            approvalWorkflow: updates.approvalWorkflow || existing.approvalWorkflow,
            subject: updates.subject || existing.subject,
            riskAssessment: updates.riskAssessment || existing.riskAssessment
        });
        this.confirms.set(confirmId, updated);
        return updated;
    }
    async delete(confirmId) {
        if (!this.confirms.has(confirmId)) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        this.confirms.delete(confirmId);
    }
    async findAll(pagination) {
        const allConfirms = Array.from(this.confirms.values());
        return this.paginateResults(allConfirms, pagination);
    }
    async findByFilter(filter, pagination) {
        let results = Array.from(this.confirms.values());
        if (filter.confirmationType && filter.confirmationType.length > 0) {
            results = results.filter(confirm => filter.confirmationType.includes(confirm.confirmationType));
        }
        if (filter.status && filter.status.length > 0) {
            results = results.filter(confirm => filter.status.includes(confirm.status));
        }
        if (filter.priority && filter.priority.length > 0) {
            results = results.filter(confirm => filter.priority.includes(confirm.priority));
        }
        if (filter.requesterId) {
            results = results.filter(confirm => confirm.requester.userId === filter.requesterId);
        }
        if (filter.approverId) {
            results = results.filter(confirm => confirm.approvalWorkflow.steps.some(step => step.approver.userId === filter.approverId));
        }
        if (filter.contextId) {
            results = results.filter(confirm => confirm.contextId === filter.contextId);
        }
        if (filter.planId) {
            results = results.filter(confirm => confirm.planId === filter.planId);
        }
        if (filter.createdAfter) {
            results = results.filter(confirm => confirm.timestamp >= filter.createdAfter);
        }
        if (filter.createdBefore) {
            results = results.filter(confirm => confirm.timestamp <= filter.createdBefore);
        }
        if (filter.riskLevel && filter.riskLevel.length > 0) {
            results = results.filter(confirm => filter.riskLevel.includes(confirm.riskAssessment.overallRiskLevel));
        }
        if (filter.workflowType && filter.workflowType.length > 0) {
            results = results.filter(confirm => filter.workflowType.includes(confirm.approvalWorkflow.workflowType));
        }
        return this.paginateResults(results, pagination);
    }
    async findByContextId(contextId, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.contextId === contextId);
        return this.paginateResults(results, pagination);
    }
    async findByPlanId(planId, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.planId === planId);
        return this.paginateResults(results, pagination);
    }
    async findByRequesterId(requesterId, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.requester.userId === requesterId);
        return this.paginateResults(results, pagination);
    }
    async findByApproverId(approverId, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.approvalWorkflow.steps.some(step => step.approver.userId === approverId));
        return this.paginateResults(results, pagination);
    }
    async findByStatus(status, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.status === status);
        return this.paginateResults(results, pagination);
    }
    async findByType(confirmationType, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.confirmationType === confirmationType);
        return this.paginateResults(results, pagination);
    }
    async findByPriority(priority, pagination) {
        const results = Array.from(this.confirms.values()).filter(confirm => confirm.priority === priority);
        return this.paginateResults(results, pagination);
    }
    async findByTimeRange(timeRange, pagination) {
        const allConfirms = Array.from(this.confirms.values());
        const filteredConfirms = allConfirms.filter(confirm => {
            const confirmTime = confirm.timestamp.getTime();
            return confirmTime >= timeRange.startDate.getTime() && confirmTime <= timeRange.endDate.getTime();
        });
        if (pagination) {
            const offset = pagination.offset || ((pagination.page || 1) - 1) * (pagination.limit || 10);
            const limit = pagination.limit || 10;
            return filteredConfirms.slice(offset, offset + limit);
        }
        return filteredConfirms;
    }
    async count(filter) {
        if (!filter) {
            return this.confirms.size;
        }
        const results = await this.findByFilter(filter);
        return results.total;
    }
    async exists(confirmId) {
        return this.confirms.has(confirmId);
    }
    async createBatch(confirms) {
        const results = [];
        for (const confirm of confirms) {
            const created = await this.create(confirm);
            results.push(created);
        }
        return results;
    }
    async updateBatch(updates) {
        const results = [];
        for (const { confirmId, updates: updateData } of updates) {
            const updated = await this.update(confirmId, updateData);
            results.push(updated);
        }
        return results;
    }
    async deleteBatch(confirmIds) {
        for (const confirmId of confirmIds) {
            await this.delete(confirmId);
        }
    }
    async clear() {
        this.confirms.clear();
    }
    async getStatistics() {
        const allConfirms = Array.from(this.confirms.values());
        const byStatus = {};
        const byType = {};
        const byPriority = {};
        for (const confirm of allConfirms) {
            byStatus[confirm.status] = (byStatus[confirm.status] || 0) + 1;
            byType[confirm.confirmationType] = (byType[confirm.confirmationType] || 0) + 1;
            byPriority[confirm.priority] = (byPriority[confirm.priority] || 0) + 1;
        }
        return {
            total: allConfirms.length,
            byStatus,
            byType,
            byPriority
        };
    }
    paginateResults(items, pagination) {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const offset = pagination?.offset || (page - 1) * limit;
        const total = items.length;
        const paginatedItems = items.slice(offset, offset + limit);
        return {
            items: paginatedItems,
            total,
            page,
            limit,
            hasNext: offset + limit < total,
            hasPrevious: offset > 0
        };
    }
}
exports.MemoryConfirmRepository = MemoryConfirmRepository;
