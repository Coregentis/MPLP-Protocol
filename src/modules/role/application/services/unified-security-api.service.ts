/**
 * 统一安全API服务
 * 
 * @description 跨模块安全集成接口，供其他模块使用的统一安全验证API
 * @version 1.0.0
 * @layer 应用层 - 统一安全接口
 */

import { 
  RoleSecurityService, 
  SecurityContext, 
  SecurityToken, 
  SecurityEvent, 
  PermissionRequest, 
  PermissionResult 
} from './role-security.service';

/**
 * 统一安全API - 供其他模块使用
 * 所有模块都通过这个API进行安全验证
 */
export class UnifiedSecurityAPI {
  constructor(
    private readonly roleSecurityService: RoleSecurityService
  ) {}

  // ===== 权限验证API =====

  /**
   * 检查用户权限
   * @param userId 用户ID
   * @param resource 资源
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.roleSecurityService.validatePermission(userId, resource, action, context);
  }

  /**
   * 批量权限验证
   * @param userId 用户ID
   * @param permissions 权限请求列表
   * @returns 权限验证结果列表
   */
  async hasMultiplePermissions(
    userId: string,
    permissions: PermissionRequest[]
  ): Promise<PermissionResult[]> {
    return await this.roleSecurityService.validateMultiplePermissions(userId, permissions);
  }

  // ===== 令牌验证API =====

  /**
   * 验证安全令牌
   * @param tokenString 令牌字符串
   * @returns 安全令牌或null
   */
  async validateToken(tokenString: string): Promise<SecurityToken | null> {
    return await this.roleSecurityService.validateSecurityToken(tokenString);
  }

  // ===== 安全事件报告API =====

  /**
   * 报告安全事件
   * @param event 安全事件
   */
  async reportSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.roleSecurityService.handleSecurityEvent(event);
  }

  // ===== 模块特定安全验证方法 =====

  /**
   * Context模块权限验证
   * @param userId 用户ID
   * @param contextId 上下文ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateContextAccess(
    userId: string, 
    contextId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `context:${contextId}`, action, context);
  }

  /**
   * Plan模块权限验证
   * @param userId 用户ID
   * @param planId 计划ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validatePlanAccess(
    userId: string, 
    planId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `plan:${planId}`, action, context);
  }

  /**
   * Confirm模块权限验证
   * @param userId 用户ID
   * @param confirmId 确认ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateConfirmAccess(
    userId: string, 
    confirmId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `confirm:${confirmId}`, action, context);
  }

  /**
   * Trace模块权限验证
   * @param userId 用户ID
   * @param traceId 追踪ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateTraceAccess(
    userId: string, 
    traceId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `trace:${traceId}`, action, context);
  }

  /**
   * Extension模块权限验证
   * @param userId 用户ID
   * @param extensionId 扩展ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateExtensionAccess(
    userId: string, 
    extensionId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `extension:${extensionId}`, action, context);
  }

  /**
   * Dialog模块权限验证
   * @param userId 用户ID
   * @param dialogId 对话ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateDialogAccess(
    userId: string, 
    dialogId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `dialog:${dialogId}`, action, context);
  }

  /**
   * Collab模块权限验证
   * @param userId 用户ID
   * @param collabId 协作ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateCollabAccess(
    userId: string, 
    collabId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `collab:${collabId}`, action, context);
  }

  /**
   * Network模块权限验证
   * @param userId 用户ID
   * @param networkId 网络ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateNetworkAccess(
    userId: string, 
    networkId: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `network:${networkId}`, action, context);
  }

  /**
   * Core模块权限验证
   * @param userId 用户ID
   * @param coreResource 核心资源
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateCoreAccess(
    userId: string, 
    coreResource: string, 
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `core:${coreResource}`, action, context);
  }

  // ===== 通用资源权限验证 =====

  /**
   * 验证资源访问权限
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param action 操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateResourceAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, `${resourceType}:${resourceId}`, action, context);
  }

  /**
   * 验证系统级权限
   * @param userId 用户ID
   * @param systemAction 系统操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateSystemPermission(
    userId: string,
    systemAction: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, 'system', systemAction, context);
  }

  /**
   * 验证管理员权限
   * @param userId 用户ID
   * @param adminAction 管理员操作
   * @param context 安全上下文
   * @returns 是否有权限
   */
  async validateAdminPermission(
    userId: string,
    adminAction: string,
    context?: SecurityContext
  ): Promise<boolean> {
    return await this.hasPermission(userId, 'admin', adminAction, context);
  }
}

// ===== 其他模块使用示例类 =====

/**
 * Context模块安全服务示例
 */
export class ContextSecurityService {
  constructor(
    private readonly unifiedSecurityAPI: UnifiedSecurityAPI
  ) {}

  async validateContextAccess(userId: string, contextId: string, action: string): Promise<boolean> {
    return await this.unifiedSecurityAPI.validateContextAccess(userId, contextId, action);
  }
}

/**
 * Plan模块安全服务示例
 */
export class PlanSecurityService {
  constructor(
    private readonly unifiedSecurityAPI: UnifiedSecurityAPI
  ) {}

  async validatePlanAccess(userId: string, planId: string, action: string): Promise<boolean> {
    return await this.unifiedSecurityAPI.validatePlanAccess(userId, planId, action);
  }
}
