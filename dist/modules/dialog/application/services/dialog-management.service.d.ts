import { DialogEntity } from '../../domain/entities/dialog.entity';
import { type DialogRepository } from '../../domain/repositories/dialog.repository';
import { type DialogSchema, type UUID, type DialogOperation, type IDialogFlowEngine, type IDialogStateManager, type INLPProcessor } from '../../types';
export interface CrossCuttingConcerns {
    security: Record<string, unknown>;
    performance: Record<string, unknown>;
    eventBus: Record<string, unknown>;
    errorHandling: Record<string, unknown>;
    coordination: Record<string, unknown>;
    orchestration: Record<string, unknown>;
    stateSync: Record<string, unknown>;
    transaction: Record<string, unknown>;
    protocolVersion: Record<string, unknown>;
}
export declare class DialogManagementService {
    private readonly dialogRepository;
    private readonly crossCuttingConcerns;
    private readonly flowEngine;
    private readonly stateManager;
    private readonly nlpProcessor;
    constructor(dialogRepository: DialogRepository, crossCuttingConcerns: CrossCuttingConcerns, flowEngine?: IDialogFlowEngine, stateManager?: IDialogStateManager, nlpProcessor?: INLPProcessor);
    createDialog(dialogData: Partial<DialogSchema> | Partial<DialogEntity>): Promise<DialogEntity>;
    getDialog(dialogId: UUID): Promise<DialogEntity | null>;
    sendMessage(dialogId: UUID, message: {
        content: string;
        type: 'text' | 'image' | 'audio' | 'video' | 'file';
        metadata?: Record<string, unknown>;
    }, senderId: UUID): Promise<{
        messageId: UUID;
        timestamp: string;
        status: 'sent' | 'delivered' | 'failed';
        processingTime: number;
    }>;
    getDialogHistory(dialogId: UUID, options?: {
        limit?: number;
        offset?: number;
        fromDate?: string;
        toDate?: string;
        messageType?: string;
        participantId?: UUID;
    }): Promise<{
        messages: Array<{
            messageId: UUID;
            senderId: UUID;
            content: string;
            type: string;
            timestamp: string;
            metadata?: Record<string, unknown>;
        }>;
        total: number;
        hasMore: boolean;
    }>;
    updateDialogState(dialogId: UUID, newState: {
        status?: 'active' | 'paused' | 'ended' | 'archived';
        participants?: UUID[];
        capabilities?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): Promise<{
        success: boolean;
        previousState: Record<string, unknown>;
        newState: Record<string, unknown>;
        timestamp: string;
    }>;
    addParticipants(dialogId: UUID, participantIds: UUID[]): Promise<{
        success: boolean;
        addedParticipants: UUID[];
        currentParticipants: UUID[];
    }>;
    updateDialog(dialogId: string, updateData: Partial<DialogSchema>): Promise<DialogEntity>;
    deleteDialog(dialogId: UUID): Promise<void>;
    searchDialogs(query: Record<string, unknown>): Promise<{
        dialogs: DialogEntity[];
        total: number;
        searchMetadata: {
            query: string;
            searchTime: number;
            totalResults: number;
        };
    }>;
    coordinateIntelligentDialogStart(_dialogConfig: Record<string, unknown>, _participants: string[], _contextRequirements: Record<string, unknown>): Promise<Record<string, unknown> | null>;
    coordinateMultimodalDialogProcessing(_dialogId: UUID, _modalityData: Record<string, unknown>, _processingOptions: Record<string, unknown>): Promise<void>;
    getDialogContext(_dialogId: UUID, _contextId?: UUID): Promise<Record<string, unknown> | null>;
    updateDialogContext(_dialogId: UUID, _contextData: Record<string, unknown>): Promise<void>;
    executeDialogOperation(_dialogId: UUID, _operation: DialogOperation): Promise<void>;
    private _validateSecurity;
    private _generateDialogId;
    private _publishEvent;
    private _handleError;
    private _validateAccess;
    private _recordAccess;
    private _validateUpdateAccess;
    private _validateDeleteAccess;
    private _validateSearchAccess;
    private _recordSearch;
    private _validateMessageContent;
    private _processMultimodalContent;
    private _storeMessage;
    private _updateDialogActivity;
    private _getStoredMessages;
    private _validateStateTransition;
    private _validateParticipantPermissions;
    listDialogs(options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    addParticipant(dialogId: string, participantId: string): Promise<DialogEntity>;
    getDialogById(dialogId: string): Promise<DialogEntity | null>;
    removeParticipant(dialogId: string, participantId: string): Promise<DialogEntity>;
    getDialogsByParticipant(participantId: string): Promise<{
        dialogs: DialogEntity[];
    }>;
    pauseDialog(dialogId: string): Promise<DialogEntity>;
    resumeDialog(_dialogId: string): Promise<DialogEntity>;
    endDialog(dialogId: string): Promise<DialogEntity>;
    getDialogStatistics(): Promise<{
        totalDialogs: number;
        averageParticipants: number;
        activeDialogs: number;
        endedDialogs: number;
        dialogsByCapability: Record<string, number>;
        recentActivity: {
            dailyCreated: number[];
            weeklyActive: number[];
        };
    }>;
    batchDeleteDialogs(dialogIds: string[]): Promise<{
        successful: string[];
        failed: {
            id: string;
            error: string;
        }[];
    }>;
    batchUpdateDialogStatus(dialogIds: string[], status: string): Promise<{
        successful: string[];
        failed: {
            id: string;
            error: string;
        }[];
    }>;
    getDialogsByStatus(status: string): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    getDialogsByCapability(capability: string): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    startDialog(dialogId: string): Promise<DialogEntity>;
    getDetailedDialogStatistics(): Promise<{
        overview: {
            total: number;
            active: number;
            ended: number;
        };
        capabilities: Record<string, number>;
        participants: {
            averagePerDialog: number;
            totalUnique: number;
        };
        performance: {
            averageResponseTime: number;
            successRate: number;
        };
        trends: {
            dailyCreated: number[];
            weeklyActive: number[];
        };
    }>;
    private _logStateChange;
}
//# sourceMappingURL=dialog-management.service.d.ts.map