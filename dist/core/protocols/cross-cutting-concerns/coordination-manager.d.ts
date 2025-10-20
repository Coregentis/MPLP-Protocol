/**
 * MPLP协调管理器
 *
 * @description L3层统一协调管理，提供模块间协调和工作流编排功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 协调请求接口
 */
export interface CoordinationRequest {
    id: string;
    sourceModule: string;
    targetModule: string;
    operation: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
/**
 * 协调响应接口
 */
export interface CoordinationResponse {
    requestId: string;
    status: 'success' | 'error' | 'pending';
    result?: Record<string, unknown>;
    error?: string;
    timestamp: string;
}
/**
 * MPLP协调管理器
 *
 * @description 统一的协调管理实现，等待CoreOrchestrator激活
 */
export declare class MLPPCoordinationManager {
    private pendingRequests;
    /**
     * 发起协调请求
     */
    coordinateOperation(_sourceModule: string, _targetModule: string, _operation: string, _payload: Record<string, unknown>): Promise<CoordinationResponse>;
    /**
     * 获取待处理的协调请求
     */
    getPendingRequests(): CoordinationRequest[];
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=coordination-manager.d.ts.map