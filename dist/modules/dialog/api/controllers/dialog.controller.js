"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogController = void 0;
const dialog_mapper_1 = require("../mappers/dialog.mapper");
class DialogController {
    dialogManagementService;
    constructor(dialogManagementService) {
        this.dialogManagementService = dialogManagementService;
    }
    async createDialog(request) {
        try {
            const createDto = this._validateCreateRequest(request);
            const dialogSchema = this._mapCreateDtoToSchema(createDto);
            const dialogEntity = await this.dialogManagementService.createDialog(dialogSchema);
            const responseDto = this._mapEntityToResponseDto(dialogEntity);
            return {
                success: true,
                status: 201,
                data: responseDto,
                message: 'Dialog created successfully'
            };
        }
        catch (error) {
            return this._handleError('createDialog', error);
        }
    }
    async getDialog(request) {
        try {
            const id = request.params?.id || request.id;
            if (!id) {
                throw new Error('Dialog ID is required');
            }
            const dialogId = this._validateDialogId(id);
            const dialogEntity = await this.dialogManagementService.getDialogById(dialogId);
            if (!dialogEntity) {
                return {
                    success: false,
                    status: 404,
                    error: 'Dialog not found',
                    message: `Dialog with ID ${dialogId} does not exist`
                };
            }
            const responseDto = this._mapEntityToResponseDto(dialogEntity);
            return {
                success: true,
                status: 200,
                data: responseDto,
                message: 'Dialog retrieved successfully'
            };
        }
        catch (error) {
            return this._handleError('getDialog', error);
        }
    }
    async updateDialog(request) {
        try {
            const id = request.params?.id || request.id;
            if (!id) {
                throw new Error('Dialog ID is required');
            }
            const dialogId = this._validateDialogId(id);
            const updateData = request.body || request;
            const updateDto = this._validateUpdateRequest(updateData);
            const updateSchema = this._mapUpdateDtoToSchema(updateDto);
            const dialogEntity = await this.dialogManagementService.updateDialog(dialogId, updateSchema);
            const responseDto = this._mapEntityToResponseDto(dialogEntity);
            return {
                success: true,
                status: 200,
                data: responseDto,
                message: 'Dialog updated successfully'
            };
        }
        catch (error) {
            return this._handleError('updateDialog', error);
        }
    }
    async listDialogs(request) {
        try {
            const limit = request.limit || 10;
            const offset = request.offset || 0;
            const result = await this.dialogManagementService.listDialogs({ limit, offset });
            return {
                success: true,
                status: 200,
                data: {
                    dialogs: result.dialogs.map(dialog => this._mapEntityToResponseDto(dialog)),
                    total: result.total,
                    limit,
                    offset
                },
                message: 'Dialogs retrieved successfully'
            };
        }
        catch (error) {
            return this._handleError('listDialogs', error);
        }
    }
    async deleteDialog(request) {
        try {
            const id = request.params?.id || request.id;
            if (!id) {
                throw new Error('Dialog ID is required');
            }
            const dialogId = this._validateDialogId(id);
            await this.dialogManagementService.deleteDialog(dialogId);
            return {
                success: true,
                status: 200,
                message: 'Dialog deleted successfully'
            };
        }
        catch (error) {
            return this._handleError('deleteDialog', error);
        }
    }
    async startDialog(request) {
        try {
            const dialogId = request.params.id;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            const dialog = await this.dialogManagementService.getDialogById(dialogId);
            if (!dialog) {
                throw new Error('Dialog not found');
            }
            const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
                dialog_operation: 'start'
            });
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Dialog started successfully'
            };
        }
        catch (error) {
            return this._handleError('startDialog', error);
        }
    }
    async pauseDialog(request) {
        try {
            const dialogId = request.params.id;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
                dialog_operation: 'pause'
            });
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Dialog paused successfully'
            };
        }
        catch (error) {
            return this._handleError('pauseDialog', error);
        }
    }
    async resumeDialog(request) {
        try {
            const dialogId = request.params.id;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
                dialog_operation: 'resume'
            });
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Dialog resumed successfully'
            };
        }
        catch (error) {
            return this._handleError('resumeDialog', error);
        }
    }
    async endDialog(request) {
        try {
            const dialogId = request.params.id;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
                dialog_operation: 'end'
            });
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Dialog ended successfully'
            };
        }
        catch (error) {
            return this._handleError('endDialog', error);
        }
    }
    async searchDialogs(request) {
        try {
            const searchQuery = {
                query: request.query || '',
                fields: request.fields || ['name', 'description'],
                limit: request.limit || 10
            };
            const result = await this.dialogManagementService.searchDialogs(searchQuery);
            return {
                success: true,
                status: 200,
                data: {
                    dialogs: result.dialogs.map(dialog => this._mapEntityToResponseDto(dialog)),
                    total: result.dialogs.length
                },
                message: 'Search completed successfully'
            };
        }
        catch (error) {
            return this._handleError('searchDialogs', error);
        }
    }
    async addParticipant(request) {
        try {
            const dialogId = request.params.id;
            const participantId = request.body.participantId;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            if (!participantId) {
                throw new Error('Participant ID is required');
            }
            const updatedDialog = await this.dialogManagementService.addParticipant(dialogId, participantId);
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Participant added successfully'
            };
        }
        catch (error) {
            return this._handleError('addParticipant', error);
        }
    }
    async removeParticipant(request) {
        try {
            const dialogId = request.params.id;
            const participantId = request.params.participantId;
            if (!dialogId) {
                throw new Error('Dialog ID is required');
            }
            if (!participantId) {
                throw new Error('Participant ID is required');
            }
            const updatedDialog = await this.dialogManagementService.removeParticipant(dialogId, participantId);
            return {
                success: true,
                status: 200,
                data: this._mapEntityToResponseDto(updatedDialog),
                message: 'Participant removed successfully'
            };
        }
        catch (error) {
            return this._handleError('removeParticipant', error);
        }
    }
    async getStatistics() {
        try {
            const statistics = await this.dialogManagementService.getDialogStatistics();
            return {
                success: true,
                status: 200,
                data: statistics,
                message: 'Statistics retrieved successfully'
            };
        }
        catch (error) {
            return this._handleError('getStatistics', error);
        }
    }
    async executeDialogOperation(request) {
        try {
            const dialogId = this._validateDialogId(request.id);
            const operation = this._validateOperation(request.operation);
            await this.dialogManagementService.executeDialogOperation(dialogId, operation);
            return {
                success: true,
                message: `Dialog operation '${operation}' executed successfully`
            };
        }
        catch (error) {
            return this._handleError('executeDialogOperation', error);
        }
    }
    _validateCreateRequest(request) {
        const requestBody = request.body;
        if (requestBody === null || requestBody === undefined) {
            const error = new Error('Request body is required');
            error.statusCode = 400;
            throw error;
        }
        const data = requestBody || request;
        if (!data.name) {
            const error = new Error('Dialog name is required');
            error.statusCode = 400;
            throw error;
        }
        if (!data.participants || data.participants.length === 0) {
            const error = new Error('At least one participant is required');
            error.statusCode = 400;
            throw error;
        }
        return data;
    }
    _validateUpdateRequest(request) {
        if (request.name !== undefined && (!request.name || request.name.trim().length === 0)) {
            throw new Error('Dialog name cannot be empty');
        }
        if (request.participants !== undefined && (!request.participants || request.participants.length === 0)) {
            throw new Error('At least one participant is required');
        }
        return request;
    }
    _validateDialogId(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Valid dialog ID is required');
        }
        return id;
    }
    _validateOperation(operation) {
        const validOperations = ['start', 'continue', 'pause', 'resume', 'end'];
        if (!validOperations.includes(operation)) {
            throw new Error(`Invalid operation: ${operation}. Valid operations: ${validOperations.join(', ')}`);
        }
        return operation;
    }
    _mapCreateDtoToSchema(dto) {
        return {
            dialog_id: dto.dialogId || dto.dialog_id,
            name: dto.name,
            description: dto.description,
            participants: dto.participants,
            capabilities: dto.capabilities,
            strategy: dto.strategy,
            context: dto.context,
            configuration: dto.configuration,
            metadata: dto.metadata
        };
    }
    _mapUpdateDtoToSchema(dto) {
        const result = {};
        if (dto.name !== undefined)
            result.name = dto.name;
        if (dto.description !== undefined)
            result.description = dto.description;
        if (dto.participants !== undefined)
            result.participants = dto.participants;
        if (dto.capabilities !== undefined)
            result.capabilities = dto.capabilities;
        if (dto.strategy !== undefined)
            result.strategy = dto.strategy;
        if (dto.context !== undefined)
            result.context = dto.context;
        if (dto.configuration !== undefined)
            result.configuration = dto.configuration;
        if (dto.metadata !== undefined)
            result.metadata = dto.metadata;
        return result;
    }
    _mapEntityToResponseDto(entity) {
        const schema = dialog_mapper_1.DialogMapper.toSchema(entity);
        return {
            dialog_id: schema.dialog_id,
            name: schema.name,
            description: schema.description,
            participants: schema.participants,
            capabilities: schema.capabilities,
            strategy: schema.strategy,
            context: schema.context,
            configuration: schema.configuration,
            metadata: schema.metadata,
            audit_trail: schema.audit_trail,
            monitoring_integration: schema.monitoring_integration,
            performance_metrics: schema.performance_metrics,
            version_history: schema.version_history,
            search_metadata: schema.search_metadata,
            dialog_operation: schema.dialog_operation,
            dialog_details: schema.dialog_details,
            event_integration: schema.event_integration,
            protocol_version: schema.protocol_version,
            timestamp: schema.timestamp
        };
    }
    _handleError(method, error) {
        const statusCode = error?.statusCode || 500;
        return {
            success: false,
            status: statusCode,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: `Failed to ${method.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        };
    }
}
exports.DialogController = DialogController;
