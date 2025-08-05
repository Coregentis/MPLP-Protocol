/**
 * 工作流执行Repository接口
 * @description 定义工作流执行的数据访问接口
 * @author MPLP Team
 * @version 1.0.0
 */

import { WorkflowExecution } from '../entities/workflow-execution.entity';
import { UUID, WorkflowStatus, WorkflowStage } from '../../types';

/**
 * 工作流查询条件接口
 */
export interface WorkflowQueryCriteria {
  status?: WorkflowStatus[];
  orchestrator_id?: UUID;
  user_id?: string;
  session_id?: UUID;
  stages?: WorkflowStage[];
  start_time_from?: string;
  start_time_to?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'start_time';
  sort_order?: 'asc' | 'desc';
}

/**
 * 工作流执行Repository接口
 */
export interface IWorkflowExecutionRepository {
  /**
   * 保存工作流执行
   */
  save(execution: WorkflowExecution): Promise<void>;

  /**
   * 根据ID查找工作流执行
   */
  findById(workflowId: UUID): Promise<WorkflowExecution | null>;

  /**
   * 根据条件查询工作流执行
   */
  findByFilter(criteria: WorkflowQueryCriteria): Promise<WorkflowExecution[]>;

  /**
   * 更新工作流执行
   */
  update(execution: WorkflowExecution): Promise<void>;

  /**
   * 删除工作流执行
   */
  delete(workflowId: UUID): Promise<boolean>;

  /**
   * 检查工作流是否存在
   */
  exists(workflowId: UUID): Promise<boolean>;

  /**
   * 获取活跃的工作流执行
   */
  findActiveExecutions(orchestratorId?: UUID): Promise<WorkflowExecution[]>;

  /**
   * 获取指定状态的工作流数量
   */
  countByStatus(status: WorkflowStatus): Promise<number>;

  /**
   * 获取用户的工作流执行
   */
  findByUserId(userId: string, limit?: number): Promise<WorkflowExecution[]>;

  /**
   * 获取会话的工作流执行
   */
  findBySessionId(sessionId: UUID): Promise<WorkflowExecution[]>;

  /**
   * 批量更新工作流状态
   */
  batchUpdateStatus(workflowIds: UUID[], status: WorkflowStatus): Promise<void>;

  /**
   * 清理过期的工作流执行
   */
  cleanupExpired(olderThan: Date): Promise<number>;
}
