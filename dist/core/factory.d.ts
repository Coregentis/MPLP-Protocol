/**
 * MPLP工厂函数
 *
 * @description 提供便捷的创建和初始化方式
 * @version 1.1.0-beta
 * @created 2025-10-21
 *
 * 使用示例:
 * ```typescript
 * // 使用createMPLP
 * const mplp = await createMPLP({ environment: 'development' });
 *
 * // 使用quickStart（最简单）
 * const mplp = await quickStart();
 * ```
 */
import { MPLP, MPLPConfig } from './mplp';
/**
 * 创建并初始化MPLP实例
 *
 * 这是一个便捷函数，会自动调用initialize()
 *
 * @param config - MPLP配置
 * @returns 已初始化的MPLP实例
 *
 * @example
 * ```typescript
 * const mplp = await createMPLP({
 *   environment: 'production',
 *   logLevel: 'warn'
 * });
 *
 * // 可以直接使用，无需再调用initialize()
 * const contextModule = mplp.getModule('context');
 * ```
 */
export declare function createMPLP(config?: MPLPConfig): Promise<MPLP>;
/**
 * 快速启动MPLP
 *
 * 使用默认配置创建并初始化MPLP实例
 * 这是最简单的启动方式，适合快速开始使用
 *
 * @returns 已初始化的MPLP实例
 *
 * @example
 * ```typescript
 * // 一行代码启动MPLP
 * const mplp = await quickStart();
 *
 * // 立即可用
 * const modules = mplp.getAvailableModules();
 * console.log('Available modules:', modules);
 * ```
 */
export declare function quickStart(): Promise<MPLP>;
/**
 * 创建生产环境MPLP实例
 *
 * 使用生产环境优化的配置
 *
 * @param config - 额外的配置选项
 * @returns 已初始化的MPLP实例
 *
 * @example
 * ```typescript
 * const mplp = await createProductionMPLP();
 * ```
 */
export declare function createProductionMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>;
/**
 * 创建测试环境MPLP实例
 *
 * 使用测试环境优化的配置
 *
 * @param config - 额外的配置选项
 * @returns 已初始化的MPLP实例
 *
 * @example
 * ```typescript
 * const mplp = await createTestMPLP();
 * ```
 */
export declare function createTestMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>;
//# sourceMappingURL=factory.d.ts.map