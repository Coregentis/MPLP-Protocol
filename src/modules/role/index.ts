/**
 * MPLP Role模块
 * 
 * 角色管理和权限控制模块，提供基于RBAC的权限管理
 * 
 * @version 1.0.1
 * @since 2025-07-10
 * @compliance .cursor/rules/schema-design.mdc
 */

// 导出公共类型
export * from './types';

// 导出主要类
export { RoleManager } from './role-manager';
export { RoleService } from './role-service';
export { RoleController } from './role-controller';

// 导出常量
export const ROLE_MODULE_VERSION = '1.0.1';
export const ROLE_MODULE_NAME = 'role';

// 模块配置
export const ROLE_MODULE_CONFIG = {
  protocol_version: '1.0.1',
  features: {
    permission_check: true,
    role_inheritance: true,
    role_delegation: true,
    audit_logging: true,
    performance_metrics: true
  },
  defaults: {
    cache_ttl_seconds: 300,
    max_batch_size: 100,
    max_inheritance_depth: 10,
    max_delegation_depth: 5
  }
}; 