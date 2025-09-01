/**
 * Trace仓库接口
 * 
 * @description Trace模块的数据访问层接口定义
 * @version 1.0.0
 * @layer 领域层 - 仓库接口
 * @pattern 仓库模式，定义数据访问抽象
 */

import {
  TraceEntityData,
  TraceQueryFilter,
  CreateTraceRequest,
  UpdateTraceRequest,
  TimeRange,
  TraceFilters
} from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { TraceEntity } from '../entities/trace.entity';

/**
 * Trace仓库接口
 * 
 * @description 定义Trace数据访问的标准接口
 */
export interface ITraceRepository {
  
  /**
   * 创建追踪记录
   */
  create(request: CreateTraceRequest): Promise<TraceEntityData>;
  
  /**
   * 根据ID获取追踪记录
   */
  findById(traceId: UUID): Promise<TraceEntityData | null>;
  
  /**
   * 更新追踪记录
   */
  update(request: UpdateTraceRequest): Promise<TraceEntityData>;
  
  /**
   * 删除追踪记录
   */
  delete(traceId: UUID): Promise<boolean>;
  
  /**
   * 查询追踪记录
   */
  query(
    filter: TraceQueryFilter,
    pagination?: PaginationParams
  ): Promise<{ traces: TraceEntityData[]; total: number }>;
  
  /**
   * 检查追踪记录是否存在
   */
  exists(traceId: UUID): Promise<boolean>;
  
  /**
   * 获取追踪记录数量
   */
  count(filter?: Partial<TraceQueryFilter>): Promise<number>;
  
  /**
   * 批量创建追踪记录
   */
  createBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
  
  /**
   * 批量删除追踪记录
   */
  deleteBatch(traceIds: UUID[]): Promise<number>;

  // ===== 新增重构方法 =====

  /**
   * 保存追踪实体
   */
  save(trace: TraceEntity): Promise<TraceEntity>;

  /**
   * 更新追踪实体
   */
  update(trace: TraceEntity): Promise<TraceEntity>;

  /**
   * 按时间范围查询
   */
  queryByTimeRange(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceEntity[]>;
  
  /**
   * 获取健康状态
   */
  getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
}
