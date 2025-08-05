/**
 * MPLP Dialog Module - Main Entry Point
 *
 * @version v1.0.0
 * @created 2025-08-02T01:26:00+08:00
 * @description 对话模块主入口，导出所有公共接口
 */

// ==================== 类型导出 ====================
export * from './types';

// ==================== 领域层导出 ====================
export { Dialog } from './domain/entities/dialog.entity';
export {
  DialogRepository,
  MessageRepository,
  DialogStatistics,
} from './domain/repositories/dialog.repository';

// ==================== 应用层导出 ====================
export { DialogService } from './application/services/dialog.service';

// ==================== 基础设施层导出 ====================
export {
  MemoryDialogRepository,
  MemoryMessageRepository,
} from './infrastructure/repositories/memory-dialog.repository';

// ==================== API层导出 ====================
export { DialogController } from './api/controllers/dialog.controller';

// ==================== 模块配置导出 ====================
export { DialogModule } from './module';
