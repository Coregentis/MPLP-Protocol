/**
 * Core API控制器
 * 提供Core模块的HTTP API接口
 * 遵循RESTful API设计原则
 */

import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreMapper } from '../mappers/core.mapper';
import { CoreDto } from '../dto/core.dto';
import { CoreEntity } from '../../domain/entities/core.entity';
import {
  UUID,
  WorkflowStatusType,
  WorkflowStageType,
  Priority,
  ExecutionMode,
  CoreOperation,
  MonitoringProvider,
  ExportFormat,
  OrchestrationMode,
  ResourceAllocation,
  FaultTolerance,
  StageStatus,
  IndexingStrategy
} from '../../types';

// ===== API请求/响应类型 =====

export interface CreateWorkflowRequest {
  workflowId: UUID;
  orchestratorId: UUID;
  workflowConfig: {
    name: string;
    description?: string;
    stages: WorkflowStageType[];
    executionMode?: ExecutionMode;
    parallelExecution?: boolean;
    priority?: Priority;
    timeoutMs?: number;
    maxConcurrentExecutions?: number;
  };
  executionContext: {
    userId?: string;
    sessionId?: UUID;
    requestId?: UUID;
    priority?: Priority;
    metadata?: Record<string, unknown>;
  };
  coreOperation: CoreOperation;
  coreDetails?: {
    orchestrationMode?: string;
    resourceAllocation?: string;
    faultTolerance?: string;
  };
}

export interface CreateWorkflowResponse {
  success: boolean;
  data?: CoreDto;
  error?: string;
}

export interface GetWorkflowResponse {
  success: boolean;
  data?: CoreDto;
  error?: string;
}

export interface UpdateWorkflowStatusRequest {
  status: WorkflowStatusType;
}

export interface UpdateWorkflowStatusResponse {
  success: boolean;
  data?: CoreDto;
  error?: string;
}

