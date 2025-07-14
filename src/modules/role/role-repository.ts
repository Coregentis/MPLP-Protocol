/**
 * 内存型角色仓库实现
 * 
 * 提供基于内存的角色存储实现，用于开发和测试
 * 生产环境应替换为持久化实现
 * 
 * @version v1.0.0
 * @created 2025-07-13T01:00:00+08:00
 * @compliance role-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { IRoleRepository } from '../../interfaces/role-repository.interface';
import { 
  RoleProtocol,
  RoleFilter, 
  UserRoleAssignment,
  RoleOperationResult,
  RoleErrorCode
} from './types';
import { logger } from '../../utils/logger';

// 角色错误类
class RoleError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'RoleError';
  }
}

/**
 * 内存型角色仓库实现
 * 实现厂商中立的IRoleRepository接口
 */
export class InMemoryRoleRepository implements IRoleRepository {
  private roles: Map<string, RoleProtocol> = new Map();
  private userRoles: Map<string, Set<string>> = new Map(); // userId -> Set<roleId>
  private roleUsers: Map<string, Set<string>> = new Map(); // roleId -> Set<userId>
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    logger.info('InMemoryRoleRepository initialized');
  }

  /**
   * 保存角色
   * @param role 角色对象
   */
  async save(role: RoleProtocol): Promise<void> {
    // 确保有角色ID
    if (!role.role_id) {
      role.role_id = uuidv4();
    }

    this.roles.set(role.role_id, { ...role });
    
    // 发出事件
    this.eventEmitter.emit('role_saved', role);
    logger.debug('Role saved', { role_id: role.role_id });
  }

  /**
   * 根据ID查询角色
   * @param roleId 角色ID
   * @returns 找到的角色或null
   */
  async findById(roleId: string): Promise<RoleProtocol | null> {
    const role = this.roles.get(roleId);
    return role ? { ...role } : null;
  }

  /**
   * 根据过滤条件查询角色
   * @param filter 角色过滤条件
   * @returns 角色列表
   */
  async findByFilter(filter: RoleFilter): Promise<RoleProtocol[]> {
    let results = Array.from(this.roles.values());
    
    // 应用过滤条件
    if (filter.role_ids && filter.role_ids.length > 0) {
      results = results.filter(role => filter.role_ids!.includes(role.role_id));
    }
    
    if (filter.context_ids && filter.context_ids.length > 0) {
      results = results.filter(role => filter.context_ids!.includes(role.context_id));
    }
    
    if (filter.role_types && filter.role_types.length > 0) {
      results = results.filter(role => filter.role_types!.includes(role.role_type));
    }
    
    if (filter.statuses && filter.statuses.length > 0) {
      results = results.filter(role => filter.statuses!.includes(role.status));
    }
    
    if (filter.names && filter.names.length > 0) {
      results = results.filter(role => filter.names!.includes(role.name));
    }
    
    // 处理创建时间过滤
    if (filter.created_after) {
      results = results.filter(role => new Date(role.timestamp) >= new Date(filter.created_after!));
    }
    
    if (filter.created_before) {
      results = results.filter(role => new Date(role.timestamp) <= new Date(filter.created_before!));
    }
    
    // 处理权限过滤
    if (filter.has_permissions && filter.has_permissions.length > 0) {
      results = results.filter(role => {
        return role.permissions.some(perm => 
          perm.actions.some(action => filter.has_permissions!.includes(action))
        );
      });
    }
    
    // 返回深拷贝以防止外部修改
    return results.map(role => ({ ...role }));
  }

  /**
   * 更新角色
   * @param roleId 角色ID
   * @param updates 更新内容
   */
  async update(roleId: string, updates: Partial<RoleProtocol>): Promise<void> {
    const existingRole = this.roles.get(roleId);
    
    if (!existingRole) {
      throw new RoleError(RoleErrorCode.ROLE_NOT_FOUND, `Role with id ${roleId} not found`);
    }
    
    // 应用更新，但保持角色ID不变
    const updatedRole = {
      ...existingRole,
      ...updates,
      role_id: existingRole.role_id
    };
    
    this.roles.set(roleId, updatedRole);
    
    // 发出事件
    this.eventEmitter.emit('role_updated', updatedRole);
    logger.debug('Role updated', { role_id: roleId });
  }

  /**
   * 删除角色
   * @param roleId 角色ID
   */
  async delete(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    
    if (!role) {
      throw new RoleError(RoleErrorCode.ROLE_NOT_FOUND, `Role with id ${roleId} not found`);
    }
    
    // 删除角色
    this.roles.delete(roleId);
    
    // 清理用户-角色关联
    const userIds = this.roleUsers.get(roleId) || new Set();
    for (const userId of userIds) {
      const userRoles = this.userRoles.get(userId);
      if (userRoles) {
        userRoles.delete(roleId);
      }
    }
    
    this.roleUsers.delete(roleId);
    
    // 发出事件
    this.eventEmitter.emit('role_deleted', roleId);
    logger.debug('Role deleted', { role_id: roleId });
  }

  /**
   * 检查角色是否存在
   * @param roleId 角色ID
   * @returns 是否存在
   */
  async exists(roleId: string): Promise<boolean> {
    return this.roles.has(roleId);
  }

  /**
   * 计数角色
   * @param filter 可选的过滤条件
   * @returns 角色数量
   */
  async count(filter?: RoleFilter): Promise<number> {
    if (!filter) {
      return this.roles.size;
    }
    
    // 使用现有的过滤方法
    const filteredRoles = await this.findByFilter(filter);
    return filteredRoles.length;
  }

  /**
   * 分配角色给用户
   * @param assignment 用户角色分配
   */
  async assignRoleToUser(assignment: UserRoleAssignment): Promise<void> {
    const { user_id, role_id } = assignment;
    
    // 检查角色是否存在
    if (!this.roles.has(role_id)) {
      throw new RoleError(RoleErrorCode.ROLE_NOT_FOUND, `Role with id ${role_id} not found`);
    }
    
    // 用户角色映射
    if (!this.userRoles.has(user_id)) {
      this.userRoles.set(user_id, new Set());
    }
    this.userRoles.get(user_id)!.add(role_id);
    
    // 角色用户映射
    if (!this.roleUsers.has(role_id)) {
      this.roleUsers.set(role_id, new Set());
    }
    this.roleUsers.get(role_id)!.add(user_id);
    
    // 发出事件
    this.eventEmitter.emit('role_assigned', assignment);
    logger.debug('Role assigned to user', { user_id, role_id });
  }

  /**
   * 取消用户的角色分配
   * @param userId 用户ID
   * @param roleId 角色ID
   */
  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // 更新用户角色映射
    const userRoles = this.userRoles.get(userId);
    if (userRoles) {
      userRoles.delete(roleId);
    }
    
    // 更新角色用户映射
    const roleUsers = this.roleUsers.get(roleId);
    if (roleUsers) {
      roleUsers.delete(userId);
    }
    
    // 发出事件
    this.eventEmitter.emit('role_revoked', { user_id: userId, role_id: roleId });
    logger.debug('Role revoked from user', { user_id: userId, role_id: roleId });
  }

  /**
   * 获取用户的所有角色
   * @param userId 用户ID
   * @returns 用户的角色列表
   */
  async findRolesByUserId(userId: string): Promise<RoleProtocol[]> {
    const roleIds = this.userRoles.get(userId) || new Set();
    
    const roles: RoleProtocol[] = [];
    for (const roleId of roleIds) {
      const role = this.roles.get(roleId);
      if (role) {
        roles.push({ ...role });
      }
    }
    
    return roles;
  }

  /**
   * 获取角色的所有用户
   * @param roleId 角色ID
   * @returns 用户ID列表
   */
  async findUsersByRoleId(roleId: string): Promise<string[]> {
    const userIds = this.roleUsers.get(roleId) || new Set();
    return Array.from(userIds);
  }

  /**
   * 检查名称唯一性
   * @param name 角色名称
   * @param excludeRoleId 排除的角色ID（用于更新时检查）
   * @returns 名称是否唯一
   */
  async isNameUnique(name: string, excludeRoleId?: string): Promise<boolean> {
    for (const [id, role] of this.roles.entries()) {
      if (id === excludeRoleId) continue;
      if (role.name === name) {
        return false;
      }
    }
    return true;
  }

  /**
   * 订阅仓库事件
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * 取消订阅仓库事件
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * 重置仓库状态（仅用于测试）
   */
  public reset(): void {
    this.roles.clear();
    this.userRoles.clear();
    this.roleUsers.clear();
    logger.debug('InMemoryRoleRepository reset');
  }
} 