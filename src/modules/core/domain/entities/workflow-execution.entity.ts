/**
 * 工作流执行实体
 * @description Core协议的核心领域实体，表示一个工作流的完整执行过程
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  UUID,
  Timestamp,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  WorkflowStatus,
  WorkflowStage,
  StageResult,
  StageStatus,
  ErrorInfo,
  ModuleCoordination,
  EventHandling
} from '../../types';

/**
 * 工作流执行实体
 */
export class WorkflowExecution {
  private _workflow_id: UUID;
  private _orchestrator_id: UUID;
  private _workflow_config: WorkflowConfig;
  private _execution_context: ExecutionContext;
  private _execution_status: ExecutionStatus;
  private _module_coordination?: ModuleCoordination;
  private _event_handling?: EventHandling;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;

  constructor(
    workflow_id: UUID,
    orchestrator_id: UUID,
    workflow_config: WorkflowConfig,
    execution_context: ExecutionContext,
    module_coordination?: ModuleCoordination,
    event_handling?: EventHandling
  ) {
    this._workflow_id = workflow_id;
    this._orchestrator_id = orchestrator_id;
    this._workflow_config = workflow_config;
    this._execution_context = execution_context;
    this._module_coordination = module_coordination;
    this._event_handling = event_handling;
    
    const now = new Date().toISOString();
    this._created_at = now;
    this._updated_at = now;
    
    // 初始化执行状态
    this._execution_status = {
      status: WorkflowStatus.CREATED,
      completed_stages: [],
      stage_results: {},
      start_time: now,
      retry_count: 0
    };
  }

  // ===== Getters =====

  get workflow_id(): UUID {
    return this._workflow_id;
  }

  get orchestrator_id(): UUID {
    return this._orchestrator_id;
  }

  get workflow_config(): WorkflowConfig {
    return { ...this._workflow_config };
  }

  get execution_context(): ExecutionContext {
    return { ...this._execution_context };
  }

  get execution_status(): ExecutionStatus {
    return { ...this._execution_status };
  }

  get module_coordination(): ModuleCoordination | undefined {
    return this._module_coordination ? { ...this._module_coordination } : undefined;
  }

  get event_handling(): EventHandling | undefined {
    return this._event_handling ? { ...this._event_handling } : undefined;
  }

  get created_at(): Timestamp {
    return this._created_at;
  }

  get updated_at(): Timestamp {
    return this._updated_at;
  }

  // ===== 状态管理方法 =====

  /**
   * 开始工作流执行
   */
  start(): void {
    if (this._execution_status.status !== WorkflowStatus.CREATED) {
      throw new Error(`Cannot start workflow in status: ${this._execution_status.status}`);
    }

    this._execution_status.status = WorkflowStatus.IN_PROGRESS;
    this._execution_status.start_time = new Date().toISOString();
    this._updated_at = new Date().toISOString();
  }

