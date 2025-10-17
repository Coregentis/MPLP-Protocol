"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusDto = exports.BatchOperationResultDto = exports.TraceOperationResultDto = exports.TraceQueryResultDto = exports.TraceResponseDto = exports.TraceDetailsDto = exports.DecisionLogDto = exports.ErrorInformationDto = exports.ContextSnapshotDto = exports.EventObjectDto = exports.TraceQueryDto = exports.UpdateTraceDto = exports.CreateTraceDto = void 0;
class CreateTraceDto {
    contextId;
    planId;
    taskId;
    traceType;
    severity;
    event;
    traceOperation;
    contextSnapshot;
    errorInformation;
    decisionLog;
    traceDetails;
}
exports.CreateTraceDto = CreateTraceDto;
class UpdateTraceDto {
    traceId;
    severity;
    event;
    contextSnapshot;
    errorInformation;
    decisionLog;
    traceDetails;
}
exports.UpdateTraceDto = UpdateTraceDto;
class TraceQueryDto {
    contextId;
    planId;
    taskId;
    traceType;
    severity;
    eventCategory;
    createdAfter;
    createdBefore;
    hasErrors;
    hasDecisions;
}
exports.TraceQueryDto = TraceQueryDto;
class EventObjectDto {
    type;
    name;
    description;
    category;
    source;
    data;
}
exports.EventObjectDto = EventObjectDto;
class ContextSnapshotDto {
    variables;
    callStack;
    environment;
}
exports.ContextSnapshotDto = ContextSnapshotDto;
class ErrorInformationDto {
    errorCode;
    errorMessage;
    errorType;
    stackTrace;
    recoveryActions;
}
exports.ErrorInformationDto = ErrorInformationDto;
class DecisionLogDto {
    decisionPoint;
    optionsConsidered;
    selectedOption;
    decisionCriteria;
    confidenceLevel;
}
exports.DecisionLogDto = DecisionLogDto;
class TraceDetailsDto {
    traceLevel;
    samplingRate;
    retentionDays;
}
exports.TraceDetailsDto = TraceDetailsDto;
class TraceResponseDto {
    traceId;
    contextId;
    planId;
    taskId;
    traceType;
    severity;
    event;
    timestamp;
    traceOperation;
    contextSnapshot;
    errorInformation;
    decisionLog;
    traceDetails;
    protocolVersion;
}
exports.TraceResponseDto = TraceResponseDto;
class TraceQueryResultDto {
    traces;
    total;
    page;
    limit;
}
exports.TraceQueryResultDto = TraceQueryResultDto;
class TraceOperationResultDto {
    success;
    traceId;
    message;
    data;
    error;
}
exports.TraceOperationResultDto = TraceOperationResultDto;
class BatchOperationResultDto {
    successCount;
    failureCount;
    results;
}
exports.BatchOperationResultDto = BatchOperationResultDto;
class HealthStatusDto {
    status;
    timestamp;
    details;
}
exports.HealthStatusDto = HealthStatusDto;
