/**
 * Trace模块统一导出
 *
 * @description 提供Trace模块的统一导出接口
 * @version 1.0.0
 * @schema 基于 mplp-trace.json Schema驱动开发
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

// ===== API层导出 ===== (MANDATORY SECTION)
export * from './api/controllers/trace.controller';
export * from './api/dto/trace.dto';
export * from './api/mappers/trace.mapper';

// ===== 应用层导出 ===== (MANDATORY SECTION)
export * from './application/services/trace-management.service';

// ===== 领域层导出 ===== (MANDATORY SECTION)
export * from './domain/entities/trace.entity';
export * from './domain/repositories/trace-repository.interface';

// ===== 基础设施层导出 ===== (MANDATORY SECTION)
export * from './infrastructure/repositories/trace.repository';
export * from './infrastructure/protocols/trace.protocol';
export * from './infrastructure/factories/trace-protocol.factory';

// ===== 类型定义导出 ===== (MANDATORY SECTION)
export type {
  UUID,
  TraceType,
  TraceSeverity,
  TraceEntityData,
  EventObject,
  ErrorInformation,
  DecisionLog,
  ContextSnapshot,
  TraceQueryFilter,
  TraceOperationResult,
  TraceStatistics,
  HealthStatus,
  VersionHistory,
  SearchIndex,
  EventIntegration,
  TraceProtocolFactoryConfig,
  // 添加所有缺失的类型导出
  Severity,
  EventType,
  EventCategory,
  ErrorType,
  CorrelationType,
  MonitoringProvider,
  ExportFormat,
  IndexingStrategy,
  SearchableField,
  TraceOperation,
  PublishedEvent,
  SubscribedEvent,
  TraceSchema,
  CreateTraceRequest,
  UpdateTraceRequest,
  EventSource,
  Environment,
  CallStackFrame,
  StackFrame,
  RecoveryAction,
  DecisionOption,
  DecisionCriterion,
  Correlation,
  AuditTrail,
  AuditEvent,
  ComplianceSettings,
  PerformanceMetrics,
  MetricsData,
  AlertingConfig,
  MonitoringIntegration,
  IntegrationEndpoints,
  SamplingConfig,
  VersionRecord,
  AutoVersioning,
  SearchMetadata,
  AutoIndexing,
  EventBusConnection,
  EventRouting,
  TraceDetails,
  Timestamp
} from './types';

// ===== 具体类导出 ===== (MANDATORY SECTION)
export { TraceEntity } from './domain/entities/trace.entity';
export { TraceController } from './api/controllers/trace.controller';
export { TraceManagementService } from './application/services/trace-management.service';
export { TraceRepository } from './infrastructure/repositories/trace.repository';
export { TraceProtocol } from './infrastructure/protocols/trace.protocol';
export { TraceMapper } from './api/mappers/trace.mapper';
export { TraceProtocolFactory } from './infrastructure/factories/trace-protocol.factory';
