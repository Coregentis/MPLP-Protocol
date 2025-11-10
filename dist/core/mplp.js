"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLP = void 0;
/**
 * MPLP主类
 *
 * 提供统一的入口点来初始化和使用MPLP的所有功能
 */
class MPLP {
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
    constructor(config = {}) {
        this.modules = new Map();
        this.initialized = false;
        this.initializationPromise = null;
        this.config = {
            protocolVersion: config.protocolVersion || '1.1.0-beta',
            environment: config.environment || 'development',
            logLevel: config.logLevel || 'info',
            modules: config.modules || [...MPLP.AVAILABLE_MODULES],
            autoInitialize: config.autoInitialize || false,
            custom: config.custom || {}
        };
        // 如果启用自动初始化，立即开始初始化
        if (this.config.autoInitialize) {
            this.initializationPromise = this.initialize();
        }
    }
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
    async initialize() {
        // 如果已经在初始化中，等待完成
        if (this.initializationPromise && !this.initialized) {
            return this.initializationPromise;
        }
        // 如果已经初始化，抛出错误
        if (this.initialized) {
            throw new Error('MPLP already initialized. Call reset() first if you want to reinitialize.');
        }
        this.log('info', `Initializing MPLP v${this.config.protocolVersion}...`);
        this.log('debug', `Environment: ${this.config.environment}`);
        this.log('debug', `Modules to load: ${this.config.modules.join(', ')}`);
        const loadResults = [];
        // 加载所有配置的模块
        for (const moduleName of this.config.modules) {
            const result = await this.loadModule(moduleName);
            loadResults.push(result);
            if (!result.loaded) {
                this.log('error', `Failed to load module '${moduleName}': ${result.error?.message}`);
            }
            else {
                this.log('debug', `Module '${moduleName}' loaded successfully`);
            }
        }
        // 检查是否有加载失败的模块
        const failedModules = loadResults.filter(r => !r.loaded);
        if (failedModules.length > 0) {
            const errorMessage = `Failed to load ${failedModules.length} module(s): ${failedModules.map(r => r.name).join(', ')}`;
            this.log('error', errorMessage);
            throw new Error(errorMessage);
        }
        this.initialized = true;
        this.log('info', `MPLP initialized successfully with ${this.modules.size} modules`);
    }
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
    getModule(name) {
        if (!this.initialized) {
            throw new Error('MPLP not initialized. Call initialize() first or use autoInitialize option.\n' +
                'Example: await mplp.initialize();');
        }
        if (!this.modules.has(name)) {
            const available = this.getAvailableModules().join(', ');
            throw new Error(`Module '${name}' not found or not loaded.\n` +
                `Available modules: ${available}\n` +
                `Make sure the module name is correct and included in the config.modules array.`);
        }
        return this.modules.get(name);
    }
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
    getAvailableModules() {
        return Array.from(this.modules.keys());
    }
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
    isInitialized() {
        return this.initialized;
    }
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
    getConfig() {
        return { ...this.config };
    }
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
    reset() {
        this.modules.clear();
        this.initialized = false;
        this.initializationPromise = null;
        this.log('info', 'MPLP reset successfully');
    }
    /**
     * 加载单个模块
     *
     * @param name - 模块名称
     * @returns 加载结果
     * @private
     */
    async loadModule(name) {
        try {
            // 验证模块名称
            if (!MPLP.AVAILABLE_MODULES.includes(name)) {
                throw new Error(`Invalid module name '${name}'. ` +
                    `Available modules: ${MPLP.AVAILABLE_MODULES.join(', ')}`);
            }
            // 动态导入模块 - 使用绝对路径
            let module;
            try {
                // 尝试从编译后的dist目录导入
                module = await Promise.resolve(`${`../../dist/modules/${name}/index.js`}`).then(s => __importStar(require(s)));
            }
            catch (distError) {
                try {
                    // 如果dist不存在，尝试从源代码导入
                    module = await Promise.resolve(`${`../modules/${name}/index`}`).then(s => __importStar(require(s)));
                }
                catch (srcError) {
                    // 两种方式都失败，抛出错误
                    throw new Error(`Failed to load module '${name}' from both dist and src directories. ` +
                        `Dist error: ${distError instanceof Error ? distError.message : String(distError)}. ` +
                        `Src error: ${srcError instanceof Error ? srcError.message : String(srcError)}`);
                }
            }
            // 存储模块
            this.modules.set(name, module);
            return {
                name,
                loaded: true,
                module
            };
        }
        catch (error) {
            return {
                name,
                loaded: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
    /**
     * 日志输出
     *
     * @param level - 日志级别
     * @param message - 日志消息
     * @private
     */
    log(level, message) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const configLevel = this.config.logLevel;
        const configLevelIndex = levels.indexOf(configLevel);
        const messageLevelIndex = levels.indexOf(level);
        // 只输出大于等于配置级别的日志
        if (messageLevelIndex >= configLevelIndex) {
            const timestamp = new Date().toISOString();
            const prefix = `[MPLP ${level.toUpperCase()}] ${timestamp}`;
            switch (level) {
                case 'error':
                    console.error(`${prefix} ${message}`);
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`);
                    break;
                case 'debug':
                case 'info':
                default:
                    console.log(`${prefix} ${message}`);
                    break;
            }
        }
    }
}
exports.MPLP = MPLP;
/**
 * 可用的模块列表
 */
MPLP.AVAILABLE_MODULES = [
    'context',
    'plan',
    'role',
    'confirm',
    'trace',
    'extension',
    'dialog',
    'collab',
    'core',
    'network'
];
//# sourceMappingURL=mplp.js.map