export interface ExecuteWorkflowRequest {
  workflowId: UUID;
  contextId: UUID;
  stages: WorkflowStageType[];
  executionMode?: ExecutionMode;
  priority?: Priority;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface ExecuteWorkflowResponse {
  success: boolean;
  data?: {
    workflowId: UUID;
    executionId: UUID;
    status: WorkflowStatusType;
    startTime: string;
    endTime?: string;
    durationMs?: number;
    stageResults: Record<string, {
      status: string;
      result?: Record<string, unknown>;
      error?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

export interface CoordinateModuleRequest {
  sourceModule: string;
  targetModule: string;
  operation: string;
  payload: Record<string, unknown>;
}

export interface CoordinateModuleResponse {
  success: boolean;
  data?: {
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
    executionTime: number;
  };
  error?: string;
}

export interface ActivateInterfaceRequest {
  moduleId: string;
  interfaceId: string;
  parameters: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ActivateInterfaceResponse {
  success: boolean;
  data?: {
    success: boolean;
    interfaceId: string;
    activatedAt: string;
    result?: Record<string, unknown>;
    error?: string;
  };
  error?: string;
}

export interface AllocateResourcesRequest {
  executionId: string;
  resourceRequirements: {
    cpuCores?: number;
    memoryMb?: number;
    diskSpaceMb?: number;
    networkBandwidthMbps?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDurationMs?: number;
  };
}

export interface AllocateResourcesResponse {
  success: boolean;
  data?: {
    allocationId: UUID;
    executionId: string;
    allocatedResources: {
      cpuCores: number;
      memoryMb: number;
      diskSpaceMb: number;
      networkBandwidthMbps: number;
    };
    allocationTime: string;
    estimatedReleaseTime?: string;
    status: string;
  };
  error?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  data?: {
    overall: string;
    modules: Array<{
      moduleId: string;
      moduleName: string;
      status: string;
      lastCheck: string;
      responseTime: number;
      errorCount: number;
    }>;
    resources: {
      cpu: { usage: number; status: string };
      memory: { usage: number; status: string };
      disk: { usage: number; status: string };
      network: { usage: number; status: string };
    };
    network: {
      connectivity: string;
      latency: number;
      throughput: number;
      errorRate: number;
      activeConnections: number;
    };
    timestamp: string;
  };
  error?: string;
}

export interface CreateAlertRequest {
  alertType: 'performance' | 'error' | 'security' | 'resource' | 'system';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAlertResponse {
  success: boolean;
  data?: {
    alertId: UUID;
    processed: boolean;
    actions: string[];
    notifications: string[];
    escalated: boolean;
    resolvedAt?: string;
  };
  error?: string;
}

/**
 * Core API控制器类
 * 处理所有Core模块相关的HTTP请求
 */
export class CoreController {
  constructor(
    private readonly coreManagementService: CoreManagementService,
    private readonly coreOrchestrationService: CoreOrchestrationService,
    private readonly _coreResourceService: CoreResourceService, // Reserved for future resource management APIs
    private readonly _coreMonitoringService: CoreMonitoringService // Reserved for future monitoring APIs
  ) {}

  // ===== 工作流管理API =====

  /**
   * 创建工作流
   * POST /api/core/workflows
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    try {
      const coreEntity = await this.coreManagementService.createWorkflow({
        workflowId: request.workflowId,
        orchestratorId: request.orchestratorId,
        workflowConfig: {
          ...request.workflowConfig,
          executionMode: request.workflowConfig.executionMode || ExecutionMode.SEQUENTIAL,
          parallelExecution: request.workflowConfig.parallelExecution || false,
          priority: request.workflowConfig.priority || Priority.MEDIUM
        },
        executionContext: request.executionContext,
        coreOperation: request.coreOperation,
        coreDetails: request.coreDetails ? {
          orchestrationMode: request.coreDetails.orchestrationMode as OrchestrationMode,
          resourceAllocation: request.coreDetails.resourceAllocation as ResourceAllocation,
          faultTolerance: request.coreDetails.faultTolerance as FaultTolerance
        } : undefined
      });

      const coreDto = this.entityToDto(coreEntity);

      return {
        success: true,
        data: coreDto
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 获取工作流
   * GET /api/core/workflows/:workflowId
   */
  async getWorkflow(workflowId: UUID): Promise<GetWorkflowResponse> {
    try {
      const coreEntity = await this.coreManagementService.getWorkflowById(workflowId);
      
      if (!coreEntity) {
        return {
          success: false,
          error: `Workflow not found: ${workflowId}`
        };
      }

      const coreDto = this.entityToDto(coreEntity);

      return {
        success: true,
        data: coreDto
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 更新工作流状态
   * PUT /api/core/workflows/:workflowId/status
   */
  async updateWorkflowStatus(
    workflowId: UUID, 
    request: UpdateWorkflowStatusRequest
  ): Promise<UpdateWorkflowStatusResponse> {
    try {
      const coreEntity = await this.coreManagementService.updateWorkflowStatus(
        workflowId, 
        request.status
      );

      const coreDto = this.entityToDto(coreEntity);

      return {
        success: true,
        data: coreDto
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 删除工作流
   * DELETE /api/core/workflows/:workflowId
   */
  async deleteWorkflow(workflowId: UUID): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await this.coreManagementService.deleteWorkflow(workflowId);

      return {
        success: deleted
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 获取所有工作流
   * GET /api/core/workflows
   */
  async getAllWorkflows(): Promise<{ success: boolean; data?: CoreDto[]; error?: string }> {
    try {
      const coreEntities = await this.coreManagementService.getAllWorkflows();
      const coreDtos = coreEntities.map(entity => this.entityToDto(entity));

      return {
        success: true,
        data: coreDtos
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // ===== 工作流编排API =====

  /**
   * 执行工作流
   * POST /api/core/orchestration/execute
   */
  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<ExecuteWorkflowResponse> {
    try {
      const result = await this.coreOrchestrationService.executeWorkflow({
        workflowId: request.workflowId,
        contextId: request.contextId,
        stages: request.stages,
        executionMode: request.executionMode,
        priority: request.priority,
        timeout: request.timeout,
        metadata: request.metadata
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 将实体转换为DTO
   */
  private entityToDto(entity: CoreEntity): CoreDto {
    // 使用映射器进行转换
    const schema = CoreMapper.toSchema(entity);
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      workflowId: schema.workflow_id,
      orchestratorId: schema.orchestrator_id,
      workflowConfig: {
        name: schema.workflow_config.name || 'Default Workflow',
        description: schema.workflow_config.description,
        stages: schema.workflow_config.stages as WorkflowStageType[],
        executionMode: schema.workflow_config.execution_mode as ExecutionMode,
        parallelExecution: schema.workflow_config.parallel_execution,
        priority: schema.workflow_config.priority as Priority,
        timeoutMs: schema.workflow_config.timeout_ms,
        maxConcurrentExecutions: schema.workflow_config.max_concurrent_executions,
        retryPolicy: schema.workflow_config.retry_policy ? {
          maxAttempts: schema.workflow_config.retry_policy.max_attempts,
          delayMs: schema.workflow_config.retry_policy.delay_ms,
          backoffFactor: schema.workflow_config.retry_policy.backoff_factor
        } : undefined
      },
      executionContext: {
        userId: schema.execution_context.user_id,
        sessionId: schema.execution_context.session_id,
        requestId: schema.execution_context.request_id,
        priority: schema.execution_context.priority as Priority,
        metadata: schema.execution_context.metadata,
        variables: schema.execution_context.variables
      },
      executionStatus: {
        status: schema.execution_status.status as WorkflowStatusType,
        currentStage: schema.execution_status.current_stage as WorkflowStageType,
        completedStages: schema.execution_status.completed_stages as WorkflowStageType[],
        stageResults: schema.execution_status.stage_results ? Object.fromEntries(
          Object.entries(schema.execution_status.stage_results).map(([key, result]) => [
            key,
            {
              status: result.status as StageStatus,
              startTime: result.start_time,
              endTime: result.end_time,
              durationMs: result.duration_ms,
              result: result.result,
              error: result.error
            }
          ])
        ) : undefined,
        startTime: schema.execution_status.start_time,
        endTime: schema.execution_status.end_time,
        durationMs: schema.execution_status.duration_ms,
        retryCount: schema.execution_status.retry_count
      },
      auditTrail: {
        enabled: schema.audit_trail.enabled,
        retentionDays: schema.audit_trail.retention_days
      },
      monitoringIntegration: {
        enabled: schema.monitoring_integration.enabled,
        supportedProviders: schema.monitoring_integration.supported_providers as MonitoringProvider[],
        exportFormats: schema.monitoring_integration.export_formats as ExportFormat[]
      },
      performanceMetrics: {
        enabled: schema.performance_metrics.enabled,
        collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds
      },
      versionHistory: {
        enabled: schema.version_history.enabled,
        maxVersions: schema.version_history.max_versions
      },
      searchMetadata: {
        enabled: schema.search_metadata.enabled,
        indexingStrategy: schema.search_metadata.indexing_strategy as IndexingStrategy
      },
      coreOperation: schema.core_operation as CoreOperation,
      eventIntegration: {
        enabled: schema.event_integration.enabled
      }
    };
  }
}
