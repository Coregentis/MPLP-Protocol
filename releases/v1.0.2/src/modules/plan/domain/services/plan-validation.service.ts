/**
 * Plan验证服务
 * 
 * 提供对Plan实体的业务规则验证
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../entities/plan.entity';
import { PlanTask } from '../value-objects/plan-task.value-object';
import { PlanDependency } from '../value-objects/plan-dependency.value-object';
import { UUID } from '../../../shared/types';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Plan验证服务
 */
export class PlanValidationService {
  /**
   * 验证计划是否有效
   * @param plan 计划实体
   * @returns 验证结果
   */
  validatePlan(plan: Plan): ValidationResult {
    const errors: string[] = [];
    
    // 验证基本信息
    if (!plan.name || plan.name.trim().length === 0) {
      errors.push('Plan name is required');
    }
    
    if (!plan.context_id) {
      errors.push('Context ID is required');
    }
    
    // 验证任务
    const taskErrors = this.validateTasks(plan.tasks);
    errors.push(...taskErrors);
    
    // 验证依赖关系
    const dependencyErrors = this.validateDependencies(plan.tasks, plan.dependencies);
    errors.push(...dependencyErrors);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证任务列表是否有效
   * @param tasks 任务列表
   * @returns 错误信息列表
   */
  validateTasks(tasks: PlanTask[]): string[] {
    const errors: string[] = [];
    const taskIds = new Set<UUID>();
    
    // 检查任务ID唯一性
    tasks.forEach(task => {
      if (taskIds.has(task.task_id)) {
        errors.push(`Duplicate task ID: ${task.task_id}`);
      } else {
        taskIds.add(task.task_id);
      }
      
      // 检查任务名称
      if (!task.name || task.name.trim().length === 0) {
        errors.push(`Task ${task.task_id} has no name`);
      }
      
      // 检查父任务引用
      if (task.parent_task_id && !taskIds.has(task.parent_task_id)) {
        errors.push(`Task ${task.task_id} references non-existent parent task ${task.parent_task_id}`);
      }
    });
    
    return errors;
  }
  
  /**
   * 验证依赖关系是否有效
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 错误信息列表
   */
  validateDependencies(tasks: PlanTask[], dependencies: PlanDependency[]): string[] {
    const errors: string[] = [];
    const taskIds = new Set<UUID>();
    const dependencyIds = new Set<UUID>();
    
    // 收集所有任务ID
    tasks.forEach(task => taskIds.add(task.task_id));
    
    // 检查依赖关系
    dependencies.forEach(dependency => {
      // 检查依赖ID唯一性
      if (dependencyIds.has(dependency.id)) {
        errors.push(`Duplicate dependency ID: ${dependency.id}`);
      } else {
        dependencyIds.add(dependency.id);
      }
      
      // 检查源任务是否存在
      if (!taskIds.has(dependency.source_task_id)) {
        errors.push(`Dependency ${dependency.id} references non-existent source task ${dependency.source_task_id}`);
      }
      
      // 检查目标任务是否存在
      if (!taskIds.has(dependency.target_task_id)) {
        errors.push(`Dependency ${dependency.id} references non-existent target task ${dependency.target_task_id}`);
      }
      
      // 检查自引用
      if (dependency.source_task_id === dependency.target_task_id) {
        errors.push(`Self-dependency detected: ${dependency.id} (${dependency.source_task_id})`);
      }
    });
    
    // 检查循环依赖
    const cycleErrors = this.detectCycles(tasks, dependencies);
    errors.push(...cycleErrors);
    
    return errors;
  }
  
  /**
   * 检测依赖关系中的循环
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 错误信息列表
   */
  private detectCycles(tasks: PlanTask[], dependencies: PlanDependency[]): string[] {
    const errors: string[] = [];
    
    // 构建依赖图
    const graph: Record<string, string[]> = {};
    
    // 初始化图
    tasks.forEach(task => {
      graph[task.task_id] = [];
    });
    
    // 添加依赖边
    dependencies.forEach(dep => {
      graph[dep.source_task_id].push(dep.target_task_id);
    });
    
    // 检查循环
    const visited = new Set<UUID>();
    const recursionStack = new Set<UUID>();
    
    const dfs = (node: UUID, path: UUID[] = []): boolean => {
      // 如果节点在递归栈中，说明有循环
      if (recursionStack.has(node)) {
        const cycle = [...path, node];
        errors.push(`Dependency cycle detected: ${cycle.join(' -> ')}`);
        return true;
      }
      
      // 如果节点已访问且不在递归栈中，说明这条路径没有循环
      if (visited.has(node)) {
        return false;
      }
      
      // 标记节点为已访问并添加到递归栈
      visited.add(node);
      recursionStack.add(node);
      
      // 检查所有邻居
      for (const neighbor of graph[node] || []) {
        if (dfs(neighbor, [...path, node])) {
          return true;
        }
      }
      
      // 从递归栈中移除节点
      recursionStack.delete(node);
      return false;
    };
    
    // 检查每个节点
    for (const task of tasks) {
      if (!visited.has(task.task_id)) {
        dfs(task.task_id);
      }
    }
    
    return errors;
  }
  
  /**
   * 验证计划是否可执行
   * @param plan 计划实体
   * @returns 验证结果
   */
  validatePlanExecutability(plan: Plan): ValidationResult {
    const errors: string[] = [];
    
    // 检查状态
    if (plan.status !== 'active' && plan.status !== 'approved') {
      errors.push(`Plan status must be 'active' or 'approved', current status: ${plan.status}`);
    }
    
    // 检查是否有任务
    if (plan.tasks.length === 0) {
      errors.push('Plan has no tasks');
    }
    
    // 检查是否有无效依赖
    const dependencyErrors = this.validateDependencies(plan.tasks, plan.dependencies);
    if (dependencyErrors.length > 0) {
      errors.push(...dependencyErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证计划名称是否有效
   * @param name 计划名称
   * @returns 验证结果
   */
  validatePlanName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Plan name is required');
    } else if (name.length > 255) {
      errors.push('Plan name must be 255 characters or less');
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.push('Plan name must contain only alphanumeric characters, spaces, hyphens, and underscores');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证任务名称是否有效
   * @param name 任务名称
   * @returns 验证结果
   */
  validateTaskName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Task name is required');
    } else if (name.length > 255) {
      errors.push('Task name must be 255 characters or less');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 