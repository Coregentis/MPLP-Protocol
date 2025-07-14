/**
 * MPLP基准测试模块入口
 *
 * 导出基准测试模块的所有公共API。
 *
 * @version v1.0.0
 * @created 2025-07-17T12:00:00+08:00
 */

// 导出接口
export {
  IBenchmarkCase,
  IBenchmarkRunner,
  IBenchmarkReporter,
  IBenchmarkCollector,
  IBenchmarkFactory,
  BenchmarkType,
  BenchmarkLevel,
  BenchmarkConfig,
  BenchmarkContext,
  BenchmarkResult
} from './interfaces';

// 导出实现
export { DefaultBenchmarkRunner } from './default-runner';
export { DefaultBenchmarkReporter } from './default-reporter';
export { BenchmarkCollector } from './benchmark-collector';
export { DefaultBenchmarkFactory } from './benchmark-factory';

// 导出客户端API
export { BenchmarkClient, BenchmarkBuilder } from './benchmark-client'; 