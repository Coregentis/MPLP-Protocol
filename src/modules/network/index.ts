/**
 * MPLP Network Module - Main Entry Point
 *
 * @version v1.0.0
 * @created 2025-08-02T01:36:00+08:00
 * @description 网络模块主入口，导出所有公共接口
 */

// ==================== 类型导出 ====================
export * from './types';

// ==================== 领域层导出 ====================
export { Network } from './domain/entities/network.entity';
export {
  NetworkRepository,
  NodeDiscoveryRepository,
  RoutingRepository,
  NetworkStatistics,
} from './domain/repositories/network.repository';

// ==================== 应用层导出 ====================
export { NetworkService } from './application/services/network.service';

// ==================== 基础设施层导出 ====================
export {
  MemoryNetworkRepository,
  MemoryNodeDiscoveryRepository,
  MemoryRoutingRepository,
} from './infrastructure/repositories/memory-network.repository';

// ==================== API层导出 ====================
export { NetworkController } from './api/controllers/network.controller';

// ==================== 模块配置导出 ====================
export { NetworkModule } from './module';
