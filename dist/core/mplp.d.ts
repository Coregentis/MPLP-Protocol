/**
 * MPLP主类 - 统一入口点
 *
 * @description 提供简单易用的API来初始化和使用MPLP
 * @version 1.1.0-beta
 * @created 2025-10-21
 * @architecture L1-L3 Protocol Stack
 *
 * 使用示例:
 * ```typescript
 * // 方式1: 使用构造函数
 * const mplp = new MPLP({ environment: 'development' });
 * await mplp.initialize();
 *
 * // 方式2: 使用工厂函数
 * const mplp = await createMPLP({ environment: 'development' });
 *
 * // 获取模块
 * const contextModule = mplp.getModule('context');
 * ```
 */
/**
 * MPLP配置接口
 */
export interface MPLPConfig {
    /**
     * 协议版本
     * @default '1.1.0-beta'
     */
    protocolVersion?: string;
    /**
     * 运行环境
     * @default 'development'
     */
    environment?: 'development' | 'production' | 'test';
    /**
     * 日志级别
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /**
     * 要加载的模块列表
     * @default ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'core', 'network']
     */
    modules?: string[];
    /**
     * 是否启用自动初始化
     * @default false
     */
    autoInitialize?: boolean;
    /**
     * 自定义配置
     */
    custom?: Record<string, unknown>;
}
/**
 * 模块加载结果
 */
export interface ModuleLoadResult {
    name: string;
    loaded: boolean;
    module?: unknown;
    error?: Error;
}
/**
 * MPLP主类
 *
 * 提供统一的入口点来初始化和使用MPLP的所有功能
 */
export declare class MPLP {
    private modules;
    private config;
    private initialized;
    private initializationPromise;
    /**
     * 可用的模块列表
     */
    static readonly AVAILABLE_MODULES: readonly ["context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "core", "network"];
    /**
     * 创建MPLP实例
     *
     * @param config - MPLP配置
     *
     * @example
     * ```typescript
     * const mplp = new MPLP({
     *   environment: 'development',
     *   logLevel: 'info'
     * });
     * await mplp.initialize();
     * ```
     */
    constructor(config?: MPLPConfig);
    /**
     * 初始化MPLP
     *
     * 加载所有配置的模块并准备使用
     *
     * @throws {Error} 如果已经初始化
     * @throws {Error} 如果模块加载失败
     *
     * @example
     * ```typescript
     * await mplp.initialize();
     * console.log('MPLP initialized successfully');
     * ```
     */
    initialize(): Promise<void>;
    /**
     * 获取指定的模块
     *
     * @param name - 模块名称
     * @returns 模块实例
     * @throws {Error} 如果MPLP未初始化
     * @throws {Error} 如果模块不存在
     *
     * @example
     * ```typescript
     * const contextModule = mplp.getModule('context');
     * const planModule = mplp.getModule('plan');
     * ```
     */
    getModule<T = unknown>(name: string): T;
    /**
     * 获取所有已加载的模块名称
     *
     * @returns 模块名称数组
     *
     * @example
     * ```typescript
     * const modules = mplp.getAvailableModules();
     * console.log('Available modules:', modules);
     * ```
     */
    getAvailableModules(): string[];
    /**
     * 检查MPLP是否已初始化
     *
     * @returns 是否已初始化
     *
     * @example
     * ```typescript
     * if (mplp.isInitialized()) {
     *   console.log('MPLP is ready to use');
     * }
     * ```
     */
    isInitialized(): boolean;
    /**
     * 获取当前配置
     *
     * @returns 配置副本
     *
     * @example
     * ```typescript
     * const config = mplp.getConfig();
     * console.log('Environment:', config.environment);
     * ```
     */
    getConfig(): Readonly<Required<MPLPConfig>>;
    /**
     * 重置MPLP状态
     *
     * 清除所有已加载的模块，允许重新初始化
     *
     * @example
     * ```typescript
     * mplp.reset();
     * await mplp.initialize(); // 可以重新初始化
     * ```
     */
    reset(): void;
    /**
     * 加载单个模块
     *
     * @param name - 模块名称
     * @returns 加载结果
     * @private
     */
    private loadModule;
    /**
     * 日志输出
     *
     * @param level - 日志级别
     * @param message - 日志消息
     * @private
     */
    private log;
}
//# sourceMappingURL=mplp.d.ts.map