"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanEntity = void 0;
const utils_1 = require("../../../../shared/utils");
class PlanEntity {
    data;
    constructor(data) {
        this.data = this.initializeData(data);
        this.validateInvariants();
    }
    get planId() {
        return this.data.planId;
    }
    get contextId() {
        return this.data.contextId;
    }
    get name() {
        return this.data.name;
    }
    get description() {
        return this.data.description;
    }
    get status() {
        return this.data.status;
    }
    get priority() {
        return this.data.priority;
    }
    get protocolVersion() {
        return this.data.protocolVersion;
    }
    get timestamp() {
        return this.data.timestamp;
    }
    get tasks() {
        return this.data.tasks;
    }
    get metadata() {
        return this.data.metadata;
    }
    get createdAt() {
        return this.data.createdAt;
    }
    get updatedAt() {
        return this.data.updatedAt;
    }
    get createdBy() {
        return this.data.createdBy;
    }
    get updatedBy() {
        return this.data.updatedBy;
    }
    activate() {
        if (this.data.status === 'draft' || this.data.status === 'paused') {
            this.data.status = 'active';
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    pause() {
        if (this.data.status === 'active') {
            this.data.status = 'paused';
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    complete() {
        if (this.data.status === 'active') {
            this.data.status = 'completed';
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    cancel() {
        if (this.data.status !== 'completed' && this.data.status !== 'cancelled') {
            this.data.status = 'cancelled';
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    addTask(task) {
        const newTask = {
            ...task,
            taskId: (0, utils_1.generateUUID)()
        };
        this.data.tasks.push(newTask);
        this.data.updatedAt = new Date();
    }
    removeTask(taskId) {
        const initialLength = this.data.tasks.length;
        this.data.tasks = this.data.tasks.filter(task => task.taskId !== taskId);
        if (this.data.tasks.length < initialLength) {
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    updateTaskStatus(taskId, status) {
        const task = this.data.tasks.find(t => t.taskId === taskId);
        if (task && task.status !== status) {
            task.status = status;
            this.data.updatedAt = new Date();
            return true;
        }
        return false;
    }
    getProgress() {
        if (this.data.tasks.length === 0) {
            return 0;
        }
        const completedTasks = this.data.tasks.filter(task => task.status === 'completed').length;
        return Math.round((completedTasks / this.data.tasks.length) * 100);
    }
    canExecute() {
        return this.data.status === 'approved' || this.data.status === 'active';
    }
    updateMetadata(metadata) {
        this.data.metadata = { ...this.data.metadata, ...metadata };
        this.data.updatedAt = new Date();
    }
    toData() {
        return JSON.parse(JSON.stringify(this.data));
    }
    update(updates) {
        const { planId: _planId, contextId: _contextId, protocolVersion: _protocolVersion, timestamp: _timestamp, createdAt: _createdAt, createdBy: _createdBy, ...allowedUpdates } = updates;
        Object.assign(this.data, allowedUpdates, {
            updatedAt: new Date()
        });
        this.validateInvariants();
    }
    initializeData(data) {
        const now = new Date();
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Plan name is required and cannot be empty');
        }
        return {
            protocolVersion: data.protocolVersion || '1.0.0',
            timestamp: data.timestamp || now,
            planId: data.planId || (0, utils_1.generateUUID)(),
            contextId: data.contextId || (0, utils_1.generateUUID)(),
            name: data.name,
            description: data.description,
            status: data.status || 'draft',
            priority: data.priority || 'medium',
            tasks: data.tasks || [],
            dependencies: data.dependencies || [],
            milestones: data.milestones || [],
            timeline: data.timeline,
            optimization: data.optimization,
            riskAssessment: data.riskAssessment,
            failureResolver: data.failureResolver,
            configuration: data.configuration,
            metadata: data.metadata,
            createdAt: data.createdAt || now,
            updatedAt: data.updatedAt || now,
            createdBy: data.createdBy || 'system',
            updatedBy: data.updatedBy || 'system',
            auditTrail: data.auditTrail || {
                enabled: true,
                retentionDays: 90
            },
            monitoringIntegration: data.monitoringIntegration || {
                enabled: true,
                supportedProviders: ['prometheus', 'grafana']
            },
            performanceMetrics: data.performanceMetrics || {
                enabled: true,
                collectionIntervalSeconds: 60
            },
            versionHistory: data.versionHistory || {
                enabled: true,
                maxVersions: 10
            },
            searchMetadata: data.searchMetadata || {
                enabled: true,
                indexingStrategy: 'full_text'
            },
            cachingPolicy: data.cachingPolicy || {
                enabled: true,
                cacheStrategy: 'lru'
            },
            eventIntegration: data.eventIntegration || {
                enabled: true
            }
        };
    }
    validateInvariants() {
        if (!this.data.planId) {
            throw new Error('Plan ID is required');
        }
        if (!this.data.contextId) {
            throw new Error('Context ID is required');
        }
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error('Plan name is required and cannot be empty');
        }
        if (this.data.name.length > 255) {
            throw new Error('Plan name cannot exceed 255 characters');
        }
        if (this.data.description && this.data.description.length > 2000) {
            throw new Error('Plan description cannot exceed 2000 characters');
        }
        const taskIds = this.data.tasks.map(task => task.taskId);
        const uniqueTaskIds = new Set(taskIds);
        if (taskIds.length !== uniqueTaskIds.size) {
            throw new Error('Task IDs must be unique within a plan');
        }
    }
}
exports.PlanEntity = PlanEntity;