  /**
   * 暂停工作流执行
   */
  pause(): void {
    if (this._execution_status.status !== WorkflowStatus.IN_PROGRESS) {
      throw new Error(`Cannot pause workflow in status: ${this._execution_status.status}`);
    }

    this._execution_status.status = WorkflowStatus.PAUSED;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 恢复工作流执行
   */
  resume(): void {
    if (this._execution_status.status !== WorkflowStatus.PAUSED) {
      throw new Error(`Cannot resume workflow in status: ${this._execution_status.status}`);
    }

    this._execution_status.status = WorkflowStatus.IN_PROGRESS;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 完成工作流执行
   */
  complete(): void {
    if (this._execution_status.status !== WorkflowStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete workflow in status: ${this._execution_status.status}`);
    }

    const now = new Date().toISOString();
    this._execution_status.status = WorkflowStatus.COMPLETED;
    this._execution_status.end_time = now;
    
    if (this._execution_status.start_time) {
      const startTime = new Date(this._execution_status.start_time).getTime();
      const endTime = new Date(now).getTime();
      this._execution_status.duration_ms = endTime - startTime;
    }
    
    this._updated_at = now;
  }

  /**
   * 标记工作流执行失败
   */
  fail(error: ErrorInfo): void {
    if (this._execution_status.status === WorkflowStatus.COMPLETED) {
      throw new Error('Cannot fail a completed workflow');
    }

    const now = new Date().toISOString();
    this._execution_status.status = WorkflowStatus.FAILED;
    this._execution_status.end_time = now;
    
    if (this._execution_status.start_time) {
      const startTime = new Date(this._execution_status.start_time).getTime();
      const endTime = new Date(now).getTime();
      this._execution_status.duration_ms = endTime - startTime;
    }
    
    this._updated_at = now;
  }

  /**
   * 取消工作流执行
   */
  cancel(): void {
    if ([WorkflowStatus.COMPLETED, WorkflowStatus.FAILED].includes(this._execution_status.status)) {
      throw new Error(`Cannot cancel workflow in status: ${this._execution_status.status}`);
    }

    const now = new Date().toISOString();
    this._execution_status.status = WorkflowStatus.CANCELLED;
    this._execution_status.end_time = now;
    
    if (this._execution_status.start_time) {
      const startTime = new Date(this._execution_status.start_time).getTime();
      const endTime = new Date(now).getTime();
      this._execution_status.duration_ms = endTime - startTime;
    }
    
    this._updated_at = now;
  }

  // ===== 阶段管理方法 =====

  /**
   * 开始执行阶段
   */
  startStage(stage: WorkflowStage): void {
    if (!this._workflow_config.stages.includes(stage)) {
      throw new Error(`Stage ${stage} is not configured in this workflow`);
    }

    if (!this._execution_status.stage_results) {
      this._execution_status.stage_results = {};
    }

    this._execution_status.current_stage = stage;
    this._execution_status.stage_results[stage] = {
      status: StageStatus.RUNNING,
      start_time: new Date().toISOString()
    };
    
    this._updated_at = new Date().toISOString();
  }

  /**
   * 完成阶段执行
   */
  completeStage(stage: WorkflowStage, result?: Record<string, any>): void {
    if (!this._execution_status.stage_results?.[stage]) {
      throw new Error(`Stage ${stage} was not started`);
    }

    const stageResult = this._execution_status.stage_results[stage];
    if (stageResult.status !== StageStatus.RUNNING) {
      throw new Error(`Stage ${stage} is not running`);
    }

    const now = new Date().toISOString();
    stageResult.status = StageStatus.COMPLETED;
    stageResult.end_time = now;
    stageResult.result = result;

    if (stageResult.start_time) {
      const startTime = new Date(stageResult.start_time).getTime();
      const endTime = new Date(now).getTime();
      stageResult.duration_ms = endTime - startTime;
    }

    // 添加到已完成阶段列表
    if (!this._execution_status.completed_stages) {
      this._execution_status.completed_stages = [];
    }
    if (!this._execution_status.completed_stages.includes(stage)) {
      this._execution_status.completed_stages.push(stage);
    }

    this._updated_at = new Date().toISOString();
  }

  /**
   * 标记阶段执行失败
   */
  failStage(stage: WorkflowStage, error: ErrorInfo): void {
    if (!this._execution_status.stage_results?.[stage]) {
      throw new Error(`Stage ${stage} was not started`);
    }

    const stageResult = this._execution_status.stage_results[stage];
    const now = new Date().toISOString();
    
    stageResult.status = StageStatus.FAILED;
    stageResult.end_time = now;
    stageResult.error = error;

    if (stageResult.start_time) {
      const startTime = new Date(stageResult.start_time).getTime();
      const endTime = new Date(now).getTime();
      stageResult.duration_ms = endTime - startTime;
    }

    this._updated_at = new Date().toISOString();
  }

  /**
   * 跳过阶段执行
   */
  skipStage(stage: WorkflowStage, reason?: string): void {
    if (!this._execution_status.stage_results) {
      this._execution_status.stage_results = {};
    }

    this._execution_status.stage_results[stage] = {
      status: StageStatus.SKIPPED,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: 0,
      result: { skip_reason: reason }
    };

    this._updated_at = new Date().toISOString();
  }

  // ===== 重试管理 =====

  /**
   * 增加重试次数
   */
  incrementRetryCount(): void {
    this._execution_status.retry_count = (this._execution_status.retry_count || 0) + 1;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 检查是否可以重试
   */
  canRetry(): boolean {
    const maxRetries = this._workflow_config.retry_policy?.max_attempts || 0;
    const currentRetries = this._execution_status.retry_count || 0;
    return currentRetries < maxRetries;
  }

  // ===== 验证方法 =====

  /**
   * 验证工作流配置
   */
  validateConfig(): boolean {
    return (
      this._workflow_config.name.length > 0 &&
      this._workflow_config.stages.length > 0 &&
      Object.values(WorkflowStage).includes(this._workflow_config.stages[0])
    );
  }

  /**
   * 检查是否已完成
   */
  isCompleted(): boolean {
    return [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.CANCELLED]
      .includes(this._execution_status.status);
  }

  /**
   * 检查是否正在运行
   */
  isRunning(): boolean {
    return this._execution_status.status === WorkflowStatus.IN_PROGRESS;
  }

  /**
   * 获取下一个要执行的阶段
   */
  getNextStage(): WorkflowStage | null {
    const completedStages = this._execution_status.completed_stages || [];
    const configuredStages = this._workflow_config.stages;
    
    for (const stage of configuredStages) {
      if (!completedStages.includes(stage)) {
        return stage;
      }
    }
    
    return null; // 所有阶段都已完成
  }

  /**
   * 转换为Core协议格式
   */
  toCoreProtocol(): any {
    return {
      protocol_version: '1.0.0',
      timestamp: this._updated_at,
      workflow_id: this._workflow_id,
      orchestrator_id: this._orchestrator_id,
      workflow_config: this._workflow_config,
      execution_context: this._execution_context,
      execution_status: this._execution_status,
      module_coordination: this._module_coordination,
      event_handling: this._event_handling
    };
  }
}
