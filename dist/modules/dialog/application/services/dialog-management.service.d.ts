/**
 * Dialog管理服务
 *
 * @description Dialog模块的核心应用服务，协调领域逻辑和基础设施
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
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
/**
 * Dialog管理服务
 *
 * @description 提供Dialog的业务逻辑协调和管理功能，整合核心业务、协调场景和MPLP集成
 */
export declare class DialogManagementService {
    private readonly dialogRepository;
    private readonly crossCuttingConcerns;
    private readonly _flowEngine;
    private readonly stateManager;
    private readonly nlpProcessor;
    constructor(dialogRepository: DialogRepository, crossCuttingConcerns: CrossCuttingConcerns, flowEngine?: IDialogFlowEngine, stateManager?: IDialogStateManager, nlpProcessor?: INLPProcessor);
    /**
     * 创建新对话
     * @param dialogData 对话数据（支持Entity或Schema格式）
     * @returns 创建的对话实体
     */
    createDialog(dialogData: Partial<DialogSchema> | Partial<DialogEntity>): Promise<DialogEntity>;
    /**
     * 获取对话详情
     * @param dialogId 对话ID
     * @returns 对话实体
     */
    getDialog(dialogId: UUID): Promise<DialogEntity | null>;
    /**
     * 发送消息到对话
     * @param dialogId 对话ID
     * @param message 消息内容
     * @param senderId 发送者ID
     * @returns 消息发送结果
     */
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
    /**
     * 获取对话历史
     * @param dialogId 对话ID
     * @param options 查询选项
     * @returns 对话历史
     */
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
    /**
     * 更新对话状态
     * @param dialogId 对话ID
     * @param newState 新状态
     * @returns 更新结果
     */
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
    /**
     * 添加参与者到对话
     * @param dialogId 对话ID
     * @param participantIds 参与者ID列表
     * @returns 添加结果
     */
    addParticipants(dialogId: UUID, participantIds: UUID[]): Promise<{
        success: boolean;
        addedParticipants: UUID[];
        currentParticipants: UUID[];
    }>;
    /**
     * 更新对话
     * @param dialogId 对话ID
     * @param updateData 更新数据
     * @returns 更新后的对话
     */
    updateDialog(dialogId: string, updateData: Partial<DialogSchema>): Promise<DialogEntity>;
    /**
     * 删除对话
     * @param dialogId 对话ID
     */
    deleteDialog(dialogId: UUID): Promise<void>;
    /**
     * 搜索对话
     * @param query 搜索条件
     * @returns 对话列表
     */
    searchDialogs(query: Record<string, unknown>): Promise<{
        dialogs: DialogEntity[];
        total: number;
        searchMetadata: {
            query: string;
            searchTime: number;
            totalResults: number;
        };
    }>;
    /**
     * 协调智能对话启动流程
     * @param _dialogConfig 对话配置
     * @param _participants 参与者列表
     * @param _contextRequirements 上下文需求
     * @returns 协调结果
     */
    coordinateIntelligentDialogStart(_dialogConfig: Record<string, unknown>, _participants: string[], _contextRequirements: Record<string, unknown>): Promise<Record<string, unknown> | null>;
    /**
     * 协调多模态对话处理流程
     * @param _dialogId 对话ID
     * @param _modalityData 多模态数据
     * @param _processingOptions 处理选项
     */
    coordinateMultimodalDialogProcessing(_dialogId: UUID, _modalityData: Record<string, unknown>, _processingOptions: Record<string, unknown>): Promise<void>;
    /**
     * 获取对话上下文信息
     * @param _dialogId 对话ID
     * @param _contextId 上下文ID
     * @returns 上下文信息
     */
    getDialogContext(_dialogId: UUID, _contextId?: UUID): Promise<Record<string, unknown> | null>;
    /**
     * 更新对话上下文
     * @param _dialogId 对话ID
     * @param _contextData 上下文数据
     */
    updateDialogContext(_dialogId: UUID, _contextData: Record<string, unknown>): Promise<void>;
    /**
     * 执行对话操作
     * @param _dialogId 对话ID
     * @param _operation 操作类型
     */
    executeDialogOperation(_dialogId: UUID, _operation: DialogOperation): Promise<void>;
    private _validateSecurity;
    private _generateDialogId;
    private _publishEvent;
    private _handleError;
    private _validateAccess;
    private _recordAccess;
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
    /**
     * 列出对话
     * @param options 查询选项
     * @returns 对话列表
     */
    listDialogs(options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    /**
     * 添加参与者
     * @param _dialogId 对话ID
     * @param _participantId 参与者ID
     * @returns 更新后的对话
     */
    addParticipant(dialogId: string, participantId: string): Promise<DialogEntity>;
    /**
     * 根据ID获取对话
     * @param dialogId 对话ID
     * @returns 对话实体
     */
    getDialogById(dialogId: string): Promise<DialogEntity | null>;
    /**
     * 移除参与者
     * @param dialogId 对话ID
     * @param participantId 参与者ID
     * @returns 更新后的对话
     */
    removeParticipant(dialogId: string, participantId: string): Promise<DialogEntity>;
    /**
     * 根据参与者查询对话
     * @param participantId 参与者ID
     * @returns 对话列表
     */
    getDialogsByParticipant(participantId: string): Promise<{
        dialogs: DialogEntity[];
    }>;
    /**
     * 暂停对话
     * @param dialogId 对话ID
     * @returns 暂停后的对话
     */
    pauseDialog(dialogId: string): Promise<DialogEntity>;
    /**
     * 恢复对话
     * @param _dialogId 对话ID
     * @returns 恢复后的对话
     */
    resumeDialog(_dialogId: string): Promise<DialogEntity>;
    /**
     * 结束对话
     * @param _dialogId 对话ID
     * @returns 结束后的对话
     */
    endDialog(dialogId: string): Promise<DialogEntity>;
    /**
     * 获取对话统计信息
     * @returns 统计信息
     */
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
    /**
     * 批量删除对话
     * @param dialogIds 对话ID数组
     * @returns 批量删除结果
     */
    batchDeleteDialogs(dialogIds: string[]): Promise<{
        successful: string[];
        failed: {
            id: string;
            error: string;
        }[];
    }>;
    /**
     * 批量更新对话状态
     * @param dialogIds 对话ID列表
     * @param status 新状态
     * @returns 批量操作结果
     */
    batchUpdateDialogStatus(dialogIds: string[], status: string): Promise<{
        successful: string[];
        failed: {
            id: string;
            error: string;
        }[];
    }>;
    /**
     * 按状态查询对话
     * @param status 对话状态
     * @returns 查询结果
     */
    getDialogsByStatus(status: string): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    /**
     * 按能力查询对话
     * @param capability 能力名称
     * @returns 查询结果
     */
    getDialogsByCapability(capability: string): Promise<{
        dialogs: DialogEntity[];
        total: number;
    }>;
    /**
     * 开始对话
     * @param dialogId 对话ID
     * @returns 更新后的对话
     */
    startDialog(dialogId: string): Promise<DialogEntity>;
    /**
     * 获取详细统计信息
     * @returns 详细统计信息
     */
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