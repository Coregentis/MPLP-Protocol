"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextOperationResultDto = exports.PaginatedContextResponseDto = exports.ContextResponseDto = exports.ContextQueryDto = exports.UpdateContextDto = exports.CreateContextDto = void 0;
class CreateContextDto {
    name;
    description;
    sharedState;
    accessControl;
    configuration;
}
exports.CreateContextDto = CreateContextDto;
class UpdateContextDto {
    name;
    description;
    status;
    lifecycleStage;
    sharedState;
    accessControl;
    configuration;
}
exports.UpdateContextDto = UpdateContextDto;
class ContextQueryDto {
    status;
    lifecycleStage;
    owner;
    createdAfter;
    createdBefore;
    namePattern;
}
exports.ContextQueryDto = ContextQueryDto;
class ContextResponseDto {
    contextId;
    name;
    description;
    status;
    lifecycleStage;
    protocolVersion;
    timestamp;
    sharedState;
    accessControl;
    configuration;
    auditTrail;
    monitoringIntegration;
    performanceMetrics;
    versionHistory;
    searchMetadata;
    cachingPolicy;
    syncConfiguration;
    errorHandling;
    integrationEndpoints;
    eventIntegration;
}
exports.ContextResponseDto = ContextResponseDto;
class PaginatedContextResponseDto {
    data;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedContextResponseDto = PaginatedContextResponseDto;
class ContextOperationResultDto {
    success;
    contextId;
    message;
    error;
    metadata;
}
exports.ContextOperationResultDto = ContextOperationResultDto;
