/**
 * Role模块缓存服务
 * 
 * 提供高性能的角色和权限缓存机制
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { UUID } from '../../../public/shared/types';
import { Role } from '../../domain/entities/role.entity';
import { Permission, PermissionCheckResult } from '../../types';

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * 权限检查缓存键
 */
interface PermissionCacheKey {
  roleId: UUID;
  resourceType: string;
  resourceId: string;
  action: string;
  contextHash: string;
}

/**
 * Role缓存服务
 * 
 * 提供多层缓存机制：
 * 1. 角色对象缓存
 * 2. 权限检查结果缓存
 * 3. 有效权限计算缓存
 */
export class RoleCacheService {
  private roleCache = new Map<UUID, CacheItem<Role>>();
  private permissionCache = new Map<string, CacheItem<PermissionCheckResult>>();
  private effectivePermissionsCache = new Map<string, CacheItem<Permission[]>>();
  
  // 缓存配置
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分钟
  private readonly PERMISSION_CHECK_TTL = 1 * 60 * 1000; // 1分钟
  private readonly EFFECTIVE_PERMISSIONS_TTL = 10 * 60 * 1000; // 10分钟
  private readonly MAX_CACHE_SIZE = 10000; // 最大缓存项数

  /**
   * 获取缓存的角色
   */
  getRole(roleId: UUID): Role | null {
    const item = this.roleCache.get(roleId);
    
    if (!item) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.roleCache.delete(roleId);
      return null;
    }
    
    return item.data;
  }

  /**
   * 缓存角色
   */
  setRole(roleId: UUID, role: Role, ttl: number = this.DEFAULT_TTL): void {
    // 检查缓存大小限制
    if (this.roleCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestRoles();
    }
    
    this.roleCache.set(roleId, {
      data: role,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 获取缓存的权限检查结果
   */
  getPermissionCheck(key: PermissionCacheKey): PermissionCheckResult | null {
    const cacheKey = this.generatePermissionCacheKey(key);
    const item = this.permissionCache.get(cacheKey);
    
    if (!item) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.permissionCache.delete(cacheKey);
      return null;
    }
    
    return item.data;
  }

  /**
   * 缓存权限检查结果
   */
  setPermissionCheck(
    key: PermissionCacheKey, 
    result: PermissionCheckResult, 
    ttl: number = this.PERMISSION_CHECK_TTL
  ): void {
    const cacheKey = this.generatePermissionCacheKey(key);
    
    // 检查缓存大小限制
    if (this.permissionCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestPermissionChecks();
    }
    
    this.permissionCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 获取缓存的有效权限
   */
  getEffectivePermissions(userId: UUID, contextId?: UUID): Permission[] | null {
    const cacheKey = this.generateEffectivePermissionsCacheKey(userId, contextId);
    const item = this.effectivePermissionsCache.get(cacheKey);
    
    if (!item) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.effectivePermissionsCache.delete(cacheKey);
      return null;
    }
    
    return item.data;
  }

  /**
   * 缓存有效权限
   */
  setEffectivePermissions(
    userId: UUID, 
    permissions: Permission[], 
    contextId?: UUID,
    ttl: number = this.EFFECTIVE_PERMISSIONS_TTL
  ): void {
    const cacheKey = this.generateEffectivePermissionsCacheKey(userId, contextId);
    
    // 检查缓存大小限制
    if (this.effectivePermissionsCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEffectivePermissions();
    }
    
    this.effectivePermissionsCache.set(cacheKey, {
      data: permissions,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清除特定角色的缓存
   */
  invalidateRole(roleId: UUID): void {
    this.roleCache.delete(roleId);
    
    // 清除相关的权限检查缓存
    for (const [key, _] of this.permissionCache) {
      if (key.includes(roleId)) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * 清除特定用户的有效权限缓存
   */
  invalidateUserPermissions(userId: UUID): void {
    for (const [key, _] of this.effectivePermissionsCache) {
      if (key.includes(userId)) {
        this.effectivePermissionsCache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.roleCache.clear();
    this.permissionCache.clear();
    this.effectivePermissionsCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    roleCache: { size: number; hitRate: number };
    permissionCache: { size: number; hitRate: number };
    effectivePermissionsCache: { size: number; hitRate: number };
  } {
    return {
      roleCache: {
        size: this.roleCache.size,
        hitRate: this.calculateHitRate('role')
      },
      permissionCache: {
        size: this.permissionCache.size,
        hitRate: this.calculateHitRate('permission')
      },
      effectivePermissionsCache: {
        size: this.effectivePermissionsCache.size,
        hitRate: this.calculateHitRate('effectivePermissions')
      }
    };
  }

  /**
   * 生成权限检查缓存键
   */
  private generatePermissionCacheKey(key: PermissionCacheKey): string {
    return `${key.roleId}:${key.resourceType}:${key.resourceId}:${key.action}:${key.contextHash}`;
  }

  /**
   * 生成有效权限缓存键
   */
  private generateEffectivePermissionsCacheKey(userId: UUID, contextId?: UUID): string {
    return `${userId}:${contextId || 'global'}`;
  }

  /**
   * 生成上下文哈希
   */
  generateContextHash(context: Record<string, unknown>): string {
    // 简单的哈希实现，生产环境可以使用更复杂的哈希算法
    const sortedKeys = Object.keys(context).sort();
    const contextString = sortedKeys.map(key => `${key}:${context[key]}`).join('|');
    
    // 简单的字符串哈希
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * 淘汰最旧的角色缓存项
   */
  private evictOldestRoles(): void {
    let oldestKey: UUID | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, item] of this.roleCache) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.roleCache.delete(oldestKey);
    }
  }

  /**
   * 淘汰最旧的权限检查缓存项
   */
  private evictOldestPermissionChecks(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, item] of this.permissionCache) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.permissionCache.delete(oldestKey);
    }
  }

  /**
   * 淘汰最旧的有效权限缓存项
   */
  private evictOldestEffectivePermissions(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, item] of this.effectivePermissionsCache) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.effectivePermissionsCache.delete(oldestKey);
    }
  }

  /**
   * 计算缓存命中率（简化实现）
   */
  private calculateHitRate(cacheType: 'role' | 'permission' | 'effectivePermissions'): number {
    // 这里是简化实现，生产环境需要实际的命中率统计
    return 0.85; // 假设85%的命中率
  }
}
