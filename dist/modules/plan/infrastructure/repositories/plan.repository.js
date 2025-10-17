"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRepository = void 0;
class PlanRepository {
    plans = new Map();
    transactionActive = false;
    transactionPlans = null;
    async findById(planId) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        return planMap.get(planId) || null;
    }
    async findByName(name) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        for (const plan of planMap.values()) {
            if (plan.name === name) {
                return plan;
            }
        }
        return null;
    }
    async save(plan) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        planMap.set(plan.planId, plan);
        return plan;
    }
    async update(plan) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        if (!planMap.has(plan.planId)) {
            throw new Error(`Plan with ID ${plan.planId} not found`);
        }
        planMap.set(plan.planId, plan);
        return plan;
    }
    async delete(planId) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        return planMap.delete(planId);
    }
    async exists(planId) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        return planMap.has(planId);
    }
    async findAll(pagination) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        const allPlans = Array.from(planMap.values());
        return this.paginateResults(allPlans, pagination);
    }
    async findByFilter(filter, pagination) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        let filteredPlans = Array.from(planMap.values());
        if (filter.contextId) {
            filteredPlans = filteredPlans.filter(plan => plan.contextId === filter.contextId);
        }
        if (filter.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            filteredPlans = filteredPlans.filter(plan => statuses.includes(plan.status));
        }
        if (filter.priority) {
            const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
            filteredPlans = filteredPlans.filter(plan => plan.priority && priorities.includes(plan.priority));
        }
        if (filter.createdBy) {
            filteredPlans = filteredPlans.filter(plan => plan.createdBy === filter.createdBy);
        }
        if (filter.updatedBy) {
            filteredPlans = filteredPlans.filter(plan => plan.updatedBy === filter.updatedBy);
        }
        if (filter.createdAfter) {
            filteredPlans = filteredPlans.filter(plan => plan.createdAt && plan.createdAt >= filter.createdAfter);
        }
        if (filter.createdBefore) {
            filteredPlans = filteredPlans.filter(plan => plan.createdAt && plan.createdAt <= filter.createdBefore);
        }
        if (filter.updatedAfter) {
            filteredPlans = filteredPlans.filter(plan => plan.updatedAt && plan.updatedAt >= filter.updatedAfter);
        }
        if (filter.updatedBefore) {
            filteredPlans = filteredPlans.filter(plan => plan.updatedAt && plan.updatedAt <= filter.updatedBefore);
        }
        if (filter.namePattern) {
            const pattern = new RegExp(filter.namePattern, 'i');
            filteredPlans = filteredPlans.filter(plan => pattern.test(plan.name));
        }
        if (filter.descriptionPattern && filter.descriptionPattern.trim()) {
            const pattern = new RegExp(filter.descriptionPattern, 'i');
            filteredPlans = filteredPlans.filter(plan => plan.description && pattern.test(plan.description));
        }
        if (filter.hasActiveTasks !== undefined) {
            filteredPlans = filteredPlans.filter(plan => {
                const hasActiveTasks = plan.tasks.some(task => task.status === 'running' || task.status === 'ready');
                return hasActiveTasks === filter.hasActiveTasks;
            });
        }
        if (filter.progressMin !== undefined) {
            filteredPlans = filteredPlans.filter(plan => plan.getProgress() >= filter.progressMin);
        }
        if (filter.progressMax !== undefined) {
            filteredPlans = filteredPlans.filter(plan => plan.getProgress() <= filter.progressMax);
        }
        return this.paginateResults(filteredPlans, pagination);
    }
    async findByStatus(status, pagination) {
        return this.findByFilter({ status }, pagination);
    }
    async findByPriority(priority, pagination) {
        return this.findByFilter({ priority }, pagination);
    }
    async findByContextId(contextId, pagination) {
        return this.findByFilter({ contextId }, pagination);
    }
    async findByCreatedBy(createdBy, pagination) {
        return this.findByFilter({ createdBy }, pagination);
    }
    async searchByName(namePattern, pagination) {
        return this.findByFilter({ namePattern }, pagination);
    }
    async searchByDescription(descriptionPattern, pagination) {
        return this.findByFilter({ descriptionPattern }, pagination);
    }
    async count() {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        return planMap.size;
    }
    async countByStatus(status) {
        const result = await this.findByStatus(status);
        return result.total;
    }
    async countByPriority(priority) {
        const result = await this.findByPriority(priority);
        return result.total;
    }
    async countByContextId(contextId) {
        const result = await this.findByContextId(contextId);
        return result.total;
    }
    async countByCreatedBy(createdBy) {
        const result = await this.findByCreatedBy(createdBy);
        return result.total;
    }
    async findActivePlans(pagination) {
        return this.findByStatus('active', pagination);
    }
    async findExecutablePlans(pagination) {
        return this.findByStatus(['approved', 'active'], pagination);
    }
    async findCompletedPlans(pagination) {
        return this.findByStatus('completed', pagination);
    }
    async findHighPriorityPlans(pagination) {
        return this.findByPriority(['critical', 'high'], pagination);
    }
    async findOverduePlans(pagination) {
        const now = new Date();
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        const overduePlans = Array.from(planMap.values()).filter(plan => {
            if (!plan.toData().timeline?.endDate)
                return false;
            const endDate = new Date(plan.toData().timeline.endDate);
            return endDate < now && plan.status !== 'completed' && plan.status !== 'cancelled';
        });
        return this.paginateResults(overduePlans, pagination);
    }
    async findUpcomingDeadlinePlans(daysAhead, pagination) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        const upcomingPlans = Array.from(planMap.values()).filter(plan => {
            if (!plan.toData().timeline?.endDate)
                return false;
            const endDate = new Date(plan.toData().timeline.endDate);
            return endDate >= now && endDate <= futureDate && plan.status !== 'completed' && plan.status !== 'cancelled';
        });
        return this.paginateResults(upcomingPlans, pagination);
    }
    async findByProgressRange(minProgress, maxProgress, pagination) {
        return this.findByFilter({ progressMin: minProgress, progressMax: maxProgress }, pagination);
    }
    async findByTaskStatus(taskStatus, pagination) {
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        const filteredPlans = Array.from(planMap.values()).filter(plan => plan.tasks.some(task => task.status === taskStatus));
        return this.paginateResults(filteredPlans, pagination);
    }
    async saveMany(plans) {
        const savedPlans = [];
        for (const plan of plans) {
            savedPlans.push(await this.save(plan));
        }
        return savedPlans;
    }
    async updateMany(plans) {
        const updatedPlans = [];
        for (const plan of plans) {
            updatedPlans.push(await this.update(plan));
        }
        return updatedPlans;
    }
    async deleteMany(planIds) {
        let deletedCount = 0;
        for (const planId of planIds) {
            if (await this.delete(planId)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async updateStatusMany(planIds, status) {
        let updatedCount = 0;
        const planMap = this.transactionActive ? this.transactionPlans : this.plans;
        for (const planId of planIds) {
            const plan = planMap.get(planId);
            if (plan) {
                plan.update({ status });
                updatedCount++;
            }
        }
        return updatedCount;
    }
    async transaction(operation) {
        await this.beginTransaction();
        try {
            const result = await operation(this);
            await this.commitTransaction();
            return result;
        }
        catch (error) {
            await this.rollbackTransaction();
            throw error;
        }
    }
    async beginTransaction() {
        if (this.transactionActive) {
            throw new Error('Transaction already active');
        }
        this.transactionActive = true;
        this.transactionPlans = new Map(this.plans);
    }
    async commitTransaction() {
        if (!this.transactionActive) {
            throw new Error('No active transaction');
        }
        this.plans = this.transactionPlans;
        this.transactionActive = false;
        this.transactionPlans = null;
    }
    async rollbackTransaction() {
        if (!this.transactionActive) {
            throw new Error('No active transaction');
        }
        this.transactionActive = false;
        this.transactionPlans = null;
    }
    paginateResults(items, pagination) {
        if (!pagination) {
            return {
                data: items,
                total: items.length,
                page: 1,
                limit: items.length,
                totalPages: 1
            };
        }
        const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = pagination;
        if (sortBy) {
            items.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                if (aValue instanceof Date && bValue instanceof Date) {
                    return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
                }
                const aStr = String(aValue);
                const bStr = String(bValue);
                return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
            });
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = items.slice(startIndex, endIndex);
        return {
            data: paginatedItems,
            total: items.length,
            page,
            limit,
            totalPages: Math.ceil(items.length / limit)
        };
    }
}
exports.PlanRepository = PlanRepository;
