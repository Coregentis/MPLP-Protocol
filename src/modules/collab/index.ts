/**
 * MPLP Collab Module - Main Entry Point
 *
 * @version v2.0.0
 * @created 2025-08-02T01:14:00+08:00
 * @updated 2025-08-04 22:19
 * @description 协作模块主入口，导出所有公共接口
 */

// ==================== 类型导出 ====================
export * from './types';

// ==================== 领域层导出 ====================
export { Collab } from './domain/entities/collab.entity';
export {
  CollabRepository,
  CollabStatistics,
} from './domain/repositories/collab.repository';

// ==================== 应用层导出 ====================
export { CollabService } from './application/services/collab.service';

// ==================== 基础设施层导出 ====================
export { MemoryCollabRepository } from './infrastructure/repositories/memory-collab.repository';

// ==================== API层导出 ====================
export { CollabController } from './api/controllers/collab.controller';

// ==================== 模块配置导出 ====================
export { CollabModule } from './module';

// ==================== 适配器导出 ====================
export { CollabModuleAdapter } from './infrastructure/adapters/collab-module.adapter';
