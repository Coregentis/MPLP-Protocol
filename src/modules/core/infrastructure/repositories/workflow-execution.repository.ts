/**
 * 工作流执行Repository实现
 * @description 工作流执行的内存存储实现（生产环境应使用数据库）
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../../../public/utils/logger';
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity';
import { 
  IWorkflowExecutionRepository, 
  WorkflowQueryCriteria 
} from '../../domain/repositories/workflow-execution.repository.interface';
import { UUID, WorkflowStatus } from '../../types';

/**
 * 内存存储的工作流执行Repository
 */
export class InMemoryWorkflowExecutionRepository implements IWorkflowExecutionRepository {
  private logger: Logger;
  private executions: Map<UUID, WorkflowExecution> = new Map();

  constructor() {
    this.logger = new Logger('WorkflowExecutionRepository');
  }

  /**
   * 保存工作流执行
   */
  async save(execution: WorkflowExecution): Promise<void> {
    try {
      this.executions.set(execution.workflow_id, execution);
      
      this.logger.debug('工作流执行已保存', {
        workflow_id: execution.workflow_id,
        status: execution.executionStatus.status
      });
    } catch (error) {
      this.logger.error('保存工作流执行失败', {
        workflow_id: execution.workflow_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 根据ID查找工作流执行
   */
  async findById(workflowId: UUID): Promise<WorkflowExecution | null> {
    try {
      const execution = this.executions.get(workflowId);
      
      if (execution) {
        this.logger.debug('工作流执行已找到', {
          workflow_id: workflowId
        });
      }
      
      return execution || null;
    } catch (error) {
      this.logger.error('查找工作流执行失败', {
        workflow_id: workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 根据条件查询工作流执行
   */
  async findByFilter(criteria: WorkflowQueryCriteria): Promise<WorkflowExecution[]> {
    try {
      let results = Array.from(this.executions.values());

      // 按状态过滤
      if (criteria.status && criteria.status.length > 0) {
        results = results.filter(execution => 
          criteria.status!.includes(execution.executionStatus.status)
        );
      }

      // 按协调器ID过滤
      if (criteria.orchestrator_id) {
        results = results.filter(execution => 
          execution.orchestrator_id === criteria.orchestrator_id
        );
      }

      // 按用户ID过滤
      if (criteria.userId) {
        results = results.filter(execution => 
          execution.execution_context.userId === criteria.userId
        );
      }

      // 按会话ID过滤
      if (criteria.sessionId) {
        results = results.filter(execution => 
          execution.execution_context.sessionId === criteria.sessionId
        );
      }

      // 按阶段过滤
      if (criteria.stages && criteria.stages.length > 0) {
        results = results.filter(execution => 
          criteria.stages!.some(stage => 
            execution.workflow_config.stages.includes(stage)
          )
        );
      }

      // 按时间范围过滤
      if (criteria.start_time_from) {
        const fromTime = new Date(criteria.start_time_from);
        results = results.filter(execution => {
          const startTime = execution.executionStatus.start_time;
          return startTime && new Date(startTime) >= fromTime;
        });
      }

      if (criteria.start_time_to) {
        const toTime = new Date(criteria.start_time_to);
        results = results.filter(execution => {
          const startTime = execution.executionStatus.start_time;
          return startTime && new Date(startTime) <= toTime;
        });
      }

      // 排序
      if (criteria.sort_by) {
        results.sort((a, b) => {
          let aValue: string;
          let bValue: string;

          switch (criteria.sort_by) {
            case 'created_at':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updated_at':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            case 'start_time':
              aValue = a.executionStatus.start_time || '';
              bValue = b.executionStatus.start_time || '';
              break;
            default:
              aValue = a.createdAt;
              bValue = b.createdAt;
          }

          const comparison = aValue.localeCompare(bValue);
          return criteria.sort_order === 'desc' ? -comparison : comparison;
        });
      }

      // 分页
      if (criteria.offset || criteria.limit) {
        const offset = criteria.offset || 0;
        const limit = criteria.limit || results.length;
        results = results.slice(offset, offset + limit);
      }

      this.logger.debug('工作流执行查询完成', {
        criteria,
        resultCount: results.length
      });

      return results;
    } catch (error) {
      this.logger.error('查询工作流执行失败', {
        criteria,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 更新工作流执行
   */
  async update(execution: WorkflowExecution): Promise<void> {
    try {
      if (!this.executions.has(execution.workflow_id)) {
        throw new Error(`Workflow execution not found: ${execution.workflow_id}`);
      }

      this.executions.set(execution.workflow_id, execution);
      
      this.logger.debug('工作流执行已更新', {
        workflow_id: execution.workflow_id,
        status: execution.executionStatus.status
      });
    } catch (error) {
      this.logger.error('更新工作流执行失败', {
        workflow_id: execution.workflow_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 删除工作流执行
   */
  async delete(workflowId: UUID): Promise<boolean> {
    try {
      const deleted = this.executions.delete(workflowId);
      
      if (deleted) {
        this.logger.debug('工作流执行已删除', {
          workflow_id: workflowId
        });
      }
      
      return deleted;
    } catch (error) {
      this.logger.error('删除工作流执行失败', {
        workflow_id: workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 检查工作流是否存在
   */
  async exists(workflowId: UUID): Promise<boolean> {
    return this.executions.has(workflowId);
  }

  /**
   * 获取活跃的工作流执行
   */
  async findActiveExecutions(orchestratorId?: UUID): Promise<WorkflowExecution[]> {
    try {
      const activeStatuses = [WorkflowStatus.CREATED, WorkflowStatus.IN_PROGRESS, WorkflowStatus.PAUSED];
      
      let results = Array.from(this.executions.values()).filter(execution =>
        activeStatuses.includes(execution.executionStatus.status)
      );

      if (orchestratorId) {
        results = results.filter(execution => 
          execution.orchestrator_id === orchestratorId
        );
      }

      this.logger.debug('活跃工作流执行查询完成', {
        orchestratorId,
        count: results.length
      });

      return results;
    } catch (error) {
      this.logger.error('查询活跃工作流执行失败', {
        orchestratorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 获取指定状态的工作流数量
   */
  async countByStatus(status: WorkflowStatus): Promise<number> {
    try {
      const count = Array.from(this.executions.values())
        .filter(execution => execution.executionStatus.status === status)
        .length;

      this.logger.debug('工作流状态计数完成', {
        status,
        count
      });

      return count;
    } catch (error) {
      this.logger.error('工作流状态计数失败', {
        status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 获取用户的工作流执行
   */
  async findByUserId(userId: string, limit?: number): Promise<WorkflowExecution[]> {
    try {
      let results = Array.from(this.executions.values())
        .filter(execution => execution.execution_context.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // 按创建时间倒序

      if (limit) {
        results = results.slice(0, limit);
      }

      this.logger.debug('用户工作流执行查询完成', {
        userId,
        limit,
        count: results.length
      });

      return results;
    } catch (error) {
      this.logger.error('查询用户工作流执行失败', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 获取会话的工作流执行
   */
  async findBySessionId(sessionId: UUID): Promise<WorkflowExecution[]> {
    try {
      const results = Array.from(this.executions.values())
        .filter(execution => execution.execution_context.sessionId === sessionId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // 按创建时间倒序

      this.logger.debug('会话工作流执行查询完成', {
        sessionId,
        count: results.length
      });

      return results;
    } catch (error) {
      this.logger.error('查询会话工作流执行失败', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 批量更新工作流状态
   */
  async batchUpdateStatus(workflowIds: UUID[], status: WorkflowStatus): Promise<void> {
    try {
      let updatedCount = 0;

      for (const workflowId of workflowIds) {
        const execution = this.executions.get(workflowId);
        if (execution) {
          // 这里需要根据状态调用相应的方法
          // 简化实现，直接修改状态
          (execution as any)._execution_status.status = status;
          (execution as any)._updated_at = new Date().toISOString();
          updatedCount++;
        }
      }

      this.logger.info('批量更新工作流状态完成', {
        requestedCount: workflowIds.length,
        updatedCount,
        status
      });
    } catch (error) {
      this.logger.error('批量更新工作流状态失败', {
        workflowIds,
        status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 清理过期的工作流执行
   */
  async cleanupExpired(olderThan: Date): Promise<number> {
    try {
      const executions = Array.from(this.executions.entries());
      let cleanedCount = 0;

      for (const [workflowId, execution] of executions) {
        const createdAt = new Date(execution.createdAt);
        if (createdAt < olderThan && execution.isCompleted()) {
          this.executions.delete(workflowId);
          cleanedCount++;
        }
      }

      this.logger.info('过期工作流执行清理完成', {
        olderThan: olderThan.toISOString(),
        cleanedCount
      });

      return cleanedCount;
    } catch (error) {
      this.logger.error('清理过期工作流执行失败', {
        olderThan: olderThan.toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 获取存储统计信息
   */
  getStats(): {
    totalExecutions: number;
    activeExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
  } {
    const executions = Array.from(this.executions.values());
    
    return {
      totalExecutions: executions.length,
      activeExecutions: executions.filter(e => 
        [WorkflowStatus.CREATED, WorkflowStatus.IN_PROGRESS, WorkflowStatus.PAUSED]
          .includes(e.executionStatus.status)
      ).length,
      completedExecutions: executions.filter(e => 
        e.executionStatus.status === WorkflowStatus.COMPLETED
      ).length,
      failedExecutions: executions.filter(e => 
        e.executionStatus.status === WorkflowStatus.FAILED
      ).length
    };
  }
}
