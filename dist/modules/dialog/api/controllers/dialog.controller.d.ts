import { DialogManagementService } from '../../application/services/dialog-management.service';
interface DialogResponseDto {
    success: boolean;
    status?: number;
    data?: unknown;
    error?: string;
    message?: string;
}
export declare class DialogController {
    private readonly dialogManagementService;
    constructor(dialogManagementService: DialogManagementService);
    createDialog(request: CreateDialogRequest): Promise<DialogResponseDto>;
    getDialog(request: GetDialogRequest): Promise<DialogResponseDto>;
    updateDialog(request: UpdateDialogRequest): Promise<DialogResponseDto>;
    listDialogs(request: ListDialogsRequest): Promise<DialogResponseDto>;
    deleteDialog(request: DeleteDialogRequest): Promise<DialogResponseDto>;
    startDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    pauseDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    resumeDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    endDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    searchDialogs(request: {
        query?: string;
        fields?: string[];
        limit?: number;
    }): Promise<DialogResponseDto>;
    addParticipant(request: {
        params: {
            id: string;
        };
        body: {
            participantId: string;
        };
    }): Promise<DialogResponseDto>;
    removeParticipant(request: {
        params: {
            id: string;
            participantId: string;
        };
    }): Promise<DialogResponseDto>;
    getStatistics(): Promise<DialogResponseDto>;
    executeDialogOperation(request: ExecuteOperationRequest): Promise<DialogResponseDto>;
    private _validateCreateRequest;
    private _validateUpdateRequest;
    private _validateDialogId;
    private _validateOperation;
    private _mapCreateDtoToSchema;
    private _mapUpdateDtoToSchema;
    private _mapEntityToResponseDto;
    private _handleError;
}
export interface CreateDialogRequest {
    name: string;
    description?: string;
    participants: string[];
    capabilities?: unknown;
    strategy?: unknown;
    context?: unknown;
    configuration?: unknown;
    metadata?: Record<string, unknown>;
}
export interface GetDialogRequest {
    id: string;
}
export interface UpdateDialogRequest {
    id: string;
    name?: string;
    description?: string;
    participants?: string[];
    capabilities?: unknown;
    strategy?: unknown;
    context?: unknown;
    configuration?: unknown;
    metadata?: Record<string, unknown>;
}
export interface DeleteDialogRequest {
    id: string;
}
export interface ListDialogsRequest {
    limit?: number;
    offset?: number;
}
export interface ExecuteOperationRequest {
    id: string;
    operation: string;
}
export {};
//# sourceMappingURL=dialog.controller.d.ts.map