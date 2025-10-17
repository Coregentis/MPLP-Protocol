"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabController = void 0;
const collab_mapper_1 = require("../mappers/collab.mapper");
class CollabController {
    collabManagementService;
    constructor(collabManagementService) {
        this.collabManagementService = collabManagementService;
    }
    async createCollaboration(req, res) {
        try {
            const createDTO = req.body;
            const entityData = collab_mapper_1.CollabMapper.fromCreateDTO(createDTO);
            const collaboration = await this.collabManagementService.createCollaboration(entityData);
            const responseDTO = collab_mapper_1.CollabMapper.toResponseDTO(collaboration);
            const response = {
                success: true,
                data: responseDTO
            };
            res.status(201).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: {
                    code: 'CREATION_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to create collaboration'
                }
            };
            res.status(500).json(response);
        }
    }
    async getCollaboration(req, res) {
        try {
            const collaborationId = req.params.id;
            const collaboration = await this.collabManagementService.getCollaboration(collaborationId);
            if (!collaboration) {
                const response = {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Collaboration not found'
                    }
                };
                res.status(404).json(response);
                return;
            }
            const responseDTO = collab_mapper_1.CollabMapper.toResponseDTO(collaboration);
            const response = {
                success: true,
                data: responseDTO
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: {
                    code: 'RETRIEVAL_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to get collaboration'
                }
            };
            res.status(500).json(response);
        }
    }
    async updateCollaboration(req, res) {
        try {
            const collaborationId = req.params.id;
            const updateDTO = req.body;
            const updateData = collab_mapper_1.CollabMapper.fromUpdateDTO(updateDTO);
            const collaboration = await this.collabManagementService.updateCollaboration(collaborationId, updateData);
            const responseDTO = collab_mapper_1.CollabMapper.toResponseDTO(collaboration);
            const response = {
                success: true,
                data: responseDTO
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to update collaboration'
                }
            };
            res.status(500).json(response);
        }
    }
    async deleteCollaboration(req, res) {
        try {
            const collaborationId = req.params.id;
            await this.collabManagementService.deleteCollaboration(collaborationId);
            const response = {
                success: true
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to delete collaboration'
                }
            };
            res.status(500).json(response);
        }
    }
    async listCollaborations(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const result = await this.collabManagementService.listCollaborations({ page, limit, status });
            const responseDTOs = result.items.map((collab) => collab_mapper_1.CollabMapper.toResponseDTO(collab));
            const response = {
                success: true,
                data: {
                    items: responseDTOs,
                    pagination: result.pagination
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: {
                    code: 'LIST_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to list collaborations'
                }
            };
            res.status(500).json(response);
        }
    }
}
exports.CollabController = CollabController;
