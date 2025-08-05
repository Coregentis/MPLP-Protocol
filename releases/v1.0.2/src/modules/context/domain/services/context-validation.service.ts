/**
 * Context验证服务
 * 
 * 负责验证Context领域对象的业务规则
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Context } from '../entities/context.entity';
import { ContextLifecycleStage } from '../../../shared/types';
import { EntityStatus } from '../../../shared/types';

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Context验证服务
 */
export class ContextValidationService {
  /**
   * 验证Context名称
   */
  validateName(name: string): ValidationError | null {
    if (!name || name.trim().length === 0) {
      return { field: 'name', message: 'Context name cannot be empty' };
    }
    
    if (name.length < 3) {
      return { field: 'name', message: 'Context name must be at least 3 characters long' };
    }
    
    if (name.length > 100) {
      return { field: 'name', message: 'Context name cannot exceed 100 characters' };
    }
    
    return null;
  }
  
  /**
   * 验证Context描述
   */
  validateDescription(description: string | null): ValidationError | null {
    if (description && description.length > 500) {
      return { field: 'description', message: 'Context description cannot exceed 500 characters' };
    }
    
    return null;
  }
  
  /**
   * 验证Context生命周期阶段
   */
  validateLifecycleStage(stage: string): ValidationError | null {
    const validStages: ContextLifecycleStage[] = [
      ContextLifecycleStage.INITIALIZATION,
      ContextLifecycleStage.ACTIVE,
      ContextLifecycleStage.MAINTENANCE,
      ContextLifecycleStage.COMPLETION
    ];

    if (!validStages.includes(stage as ContextLifecycleStage)) {
      return {
        field: 'lifecycleStage',
        message: `Invalid lifecycle stage. Must be one of: ${validStages.join(', ')}`
      };
    }

    return null;
  }

  /**
   * 验证Context状态
   */
  validateStatus(status: string): ValidationError | null {
    const validStatuses: EntityStatus[] = [
      EntityStatus.ACTIVE,
      EntityStatus.INACTIVE,
      EntityStatus.SUSPENDED,
      EntityStatus.DELETED
    ];

    if (!validStatuses.includes(status as EntityStatus)) {
      return {
        field: 'status',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      };
    }

    return null;
  }
  
  /**
   * 验证状态转换是否有效
   */
  validateStatusTransition(currentStatus: EntityStatus, newStatus: EntityStatus): ValidationError | null {
    // 已删除的Context不能转换为其他状态
    if (currentStatus === 'deleted' && newStatus !== 'deleted') {
      return {
        field: 'status',
        message: 'Cannot change status of a deleted context'
      };
    }
    
    return null;
  }
  
  /**
   * 验证生命周期阶段转换是否有效
   */
  validateLifecycleTransition(
    currentStage: ContextLifecycleStage, 
    newStage: ContextLifecycleStage
  ): ValidationError | null {
    const stageOrder: Record<ContextLifecycleStage, number> = {
      [ContextLifecycleStage.INITIALIZATION]: 0,
      [ContextLifecycleStage.ACTIVE]: 1,
      [ContextLifecycleStage.MAINTENANCE]: 2,
      [ContextLifecycleStage.COMPLETION]: 3
    };
    
    // 确保阶段只能向前推进，不能回退
    if (stageOrder[newStage] < stageOrder[currentStage]) {
      return {
        field: 'lifecycleStage',
        message: `Cannot transition from ${currentStage} back to ${newStage}`
      };
    }
    
    // 确保阶段不能跳跃（例如，从planning直接到completed）
    if (stageOrder[newStage] > stageOrder[currentStage] + 1) {
      return {
        field: 'lifecycleStage',
        message: `Cannot skip stages from ${currentStage} to ${newStage}`
      };
    }
    
    return null;
  }
  
  /**
   * 验证整个Context对象
   */
  validateContext(context: Context): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const nameError = this.validateName(context.name);
    if (nameError) errors.push(nameError);
    
    const descriptionError = this.validateDescription(context.description);
    if (descriptionError) errors.push(descriptionError);
    
    const lifecycleError = this.validateLifecycleStage(context.lifecycleStage);
    if (lifecycleError) errors.push(lifecycleError);
    
    const statusError = this.validateStatus(context.status);
    if (statusError) errors.push(statusError);
    
    // 验证会话ID数量是否超过配置限制
    if (context.configuration && 
        typeof context.configuration.maxSessions === 'number' && 
        context.sessionIds.length > context.configuration.maxSessions) {
      errors.push({
        field: 'sessionIds',
        message: `Number of sessions (${context.sessionIds.length}) exceeds configured maximum (${context.configuration.maxSessions})`
      });
    }
    
    return errors;
  }
  
  /**
   * 验证Context是否可以被删除
   */
  validateDeletion(context: Context): ValidationError | null {
    // 已经处于deleted状态的Context不能再次删除
    if (context.status === 'deleted') {
      return {
        field: 'status',
        message: 'Context is already deleted'
      };
    }
    
    return null;
  }
} 