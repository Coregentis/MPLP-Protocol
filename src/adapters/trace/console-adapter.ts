/**
 * 控制台追踪适配器
 * 
 * 将追踪数据输出到控制台
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { BaseTraceAdapter } from './base-adapter';
import { AdapterInfo } from '../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../modules/trace/types';
import { Logger } from '../../public/utils/logger';

/**
 * 控制台追踪适配器类
 */
export class ConsoleTraceAdapter extends BaseTraceAdapter {
  constructor() {
    super();
    this.logger = new Logger('ConsoleTraceAdapter');
  }

  /**
   * 获取适配器信息
   */
  getAdapterInfo(): AdapterInfo {
    return {
      type: 'console',
      version: '1.0.0',
      name: this.config.name,
      description: '控制台追踪适配器，输出到控制台',
      capabilities: ['record', 'batch_record'],
      status: this.initialized ? 'active' : 'inactive'
    };
  }

  /**
   * 记录追踪数据
   */
  async recordTrace(traceData: Partial<MPLPTraceData>): Promise<{ success: boolean; data?: MPLPTraceData; error?: string }> {
    const result = await super.recordTrace(traceData);
    
    if (result.success && result.data) {
      console.log('🔍 TRACE:', {
        id: result.data.trace_id,
        type: result.data.trace_type,
        severity: result.data.severity,
        event: result.data.event.name,
        timestamp: result.data.timestamp
      });
    }
    
    return result;
  }
}
