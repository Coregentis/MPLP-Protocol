"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabManagementService = void 0;
const utils_1 = require("../../../../shared/utils");
const collab_entity_1 = require("../../domain/entities/collab.entity");
class CollabManagementService {
    collabRepository;
    memberManager;
    taskAllocator;
    logger;
    constructor(collabRepository, memberManager, taskAllocator, logger) {
        this.collabRepository = collabRepository;
        this.memberManager = memberManager;
        this.taskAllocator = taskAllocator;
        this.logger = logger;
    }
    async createCollaboration(data) {
        await this.validateCollabData(data);
        const optimizedData = await this.applyEnterpriseIntelligence(data);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Enterprise collaboration creation started', 'CollabManagementService', {
                contextId: optimizedData.contextId,
                planId: optimizedData.planId,
                name: optimizedData.name,
                originalParticipantCount: data.participants?.length || 0,
                optimizedParticipantCount: optimizedData.participants?.length || 0,
                coordinationOptimized: optimizedData.coordinationStrategy?.type !== data.coordinationStrategy?.type,
                intelligenceApplied: true
            });
        }
        const collaboration = await this.createCollaborationEntity(optimizedData);
        if (data.participants && data.participants.length > 0) {
            for (const memberData of data.participants) {
                let participant;
                if (this.memberManager && typeof this.memberManager.createMember === 'function') {
                    const member = await this.memberManager.createMember({
                        memberId: memberData.participantId || (0, utils_1.generateUUID)(),
                        agentId: memberData.agentId,
                        role: memberData.roleId,
                        capabilities: memberData.capabilities || [],
                        status: memberData.status || 'pending'
                    });
                    participant = new collab_entity_1.CollabParticipant(member.participantId, member.agentId, member.roleId, member.status, member.capabilities, new Date());
                }
                else {
                    participant = new collab_entity_1.CollabParticipant(memberData.participantId || (0, utils_1.generateUUID)(), memberData.agentId, memberData.roleId, memberData.status || 'pending', memberData.capabilities || [], new Date());
                }
                collaboration.addParticipant(participant, data.createdBy || 'system');
            }
        }
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Collaboration entity prepared for persistence', 'CollabManagementService', {
                collaborationId: collaboration.id,
                status: collaboration.status
            });
        }
        const savedCollaboration = await this.collabRepository.save(collaboration);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Collaboration created successfully', 'CollabManagementService', {
                collaborationId: savedCollaboration.id,
                name: savedCollaboration.name,
                participantCount: savedCollaboration.participants.length
            });
        }
        return savedCollaboration;
    }
    async validateCollabData(data) {
        if (!data.contextId) {
            throw new Error('Context ID is required for collaboration creation');
        }
        if (!data.planId) {
            throw new Error('Plan ID is required for collaboration creation');
        }
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Collaboration name is required');
        }
        if (!data.mode) {
            throw new Error('Collaboration mode is required');
        }
        if (!data.coordinationStrategy) {
            throw new Error('Coordination strategy is required');
        }
        if (!data.participants || data.participants.length < 2) {
            throw new Error('At least 2 participants are required for collaboration');
        }
        if (data.participants.length > 100) {
            throw new Error('Maximum 100 participants allowed per collaboration');
        }
        for (const participant of data.participants) {
            if (this.memberManager && typeof this.memberManager.validateMemberData === 'function') {
                const validationResult = await this.memberManager.validateMemberData({
                    memberId: participant.participantId || (0, utils_1.generateUUID)(),
                    agentId: participant.agentId,
                    role: participant.roleId,
                    capabilities: participant.capabilities || []
                });
                if (!validationResult.isValid) {
                    throw new Error(`Invalid member: agentId=${participant.agentId}, roleId=${participant.roleId}. Violations: ${validationResult.violations.join(', ')}`);
                }
            }
            else {
                if (!participant.agentId || !participant.roleId) {
                    throw new Error(`Invalid member: agentId=${participant.agentId}, roleId=${participant.roleId}`);
                }
            }
        }
    }
    async createCollaborationEntity(data) {
        if (!data.coordinationStrategy || !data.contextId || !data.planId || !data.name || !data.mode) {
            throw new Error('Required collaboration data is missing');
        }
        const coordinationStrategy = new collab_entity_1.CollabCoordinationStrategy(data.coordinationStrategy.type, data.coordinationStrategy.decisionMaking, data.coordinationStrategy.coordinatorId);
        if (coordinationStrategy && typeof coordinationStrategy.validateConfiguration === 'function') {
            try {
                if (!coordinationStrategy.validateConfiguration()) {
                    if (this.logger && typeof this.logger.warn === 'function') {
                        await this.logger.warn('Coordination strategy validation failed, using fallback validation', 'CollabManagementService');
                    }
                    if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                        throw new Error('Invalid coordination strategy configuration');
                    }
                }
            }
            catch (error) {
                if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                    throw new Error('Invalid coordination strategy configuration');
                }
            }
        }
        else {
            if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                throw new Error('Invalid coordination strategy configuration');
            }
        }
        const collaboration = new collab_entity_1.CollabEntity((0, utils_1.generateUUID)(), data.contextId, data.planId, data.name.trim(), data.mode, coordinationStrategy, data.createdBy || 'system', data.description);
        return collaboration;
    }
    async getCollaboration(id) {
        if (!id) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(id);
        if (!collaboration) {
            return null;
        }
        return collaboration;
    }
    async updateCollaboration(id, data) {
        if (!id) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(id);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        const updatedBy = data.updatedBy || 'system';
        if (data.name !== undefined) {
            collaboration.updateName(data.name, updatedBy);
        }
        if (data.description !== undefined) {
            collaboration.updateDescription(data.description, updatedBy);
        }
        if (data.mode !== undefined) {
            collaboration.changeMode(data.mode, updatedBy);
        }
        if (data.status !== undefined) {
            collaboration.changeStatus(data.status, updatedBy);
        }
        if (data.coordinationStrategy) {
            const newStrategy = new collab_entity_1.CollabCoordinationStrategy(data.coordinationStrategy.type, data.coordinationStrategy.decisionMaking, data.coordinationStrategy.coordinatorId);
            collaboration.updateCoordinationStrategy(newStrategy, updatedBy);
        }
        if (data.participants) {
            for (const participantData of data.participants) {
                const existingParticipant = collaboration.getParticipant(participantData.participantId);
                if (existingParticipant) {
                    if (participantData.status) {
                        switch (participantData.status) {
                            case 'active':
                                existingParticipant.activate();
                                break;
                            case 'inactive':
                                existingParticipant.deactivate();
                                break;
                            case 'suspended':
                                existingParticipant.suspend();
                                break;
                        }
                    }
                }
            }
        }
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        return updatedCollaboration;
    }
    async deleteCollaboration(id) {
        if (!id) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(id);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        if (collaboration.status === 'active') {
            throw new Error('Cannot delete active collaboration. Please stop it first.');
        }
        await this.collabRepository.delete(id);
    }
    async listCollaborations(query) {
        const validatedQuery = {
            page: Math.max(1, query.page || 1),
            limit: Math.min(100, Math.max(1, query.limit || 10)),
            status: query.status,
            mode: query.mode,
            contextId: query.contextId,
            planId: query.planId,
            participantId: query.participantId,
            sortBy: query.sortBy || 'createdAt',
            sortOrder: query.sortOrder || 'desc'
        };
        const result = await this.collabRepository.list(validatedQuery);
        return result;
    }
    async startCollaboration(id, startedBy) {
        const collaboration = await this.collabRepository.findById(id);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        if (!collaboration.canStart()) {
            throw new Error('Collaboration cannot be started. Check status and participants.');
        }
        collaboration.changeStatus('active', startedBy);
        return await this.collabRepository.update(collaboration);
    }
    async stopCollaboration(id, stoppedBy, _reason) {
        const collaboration = await this.collabRepository.findById(id);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        if (!collaboration.canStop()) {
            throw new Error('Collaboration cannot be stopped. Check current status.');
        }
        collaboration.changeStatus('stopped', stoppedBy);
        return await this.collabRepository.update(collaboration);
    }
    async addParticipant(collaborationId, participantData, addedBy) {
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        const participant = new collab_entity_1.CollabParticipant((0, utils_1.generateUUID)(), participantData.agentId, participantData.roleId, 'pending', participantData.capabilities || [], new Date());
        collaboration.addParticipant(participant, addedBy);
        return await this.collabRepository.update(collaboration);
    }
    async removeParticipant(collaborationId, participantId, removedBy, reason) {
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        collaboration.removeParticipant(participantId, removedBy, reason);
        return await this.collabRepository.update(collaboration);
    }
    async updateTaskStatus(collaborationId, taskId, status, updatedBy) {
        await this.validateTaskStatusData(taskId, status, updatedBy);
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collaborationId} not found`);
        }
        const collabWithTasks = collaboration;
        if (!collabWithTasks.tasks || collabWithTasks.tasks.length === 0) {
            throw new Error(`No tasks found in collaboration ${collaborationId}`);
        }
        const taskIndex = collabWithTasks.tasks.findIndex(t => t.taskId === taskId);
        if (taskIndex === -1) {
            throw new Error(`Task ${taskId} not found in collaboration ${collaborationId}`);
        }
        const task = collabWithTasks.tasks[taskIndex];
        const validTransitions = {
            'pending': ['assigned', 'cancelled'],
            'assigned': ['in_progress', 'cancelled'],
            'in_progress': ['completed', 'failed', 'cancelled'],
            'completed': [],
            'failed': ['assigned'],
            'cancelled': []
        };
        if (!validTransitions[task.status] || !validTransitions[task.status].includes(status)) {
            throw new Error(`Invalid status transition from ${task.status} to ${status}`);
        }
        task.status = status;
        const extendedTask = task;
        extendedTask.updatedAt = new Date();
        extendedTask.updatedBy = updatedBy;
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Task status updated', 'CollabManagementService', {
                collaborationId,
                taskId,
                oldStatus: task.status,
                newStatus: status,
                updatedBy
            });
        }
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Task status update completed', 'CollabManagementService', {
                collaborationId,
                taskId,
                status
            });
        }
        return updatedCollaboration;
    }
    async validateTaskStatusData(taskId, status, updatedBy) {
        if (!taskId) {
            throw new Error('Task ID is required');
        }
        if (!status) {
            throw new Error('Task status is required');
        }
        if (!updatedBy) {
            throw new Error('Updated by is required');
        }
        const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }
    async allocateResource(collaborationId, resourceData, allocatedBy) {
        await this.validateResourceData(resourceData, allocatedBy);
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collaborationId} not found`);
        }
        const target = collaboration.participants.find(p => p.agentId === resourceData.targetId);
        if (!target) {
            throw new Error(`Target ${resourceData.targetId} is not a member of collaboration ${collaborationId}`);
        }
        let resourceAllocation;
        if (this.taskAllocator && typeof this.taskAllocator.allocateResource === 'function') {
            const allocation = await this.taskAllocator.allocateResource(resourceData.resourceId, resourceData.targetId, resourceData.amount, resourceData.duration);
            resourceAllocation = {
                allocationId: allocation.allocationId,
                resourceId: allocation.resourceId,
                targetId: allocation.targetId,
                amount: allocation.amount,
                duration: allocation.duration,
                status: allocation.status,
                allocatedAt: allocation.allocatedAt,
                allocatedBy: allocatedBy
            };
        }
        else {
            resourceAllocation = {
                allocationId: (0, utils_1.generateUUID)(),
                resourceId: resourceData.resourceId,
                targetId: resourceData.targetId,
                amount: resourceData.amount,
                duration: resourceData.duration,
                status: 'allocated',
                allocatedAt: new Date(),
                allocatedBy: allocatedBy
            };
        }
        const collabWithResources = collaboration;
        if (!collabWithResources.resourceAllocations) {
            collabWithResources.resourceAllocations = [];
        }
        collabWithResources.resourceAllocations.push(resourceAllocation);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Resource allocated successfully', 'CollabManagementService', {
                collaborationId,
                resourceId: resourceData.resourceId,
                targetId: resourceData.targetId,
                amount: resourceData.amount,
                allocatedBy
            });
        }
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Resource allocation completed', 'CollabManagementService', {
                collaborationId,
                resourceId: resourceData.resourceId,
                totalAllocations: updatedCollaboration.resourceAllocations?.length || 0
            });
        }
        return updatedCollaboration;
    }
    async validateResourceData(resourceData, allocatedBy) {
        if (!resourceData.resourceId) {
            throw new Error('Resource ID is required');
        }
        if (!resourceData.targetId) {
            throw new Error('Target ID is required');
        }
        if (!allocatedBy) {
            throw new Error('Allocated by is required');
        }
        if (resourceData.amount <= 0) {
            throw new Error('Resource amount must be positive');
        }
        if (resourceData.duration <= 0) {
            throw new Error('Resource duration must be positive');
        }
    }
    async getCollaborationStatus(collaborationId) {
        if (!collaborationId) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        const participants = collaboration.participants;
        const activeParticipants = collaboration.getActiveParticipants();
        const statusInfo = {
            collaborationId,
            status: collaboration.status,
            participantCount: participants.length,
            activeParticipants: activeParticipants.length,
            taskCount: 0,
            completedTasks: 0,
            resourceAllocations: 0,
            lastActivity: collaboration.timestamp,
            healthScore: this.calculateHealthScore(collaboration)
        };
        return statusInfo;
    }
    async endCollaboration(collaborationId, endedBy, _reason) {
        if (!collaborationId) {
            throw new Error('Collaboration ID is required');
        }
        if (!endedBy) {
            throw new Error('User ID is required for ending collaboration');
        }
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        if (collaboration.status === 'completed' || collaboration.status === 'cancelled') {
            throw new Error('Collaboration is already ended');
        }
        collaboration.changeStatus('completed', endedBy);
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        return updatedCollaboration;
    }
    async queryCollaborations(criteria) {
        const validatedCriteria = {
            status: criteria.status || [],
            mode: criteria.mode || [],
            participantId: criteria.participantId,
            contextId: criteria.contextId,
            planId: criteria.planId,
            createdAfter: criteria.createdAfter,
            createdBefore: criteria.createdBefore,
            tags: criteria.tags || [],
            limit: Math.min(100, Math.max(1, criteria.limit || 10)),
            offset: Math.max(0, criteria.offset || 0),
            sortBy: criteria.sortBy || 'createdAt',
            sortOrder: criteria.sortOrder || 'desc'
        };
        const query = {
            page: Math.floor(validatedCriteria.offset / validatedCriteria.limit) + 1,
            limit: validatedCriteria.limit,
            status: validatedCriteria.status.length > 0 ? validatedCriteria.status[0] : undefined,
            mode: validatedCriteria.mode.length > 0 ? validatedCriteria.mode[0] : undefined,
            participantId: validatedCriteria.participantId,
            contextId: validatedCriteria.contextId,
            planId: validatedCriteria.planId,
            sortBy: validatedCriteria.sortBy,
            sortOrder: validatedCriteria.sortOrder
        };
        const result = await this.collabRepository.list(query);
        return {
            collaborations: result.items,
            total: result.pagination.total,
            hasMore: result.pagination.page < result.pagination.totalPages
        };
    }
    calculateHealthScore(collaboration) {
        let score = 10;
        const participants = collaboration.participants;
        const activeParticipants = collaboration.getActiveParticipants();
        const participantRatio = activeParticipants.length / participants.length;
        if (participantRatio < 0.5)
            score -= 3;
        else if (participantRatio < 0.8)
            score -= 1;
        if (collaboration.status === 'inactive')
            score -= 2;
        else if (collaboration.status === 'failed')
            score -= 5;
        const ageInDays = (Date.now() - collaboration.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > 30)
            score -= 1;
        if (ageInDays > 90)
            score -= 2;
        return Math.max(0, Math.min(10, score));
    }
    async addMember(collaborationId, memberData, addedBy) {
        await this.validateMemberData(memberData);
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collaborationId} not found`);
        }
        const existingMember = collaboration.participants.find(p => p.agentId === memberData.agentId);
        if (existingMember) {
            throw new Error(`Member ${memberData.agentId} already exists in collaboration`);
        }
        let participant;
        if (this.memberManager && typeof this.memberManager.createMember === 'function') {
            const member = await this.memberManager.createMember({
                memberId: (0, utils_1.generateUUID)(),
                agentId: memberData.agentId,
                role: memberData.roleId,
                capabilities: memberData.capabilities || [],
                status: 'pending'
            });
            participant = new collab_entity_1.CollabParticipant(member.participantId, member.agentId, member.roleId, member.status, member.capabilities, new Date());
        }
        else {
            participant = new collab_entity_1.CollabParticipant((0, utils_1.generateUUID)(), memberData.agentId, memberData.roleId, 'pending', memberData.capabilities || [], new Date());
        }
        collaboration.addParticipant(participant, addedBy);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Member added to collaboration', 'CollabManagementService', {
                collaborationId,
                memberId: participant.participantId,
                agentId: participant.agentId,
                roleId: participant.roleId,
                addedBy
            });
        }
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Member addition completed', 'CollabManagementService', {
                collaborationId,
                memberId: participant.participantId,
                totalMembers: updatedCollaboration.participants.length
            });
        }
        return updatedCollaboration;
    }
    async validateMemberData(memberData) {
        if (!memberData.agentId) {
            throw new Error('Agent ID is required');
        }
        if (!memberData.roleId) {
            throw new Error('Role ID is required');
        }
        if (!memberData.capabilities || memberData.capabilities.length === 0) {
            throw new Error('Member capabilities are required');
        }
        if (this.memberManager && typeof this.memberManager.validateMemberData === 'function') {
            const validationResult = await this.memberManager.validateMemberData({
                memberId: (0, utils_1.generateUUID)(),
                agentId: memberData.agentId,
                role: memberData.roleId,
                capabilities: memberData.capabilities
            });
            if (!validationResult.isValid) {
                throw new Error(`Member validation failed: ${validationResult.violations.join(', ')}`);
            }
        }
    }
    async assignTask(collaborationId, taskData, assignedBy) {
        await this.validateTaskData(taskData);
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collaborationId} not found`);
        }
        const assignee = collaboration.participants.find(p => p.agentId === taskData.assigneeId);
        if (!assignee) {
            throw new Error(`Assignee ${taskData.assigneeId} is not a member of collaboration ${collaborationId}`);
        }
        let taskAssignment;
        if (this.taskAllocator && typeof this.taskAllocator.allocateResource === 'function') {
            const resourceAllocation = await this.taskAllocator.allocateResource(taskData.assigneeId, taskData.taskId, 1, 86400000);
            taskAssignment = {
                taskId: taskData.taskId,
                assigneeId: taskData.assigneeId,
                status: resourceAllocation.status === 'allocated' ? 'assigned' : 'pending',
                assignedAt: new Date(),
                assignedBy: assignedBy,
                priority: taskData.priority,
                dueDate: taskData.dueDate
            };
        }
        else {
            taskAssignment = {
                taskId: taskData.taskId,
                assigneeId: taskData.assigneeId,
                status: 'assigned',
                assignedAt: new Date(),
                assignedBy: assignedBy,
                priority: taskData.priority,
                dueDate: taskData.dueDate
            };
        }
        const collabWithTasks = collaboration;
        if (!collabWithTasks.tasks) {
            collabWithTasks.tasks = [];
        }
        collabWithTasks.tasks.push(taskAssignment);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Task assigned successfully', 'CollabManagementService', {
                collaborationId,
                taskId: taskData.taskId,
                assigneeId: taskData.assigneeId,
                assignedBy
            });
        }
        const updatedCollaboration = await this.collabRepository.update(collaboration);
        if (this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('Task assignment completed', 'CollabManagementService', {
                collaborationId,
                taskId: taskData.taskId,
                totalTasks: updatedCollaboration.tasks?.length || 0
            });
        }
        return updatedCollaboration;
    }
    async validateTaskData(taskData) {
        if (!taskData.taskId) {
            throw new Error('Task ID is required');
        }
        if (!taskData.assigneeId) {
            throw new Error('Assignee ID is required');
        }
        if (!taskData.priority) {
            throw new Error('Task priority is required');
        }
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(taskData.priority.toLowerCase())) {
            throw new Error(`Invalid priority: ${taskData.priority}. Must be one of: ${validPriorities.join(', ')}`);
        }
        if (taskData.dueDate && taskData.dueDate < new Date()) {
            throw new Error('Due date cannot be in the past');
        }
    }
    async applyEnterpriseIntelligence(data) {
        const optimizedData = { ...data };
        if (data.participants && data.participants.length > 0) {
            const collabMembers = data.participants.map(p => ({
                participantId: p.participantId,
                agentId: p.agentId,
                roleId: p.roleId,
                status: p.status,
                capabilities: p.capabilities || [],
                joinedAt: p.joinedAt
            }));
            const optimizedMembers = await this.optimizeParticipantComposition(collabMembers, data.mode || 'parallel');
            optimizedData.participants = optimizedMembers.map(m => ({
                participantId: m.participantId,
                agentId: m.agentId,
                roleId: m.roleId,
                status: m.status,
                capabilities: m.capabilities,
                joinedAt: m.joinedAt
            }));
        }
        if (data.coordinationStrategy && optimizedData.participants) {
            const collabMembers = optimizedData.participants.map(p => ({
                participantId: p.participantId,
                agentId: p.agentId,
                roleId: p.roleId,
                status: p.status,
                capabilities: p.capabilities || [],
                joinedAt: p.joinedAt
            }));
            const enhancedStrategy = await this.enhanceCoordinationStrategy({ ...data.coordinationStrategy }, collabMembers, data.mode || 'parallel');
            optimizedData.coordinationStrategy = {
                ...data.coordinationStrategy,
                type: enhancedStrategy.type,
                decisionMaking: enhancedStrategy.decisionMaking,
                coordinatorId: enhancedStrategy.coordinatorId
            };
        }
        await this.validateEnterprisePolicies(optimizedData);
        return optimizedData;
    }
    async optimizeParticipantComposition(participants, mode) {
        const optimizedParticipants = [...participants];
        const optimalSize = this.calculateOptimalTeamSize(mode, participants.length);
        if (participants.length < optimalSize.min) {
            if (this.logger && typeof this.logger.info === 'function') {
                await this.logger.info(`Team size optimization: ${participants.length} below optimal range (${optimalSize.min}-${optimalSize.max})`, 'CollabManagementService');
            }
        }
        else if (participants.length > optimalSize.max) {
            if (this.logger && typeof this.logger.info === 'function') {
                await this.logger.info(`Team size optimization: ${participants.length} above optimal range (${optimalSize.min}-${optimalSize.max})`, 'CollabManagementService');
            }
        }
        const capabilityGaps = this.analyzeCapabilityGaps(participants);
        if (capabilityGaps.length > 0 && this.logger && typeof this.logger.info === 'function') {
            await this.logger.info(`Capability gaps identified: ${capabilityGaps.join(', ')}`, 'CollabManagementService');
        }
        const roleBalance = this.analyzeRoleBalance(participants);
        if (!roleBalance.isBalanced && this.logger && typeof this.logger.info === 'function') {
            await this.logger.info(`Role distribution optimization suggested: ${roleBalance.suggestions.join(', ')}`, 'CollabManagementService');
        }
        return optimizedParticipants;
    }
    async enhanceCoordinationStrategy(strategy, participants, mode) {
        const enhancedStrategy = { ...strategy };
        const recommendedType = this.recommendCoordinationStrategy(participants.length, mode);
        if (recommendedType !== strategy.type) {
            if (this.logger && typeof this.logger.info === 'function') {
                await this.logger.info(`Coordination strategy optimization: ${strategy.type} → ${recommendedType}`, 'CollabManagementService');
            }
            enhancedStrategy.type = recommendedType;
        }
        const recommendedDecisionMaking = this.recommendDecisionMaking(participants.length, enhancedStrategy.type);
        if (recommendedDecisionMaking !== strategy.decisionMaking) {
            if (this.logger && typeof this.logger.info === 'function') {
                await this.logger.info(`Decision making optimization: ${strategy.decisionMaking} → ${recommendedDecisionMaking}`, 'CollabManagementService');
            }
            enhancedStrategy.decisionMaking = recommendedDecisionMaking;
        }
        if (enhancedStrategy.type === 'centralized' && !enhancedStrategy.coordinatorId) {
            const recommendedCoordinator = this.selectOptimalCoordinator(participants);
            if (recommendedCoordinator) {
                enhancedStrategy.coordinatorId = recommendedCoordinator.agentId;
                if (this.logger && typeof this.logger.info === 'function') {
                    await this.logger.info(`Optimal coordinator selected: ${recommendedCoordinator.agentId}`, 'CollabManagementService');
                }
            }
        }
        return enhancedStrategy;
    }
    async validateEnterprisePolicies(data) {
        if (data.participants && data.participants.length > 50) {
            throw new Error('Enterprise policy violation: Maximum 50 participants allowed');
        }
        if (data.description?.includes('external') && !data.description?.includes('[EXTERNAL_APPROVED]')) {
            if (this.logger && typeof this.logger.info === 'function') {
                await this.logger.info('External collaboration requires compliance approval', 'CollabManagementService');
            }
        }
        const estimatedResourceUsage = this.estimateResourceUsage(data);
        if (estimatedResourceUsage.high && this.logger && typeof this.logger.info === 'function') {
            await this.logger.info('High resource usage collaboration - monitoring recommended', 'CollabManagementService');
        }
    }
    calculateOptimalTeamSize(mode, _currentSize) {
        const sizeRanges = {
            'sequential': { min: 2, max: 5 },
            'parallel': { min: 3, max: 8 },
            'hybrid': { min: 4, max: 10 },
            'pipeline': { min: 3, max: 7 },
            'mesh': { min: 5, max: 12 }
        };
        return sizeRanges[mode] || { min: 2, max: 8 };
    }
    analyzeCapabilityGaps(participants) {
        const allCapabilities = participants.flatMap(p => p.capabilities || []);
        const uniqueCapabilities = [...new Set(allCapabilities)];
        const essentialCapabilities = ['leadership', 'technical', 'communication', 'analysis'];
        const gaps = essentialCapabilities.filter(cap => !uniqueCapabilities.includes(cap));
        return gaps;
    }
    analyzeRoleBalance(participants) {
        const roleCounts = participants.reduce((counts, p) => {
            counts[p.roleId] = (counts[p.roleId] || 0) + 1;
            return counts;
        }, {});
        const suggestions = [];
        const totalParticipants = participants.length;
        Object.entries(roleCounts).forEach(([role, count]) => {
            const percentage = (count / totalParticipants) * 100;
            if (percentage > 60) {
                suggestions.push(`Consider diversifying roles - ${role} represents ${percentage.toFixed(1)}% of team`);
            }
        });
        return {
            isBalanced: suggestions.length === 0,
            suggestions
        };
    }
    recommendCoordinationStrategy(participantCount, mode) {
        if (participantCount <= 3)
            return 'centralized';
        if (participantCount <= 6)
            return mode === 'parallel' ? 'distributed' : 'hierarchical';
        if (participantCount <= 10)
            return 'hierarchical';
        return 'peer_to_peer';
    }
    recommendDecisionMaking(participantCount, coordinationType) {
        if (coordinationType === 'centralized')
            return 'coordinator';
        if (participantCount <= 5)
            return 'consensus';
        if (participantCount <= 8)
            return 'majority';
        return 'weighted';
    }
    selectOptimalCoordinator(participants) {
        const leadersWithCapabilities = participants.filter(p => p.capabilities?.includes('leadership') || p.capabilities?.includes('management'));
        if (leadersWithCapabilities.length > 0) {
            return leadersWithCapabilities[0];
        }
        return participants.length > 0 ? participants[0] : null;
    }
    estimateResourceUsage(data) {
        const participantCount = data.participants?.length || 0;
        const complexityFactor = data.mode === 'mesh' ? 2 : data.mode === 'hybrid' ? 1.5 : 1;
        const estimated = participantCount * complexityFactor * 10;
        return {
            high: estimated > 100,
            estimated
        };
    }
}
exports.CollabManagementService = CollabManagementService;
