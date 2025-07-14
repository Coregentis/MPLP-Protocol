/**
 * Role仓库接口 - 厂商中立设计
 * 
 * 定义了MPLP角色管理与存储系统集成的标准接口。
 * 所有角色仓库实现必须遵循此接口。
 * 
 * @version v1.0.0
 * @created 2025-07-13T00:30:00+08:00
 * @compliance role-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { RoleProtocol, RoleFilter, UserRoleAssignment } from '../modules/role/types';

/**
 * 角色仓库接口 - 厂商中立
 */
export interface IRoleRepository {
  /**
   * 保存角色
   * @param role 角色对象
   * @returns Promise<void>
   */
  save(role: RoleProtocol): Promise<void>;

  /**
   * 根据ID查询角色
   * @param roleId 角色ID
   * @returns Promise<RoleProtocol | null> 找到的角色或null
   */
  findById(roleId: string): Promise<RoleProtocol | null>;

  /**
   * 根据过滤条件查询角色
   * @param filter 角色过滤条件
   * @returns Promise<RoleProtocol[]> 角色列表
   */
  findByFilter(filter: RoleFilter): Promise<RoleProtocol[]>;

  /**
   * 更新角色
   * @param roleId 角色ID
   * @param updates 更新内容
   * @returns Promise<void>
   */
  update(roleId: string, updates: Partial<RoleProtocol>): Promise<void>;

  /**
   * 删除角色
   * @param roleId 角色ID
   * @returns Promise<void>
   */
  delete(roleId: string): Promise<void>;

  /**
   * 检查角色是否存在
   * @param roleId 角色ID
   * @returns Promise<boolean> 是否存在
   */
  exists(roleId: string): Promise<boolean>;

  /**
   * 计数角色
   * @param filter 可选的过滤条件
   * @returns Promise<number> 角色数量
   */
  count(filter?: RoleFilter): Promise<number>;

  /**
   * 分配角色给用户
   * @param assignment 用户角色分配
   * @returns Promise<void>
   */
  assignRoleToUser(assignment: UserRoleAssignment): Promise<void>;

  /**
   * 取消用户的角色分配
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns Promise<void>
   */
  revokeRoleFromUser(userId: string, roleId: string): Promise<void>;

  /**
   * 获取用户的所有角色
   * @param userId 用户ID
   * @returns Promise<RoleProtocol[]> 用户的角色列表
   */
  findRolesByUserId(userId: string): Promise<RoleProtocol[]>;

  /**
   * 获取角色的所有用户
   * @param roleId 角色ID
   * @returns Promise<string[]> 用户ID列表
   */
  findUsersByRoleId(roleId: string): Promise<string[]>;

  /**
   * 检查名称唯一性
   * @param name 角色名称
   * @param excludeRoleId 排除的角色ID（用于更新时检查）
   * @returns Promise<boolean> 名称是否唯一
   */
  isNameUnique(name: string, excludeRoleId?: string): Promise<boolean>;
} 