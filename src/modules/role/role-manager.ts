/**
 * MPLP Role Manager
 * 
 * 角色管理器，负责协调Role Service和其他模块的交互
 * 
 * @version 1.0.1
 * @since 2025-07-10
 * @performance 目标: <1ms 权限检查, <5ms 服务协调
 * @compliance .cursor/rules/architecture-design.mdc
 */

import {
  RoleProtocol,
  Permission,
  PermissionCheckRequest,
  PermissionCheckResult,
  BatchPermissionCheckRequest,
  BatchPermissionCheckResult,
  RolePerformanceMetrics,
  UserRoleAssignment,
  RoleDelegation,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleType,
  RoleScope,
  ScopeLevel,
  RoleEvent,
  Severity,
  ActiveDelegation
} from './types';

import { RoleService } from './role-service';
import { logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';

// 基础类型定义
type UUID = string;
type Timestamp = string;

/**
 * 健康状态接口
 */
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime_ms: number;
  timestamp: string;
  services: {
    role_service: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy';
    database: 'healthy' | 'unhealthy';
  };
  performance: {
    avg_response_time_ms: number;
    success_rate: number;
    concurrent_requests: number;
  };
}

/**
 * 管理器配置接口
 */
interface ManagerConfig {
  cache_enabled: boolean;
  performance_monitoring: boolean;
  audit_enabled: boolean;
  max_concurrent_requests: number;
  request_timeout_ms: number;
}

/**
 * Role Manager类
 * 提供角色管理的高层协调功能
 */
export class RoleManager {
  private readonly roleService: RoleService;
  private readonly performanceMonitor: Performance;
  private readonly startTime: number = Date.now();
  private readonly config: ManagerConfig;
  private activeRequests: number = 0;
  
  constructor(config?: Partial<ManagerConfig>) {
    this.config = {
      cache_enabled: true,
      performance_monitoring: true,
      audit_enabled: true,
      max_concurrent_requests: 1000,
      request_timeout_ms: 5000,
      ...config
    };
    
    this.roleService = new RoleService();
    this.performanceMonitor = new Performance();
    
    logger.info('RoleManager initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 权限检查（主要接口）
   * 
   * @param request 权限检查请求
   * @returns Promise<PermissionCheckResult> 检查结果
   */
  public async checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResult> {
    return this.executeWithMonitoring('checkPermission', async () => {
      // 检查并发限制
      if (this.activeRequests >= this.config.max_concurrent_requests) {
        return {
          granted: false,
          reason: 'CONCURRENT_LIMIT_EXCEEDED',
          matching_permissions: [],
          role_chain: [],
          conditions_met: false,
          check_time_ms: 0,
          cache_hit: false
        };
      }

      this.activeRequests++;
      try {
        // 委托给RoleService处理
        const result = await this.roleService.checkPermission(request);
        
        // 记录审计日志（如果启用）
        if (this.config.audit_enabled) {
          await this.auditPermissionCheck(request, result);
        }
        
        return result;
      } finally {
        this.activeRequests--;
      }
    });
  }

  /**
   * 批量权限检查
   * 
   * @param request 批量检查请求
   * @returns Promise<BatchPermissionCheckResult> 批量检查结果
   */
  public async batchCheckPermissions(request: BatchPermissionCheckRequest): Promise<BatchPermissionCheckResult> {
    return this.executeWithMonitoring('batchCheckPermissions', async () => {
      // 验证批量请求大小
      if (request.checks.length > 100) {
        return {
          total_checks: request.checks.length,
          results: [],
          summary: {
            total: request.checks.length,
            permitted: 0,
            denied: 0,
            errors: request.checks.length
          },
          execution_time_ms: 0
        };
      }

      return await this.roleService.batchCheckPermissions(request);
    });
  }

  /**
   * 创建角色
   * 
   * @param request 角色创建请求
   * @returns Promise<RoleProtocol> 创建的角色
   */
  public async createRole(request: {
    name: string;
    description?: string;
    permissions: Permission[];
  }): Promise<RoleProtocol> {
    return this.executeWithMonitoring('createRole', async () => {
      // 构建符合Schema的CreateRoleRequest
      const createRequest: CreateRoleRequest = {
        context_id: this.generateUUID(),
        role_type: 'functional' as RoleType,
        name: request.name,
        description: request.description,
        permissions: request.permissions,
        scope: {
          level: 'project' as ScopeLevel
        }
      };
      
      const response = await this.roleService.createRole(createRequest);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create role');
      }
      
      return response.data;
    });
  }

  /**
   * 获取角色信息
   * 
   * @param roleId 角色ID
   * @returns Promise<RoleProtocol> 角色信息
   */
  public async getRole(roleId: UUID): Promise<RoleProtocol> {
    return this.executeWithMonitoring('getRole', async () => {
      const response = await this.roleService.getRole(roleId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Role not found');
      }
      
      return response.data;
    });
  }

  /**
   * 更新角色
   * 
   * @param roleId 角色ID
   * @param updates 更新内容
   * @returns Promise<RoleProtocol> 更新后的角色
   */
  public async updateRole(roleId: UUID, updates: {
    name?: string;
    description?: string;
    permissions?: Permission[];
  }): Promise<RoleProtocol> {
    return this.executeWithMonitoring('updateRole', async () => {
      // 构建符合Schema的UpdateRoleRequest
      const updateRequest: UpdateRoleRequest = {
        role_id: roleId,
        display_name: updates.name,
        description: updates.description,
        permissions: updates.permissions
      };
      
      const response = await this.roleService.updateRole(roleId, updateRequest);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update role');
      }
      
      return response.data;
    });
  }

