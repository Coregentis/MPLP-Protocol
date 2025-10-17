export interface CoordinationRequest {
    id: string;
    sourceModule: string;
    targetModule: string;
    operation: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
export interface CoordinationResponse {
    requestId: string;
    status: 'success' | 'error' | 'pending';
    result?: Record<string, unknown>;
    error?: string;
    timestamp: string;
}
export declare class MLPPCoordinationManager {
    private pendingRequests;
    coordinateOperation(_sourceModule: string, _targetModule: string, _operation: string, _payload: Record<string, unknown>): Promise<CoordinationResponse>;
    getPendingRequests(): CoordinationRequest[];
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=coordination-manager.d.ts.map