/**
 * Dialog Module Index
 * @description Dialog模块统一导出入口
 * @version 1.0.0
 */

// ===== 类型定义导出 =====
export * from './types';

// ===== 领域实体导出 =====
export * from './domain/entities/dialog.entity';

// ===== API层导出 =====
export * from './api/mappers/dialog.mapper';

// ===== 应用层导出 =====
export * from './application/services/dialog-management.service';
export * from './application/services/dialog-analytics.service';
export { DialogSecurityService } from './application/services/dialog-security.service';

// ===== 基础设施层导出 =====
export * from './infrastructure/adapters/dialog.adapter';
// export * from './infrastructure/repositories/dialog.repository';
// export * from './infrastructure/protocols/dialog.protocol';

// ===== 模块配置导出 =====
export * from './module';