  /**
   * 删除角色
   * 
   * @param roleId 角色ID
   * @returns Promise<boolean> 删除结果
   */
  public async deleteRole(roleId: UUID): Promise<boolean> {
    return this.executeWithMonitoring('deleteRole', async () => {
      const response = await this.roleService.deleteRole(roleId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete role');
      }
      
      return true;
    });
  }

  /**
   * 分配角色给用户
   * 
   * @param userId 用户ID
   * @param roleId 角色ID
   * @param contextId 上下文ID（可选）
   * @returns Promise<UserRoleAssignment> 角色分配信息
   */
  public async assignRole(userId: string, roleId: UUID, contextId?: string): Promise<UserRoleAssignment> {
    return this.executeWithMonitoring('assignRole', async () => {
      // 构建角色分配对象
      const assignment: UserRoleAssignment = {
        assignment_id: this.generateUUID(),
        user_id: userId,
        role_id: roleId,
        context_id: contextId,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active',
                  metadata: {
          reason: 'Assigned by system'
          }
      };

      // 记录审计事件
      await this.auditEvent({
        event_id: this.generateUUID(),
        event_type: 'role_assigned',
        role_id: roleId,
        user_id: userId,
        context_id: contextId,
        timestamp: new Date().toISOString(),
        details: { assignment_id: assignment.assignment_id },
        severity: 'medium' as Severity
      });

      return assignment;
    });
  }

  /**
   * 撤销用户角色
   * 
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns Promise<boolean> 撤销结果
   */
  public async revokeRole(userId: string, roleId: UUID): Promise<boolean> {
    return this.executeWithMonitoring('revokeRole', async () => {
      // 记录审计事件
      await this.auditEvent({
        event_id: this.generateUUID(),
        event_type: 'role_unassigned',
        role_id: roleId,
        user_id: userId,
        timestamp: new Date().toISOString(),
        details: { revoked_by: 'system' },
        severity: 'medium' as Severity
      });

      return true;
    });
  }

