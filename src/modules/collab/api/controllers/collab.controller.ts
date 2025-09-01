/**
 * Collab Controller - API Layer
 * @description Multi-Agent Collaboration Scheduling and Coordination Center
 * @version 1.0.0
 * @author MPLP Development Team
 */

import { Request, Response } from 'express';
import { CollabManagementService } from '../../application/services/collab-management.service';
import { CollabMapper } from '../mappers/collab.mapper';
import { CollabCreateDTO, CollabUpdateDTO, CollabResponseDTO } from '../dto/collab.dto';
import { UUID } from '../../../../shared/types';
import { OperationResult } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';

/**
 * Collab API Controller
 * Handles HTTP requests for collaboration management operations
 */
export class CollabController {

  constructor(
    private readonly collabManagementService: CollabManagementService
  ) {}

  /**
   * Create new collaboration
   * POST /api/v1/collab
   */
  async createCollaboration(req: Request, res: Response): Promise<void> {
    try {
      const createDTO: CollabCreateDTO = req.body;
      const entityData = CollabMapper.fromCreateDTO(createDTO);

      const collaboration = await this.collabManagementService.createCollaboration(entityData);
      const responseDTO = CollabMapper.toResponseDTO(collaboration);

      const response: OperationResult<CollabResponseDTO> = {
        success: true,
        data: responseDTO
      };

      res.status(201).json(response);
    } catch (error) {
      const response: OperationResult<null> = {
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create collaboration'
        }
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get collaboration by ID
   * GET /api/v1/collab/:id
   */
  async getCollaboration(req: Request, res: Response): Promise<void> {
    try {
      const collaborationId = req.params.id as UUID;
      const collaboration = await this.collabManagementService.getCollaboration(collaborationId);

      if (!collaboration) {
        const response: OperationResult<null> = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Collaboration not found'
          }
        };
        res.status(404).json(response);
        return;
      }

      const responseDTO = CollabMapper.toResponseDTO(collaboration);
      const response: OperationResult<CollabResponseDTO> = {
        success: true,
        data: responseDTO
      };

      res.status(200).json(response);
    } catch (error) {
      const response: OperationResult<null> = {
        success: false,
        error: {
          code: 'RETRIEVAL_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get collaboration'
        }
      };

      res.status(500).json(response);
    }
  }

  /**
   * Update collaboration
   * PUT /api/v1/collab/:id
   */
  async updateCollaboration(req: Request, res: Response): Promise<void> {
    try {
      const collaborationId = req.params.id as UUID;
      const updateDTO: CollabUpdateDTO = req.body;

      const updateData = CollabMapper.fromUpdateDTO(updateDTO);
      const collaboration = await this.collabManagementService.updateCollaboration(collaborationId, updateData);

      const responseDTO = CollabMapper.toResponseDTO(collaboration);
      const response: OperationResult<CollabResponseDTO> = {
        success: true,
        data: responseDTO
      };

      res.status(200).json(response);
    } catch (error) {
      const response: OperationResult<null> = {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update collaboration'
        }
      };

      res.status(500).json(response);
    }
  }

  /**
   * Delete collaboration
   * DELETE /api/v1/collab/:id
   */
  async deleteCollaboration(req: Request, res: Response): Promise<void> {
    try {
      const collaborationId = req.params.id as UUID;
      await this.collabManagementService.deleteCollaboration(collaborationId);

      const response: OperationResult<null> = {
        success: true
      };

      res.status(200).json(response);
    } catch (error) {
      const response: OperationResult<null> = {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete collaboration'
        }
      };

      res.status(500).json(response);
    }
  }

  /**
   * List collaborations with pagination
   * GET /api/v1/collab
   */
  async listCollaborations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.collabManagementService.listCollaborations({ page, limit, status });

      const responseDTOs = result.items.map((collab: CollabEntity) => CollabMapper.toResponseDTO(collab));

      const response: OperationResult<{
        items: CollabResponseDTO[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }> = {
        success: true,
        data: {
          items: responseDTOs,
          pagination: result.pagination
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: OperationResult<null> = {
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
