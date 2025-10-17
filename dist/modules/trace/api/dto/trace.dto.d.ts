import { TraceType, Severity, EventType, EventCategory, TraceOperation, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, EventObject, ContextSnapshot, ErrorInformation, DecisionLog, TraceDetails } from '../../types';
import { UUID } from '../../../../shared/types';
export declare class CreateTraceDto implements CreateTraceRequest {
    contextId: UUID;
    planId?: UUID;
    taskId?: UUID;
    traceType: TraceType;
    severity: Severity;
    event: EventObject;
    traceOperation: TraceOperation;
    contextSnapshot?: ContextSnapshot;
    errorInformation?: ErrorInformation;
    decisionLog?: DecisionLog;
    traceDetails?: TraceDetails;
}
export declare class UpdateTraceDto implements UpdateTraceRequest {
    traceId: UUID;
    severity?: Severity;
    event?: Partial<EventObject>;
    contextSnapshot?: Partial<ContextSnapshot>;
    errorInformation?: Partial<ErrorInformation>;
    decisionLog?: Partial<DecisionLog>;
    traceDetails?: Partial<TraceDetails>;
}
export declare class TraceQueryDto implements TraceQueryFilter {
    contextId?: UUID;
    planId?: UUID;
    taskId?: UUID;
    traceType?: TraceType | TraceType[];
    severity?: Severity | Severity[];
    eventCategory?: EventCategory;
    createdAfter?: string;
    createdBefore?: string;
    hasErrors?: boolean;
    hasDecisions?: boolean;
}
export declare class EventObjectDto implements EventObject {
    type: EventType;
    name: string;
    description?: string;
    category: EventCategory;
    source: {
        component: string;
        module?: string;
        function?: string;
        lineNumber?: number;
    };
    data?: Record<string, unknown>;
}
export declare class ContextSnapshotDto implements ContextSnapshot {
    variables?: Record<string, unknown>;
    callStack?: Array<{
        function: string;
        file: string;
        line: number;
        arguments?: Record<string, unknown>;
    }>;
    environment?: {
        os: string;
        platform: string;
        runtimeVersion: string;
        environmentVariables?: Record<string, string>;
    };
}
export declare class ErrorInformationDto implements ErrorInformation {
    errorCode: string;
    errorMessage: string;
    errorType: 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';
    stackTrace?: Array<{
        file: string;
        function: string;
        line: number;
        column?: number;
    }>;
    recoveryActions?: Array<{
        action: 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';
        description: string;
        parameters?: Record<string, unknown>;
    }>;
}
export declare class DecisionLogDto implements DecisionLog {
    decisionPoint: string;
    optionsConsidered: Array<{
        option: string;
        score: number;
        rationale?: string;
        riskFactors?: string[];
    }>;
    selectedOption: string;
    decisionCriteria?: Array<{
        criterion: string;
        weight: number;
        evaluation: string;
    }>;
    confidenceLevel?: number;
}
export declare class TraceDetailsDto implements TraceDetails {
    traceLevel?: 'basic' | 'detailed' | 'comprehensive';
    samplingRate?: number;
    retentionDays?: number;
}
export declare class TraceResponseDto {
    traceId: UUID;
    contextId: UUID;
    planId?: UUID;
    taskId?: UUID;
    traceType: TraceType;
    severity: Severity;
    event: EventObjectDto;
    timestamp: string;
    traceOperation: TraceOperation;
    contextSnapshot?: ContextSnapshotDto;
    errorInformation?: ErrorInformationDto;
    decisionLog?: DecisionLogDto;
    traceDetails?: TraceDetailsDto;
    protocolVersion: string;
}
export declare class TraceQueryResultDto {
    traces: TraceResponseDto[];
    total: number;
    page?: number;
    limit?: number;
}
export declare class TraceOperationResultDto {
    success: boolean;
    traceId?: UUID;
    message: string;
    data?: TraceResponseDto;
    error?: string;
}
export declare class BatchOperationResultDto {
    successCount: number;
    failureCount: number;
    results: Array<{
        id: UUID;
        success: boolean;
        error?: string;
    }>;
}
export declare class HealthStatusDto {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    details?: {
        service: string;
        version: string;
        repository: {
            status: string;
            recordCount: number;
            lastOperation: string;
        };
    };
}
//# sourceMappingURL=trace.dto.d.ts.map