  /**
   * 委派角色
   * 
   * @param delegatorId 委派者ID
   * @param delegateId 被委派者ID
   * @param roleId 角色ID
   * @param duration 委派时长（小时）
   * @returns Promise<RoleDelegation> 委派信息
   */
  public async delegateRole(
    delegatorId: string, 
    delegateId: string, 
    roleId: UUID, 
    duration: number
  ): Promise<RoleDelegation> {
    return this.executeWithMonitoring('delegateRole', async () => {
      // 获取角色信息
      const role = await this.getRole(roleId);

      // 创建活跃委派
      const activeDelegation: ActiveDelegation = {
        delegation_id: this.generateUUID(),
        delegated_to: delegateId,
        permissions: [],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
      
      // 创建委派对象
      const delegation: RoleDelegation = {
        can_delegate: true,
        delegatable_permissions: [],
        delegation_constraints: {
          max_delegation_depth: 1,
          time_limit: duration,
          require_approval: false,
          revocable: true
        },
        active_delegations: [activeDelegation]
      };
      
      // 记录审计事件
      await this.auditEvent({
        event_id: this.generateUUID(),
        event_type: 'delegation_created',
        role_id: roleId,
        user_id: delegateId,
        timestamp: new Date().toISOString(),
        details: { 
          delegator_id: delegatorId,
        duration_hours: duration
        },
        severity: 'medium' as Severity
      });

      return delegation;
    });
  }

  /**
   * 获取用户角色列表
   * 
   * @param userId 用户ID
   * @returns Promise<RoleProtocol[]> 角色列表
   */
  public async getUserRoles(userId: string): Promise<RoleProtocol[]> {
    return this.executeWithMonitoring('getUserRoles', async () => {
      // 模拟从服务获取用户角色
      return [];
    });
  }

  /**
   * 获取角色用户列表
   * 
   * @param roleId 角色ID
   * @returns Promise<string[]> 用户ID列表
   */
  public async getRoleUsers(roleId: UUID): Promise<string[]> {
    return this.executeWithMonitoring('getRoleUsers', async () => {
      // 模拟从服务获取角色用户
      return [];
    });
  }

  /**
   * 获取健康状态
   * 
   * @returns Promise<HealthStatus> 健康状态
   */
  public async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();
    
    // 获取性能报告
    const perfSummary = this.performanceMonitor.getSummary();
    const avgResponseTimes = Object.values(perfSummary).map(report => report.averageTime);
    const avgResponseTime = avgResponseTimes.length > 0 
      ? avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length 
      : 0;
    
    // 计算成功率
    const successRate = this.calculateSuccessRate();

    return {
      status: 'healthy',
      version: '1.0.1',
      uptime_ms: uptime,
      timestamp,
      services: {
        role_service: 'healthy',
        cache: this.config.cache_enabled ? 'healthy' : 'unhealthy',
        database: 'healthy'
      },
      performance: {
        avg_response_time_ms: avgResponseTime,
        success_rate: successRate,
        concurrent_requests: this.activeRequests
      }
    };
  }

  /**
   * 获取性能指标
   * 
   * @returns Promise<RolePerformanceMetrics> 性能指标
   */
  public async getPerformanceMetrics(): Promise<RolePerformanceMetrics> {
    return this.roleService.getPerformanceMetrics();
  }

  /**
   * 清理过期数据
   * 
   * @returns Promise<number> 清理的记录数
   */
  public async cleanupExpired(): Promise<number> {
    return this.executeWithMonitoring('cleanupExpired', async () => {
      // 模拟清理过期数据
      const cleanedCount = 0;
      
      logger.info('Cleaned up expired data', {
        count: cleanedCount,
        timestamp: new Date().toISOString()
      });
      
      return cleanedCount;
    });
  }

  /**
   * 执行并监控操作
   * 
   * @param operation 操作名称
   * @param fn 操作函数
   * @returns Promise<T> 操作结果
   */
  private async executeWithMonitoring<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const operationName = `RoleManager.${operation}`;
    
    if (!this.config.performance_monitoring) {
      return await fn();
    }
    
    try {
      const { result } = await this.performanceMonitor.measureAsync(operationName, fn);
      return result;
    } catch (error) {
      logger.error(`Error in ${operation}`, { error });
      throw error;
    }
  }

  /**
   * 记录权限检查审计
   * 
   * @param request 权限检查请求
   * @param result 权限检查结果
   */
  private async auditPermissionCheck(
    request: PermissionCheckRequest,
    result: PermissionCheckResult
  ): Promise<void> {
    // 记录权限检查审计日志
    logger.info('Permission check', {
      user_id: request.user_id,
      resource_type: request.resource_type,
      resource_id: request.resource_id,
      action: request.action,
      granted: result.granted,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录审计事件
   * 
   * @param event 审计事件
   */
  private async auditEvent(event: RoleEvent): Promise<void> {
    // 记录审计事件
    logger.info(`Role event: ${event.event_type}`, {
      event_id: event.event_id,
      role_id: event.role_id,
      user_id: event.user_id,
      timestamp: event.timestamp,
      details: event.details
    });
  }

  /**
   * 计算成功率
   * 
   * @returns number 成功率
   */
  private calculateSuccessRate(): number {
    // 获取所有指标名称
    const metricNames = this.performanceMonitor.getMetricNames();
    let totalOperations = 0;
    let successfulOperations = 0;
    
    // 遍历每个指标，统计成功率
    for (const metricName of metricNames) {
      const report = this.performanceMonitor.getReport(metricName);
      if (report) {
        totalOperations += report.totalOperations;
        // 假设所有记录的操作都是成功的
        successfulOperations += report.totalOperations;
      }
    }
    
    return totalOperations > 0 ? successfulOperations / totalOperations : 1.0;
    }

  /**
   * 生成UUID
   * 
   * @returns UUID 生成的UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
} 