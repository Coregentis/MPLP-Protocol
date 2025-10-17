import { Request, Response } from 'express';
import { CollabManagementService } from '../../application/services/collab-management.service';
export declare class CollabController {
    private readonly collabManagementService;
    constructor(collabManagementService: CollabManagementService);
    createCollaboration(req: Request, res: Response): Promise<void>;
    getCollaboration(req: Request, res: Response): Promise<void>;
    updateCollaboration(req: Request, res: Response): Promise<void>;
    deleteCollaboration(req: Request, res: Response): Promise<void>;
    listCollaborations(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=collab.controller.d.ts.map