/**
 * Collab Controller - API Layer
 * @description Multi-Agent Collaboration Scheduling and Coordination Center
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { Request, Response } from 'express';
import { CollabManagementService } from '../../application/services/collab-management.service';
/**
 * Collab API Controller
 * Handles HTTP requests for collaboration management operations
 */
export declare class CollabController {
    private readonly collabManagementService;
    constructor(collabManagementService: CollabManagementService);
    /**
     * Create new collaboration
     * POST /api/v1/collab
     */
    createCollaboration(req: Request, res: Response): Promise<void>;
    /**
     * Get collaboration by ID
     * GET /api/v1/collab/:id
     */
    getCollaboration(req: Request, res: Response): Promise<void>;
    /**
     * Update collaboration
     * PUT /api/v1/collab/:id
     */
    updateCollaboration(req: Request, res: Response): Promise<void>;
    /**
     * Delete collaboration
     * DELETE /api/v1/collab/:id
     */
    deleteCollaboration(req: Request, res: Response): Promise<void>;
    /**
     * List collaborations with pagination
     * GET /api/v1/collab
     */
    listCollaborations(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=collab.controller.d.ts.map