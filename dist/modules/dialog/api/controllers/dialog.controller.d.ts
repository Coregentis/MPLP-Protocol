/**
 * Dialog API Controller
 * @description Dialog模块API控制器 - HTTP接口层
 * @version 1.0.0
 */
import { DialogManagementService } from '../../application/services/dialog-management.service';
interface DialogResponseDto {
    success: boolean;
    status?: number;
    data?: unknown;
    error?: string;
    message?: string;
}
/**
 * Dialog API控制器类
 * 处理Dialog模块的HTTP请求
 */
export declare class DialogController {
    private readonly dialogManagementService;
    constructor(dialogManagementService: DialogManagementService);
    /**
     * 创建新对话
     * POST /api/v1/dialogs
     */
    createDialog(request: CreateDialogRequest): Promise<DialogResponseDto>;
    /**
     * 获取对话详情
     * GET /api/v1/dialogs/:id
     */
    getDialog(request: GetDialogRequest): Promise<DialogResponseDto>;
    /**
     * 更新对话
     * PUT /api/v1/dialogs/:id
     */
    updateDialog(request: UpdateDialogRequest): Promise<DialogResponseDto>;
    /**
     * 列出对话
     * GET /api/v1/dialogs
     */
    listDialogs(request: ListDialogsRequest): Promise<DialogResponseDto>;
    /**
     * 删除对话
     * DELETE /api/v1/dialogs/:id
     */
    deleteDialog(request: DeleteDialogRequest): Promise<DialogResponseDto>;
    /**
     * 开始对话
     * POST /api/v1/dialogs/:id/start
     */
    startDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 暂停对话
     * POST /api/v1/dialogs/:id/pause
     */
    pauseDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 恢复对话
     * POST /api/v1/dialogs/:id/resume
     */
    resumeDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 结束对话
     * POST /api/v1/dialogs/:id/end
     */
    endDialog(request: {
        params: {
            id: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 搜索对话
     * GET /api/v1/dialogs/search
     */
    searchDialogs(request: {
        query?: string;
        fields?: string[];
        limit?: number;
    }): Promise<DialogResponseDto>;
    /**
     * 添加参与者
     * POST /api/v1/dialogs/:id/participants
     */
    addParticipant(request: {
        params: {
            id: string;
        };
        body: {
            participantId: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 移除参与者
     * DELETE /api/v1/dialogs/:id/participants/:participantId
     */
    removeParticipant(request: {
        params: {
            id: string;
            participantId: string;
        };
    }): Promise<DialogResponseDto>;
    /**
     * 获取统计信息
     * GET /api/v1/dialogs/statistics
     */
    getStatistics(): Promise<DialogResponseDto>;
    /**
     * 执行对话操作
     * POST /api/v1/dialogs/:id/operations
     */
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