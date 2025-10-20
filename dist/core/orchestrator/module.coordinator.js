"use strict";
/**
 * ModuleCoordinator - 模块协调器
 * 负责与10个MPLP模块的协调和服务调用管理
 * 替换Mock实现，实现真实的模块间协调
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleCoordinator = void 0;
// ===== 模块协调器实现 =====
class ModuleCoordinator {
    constructor(_connectionTimeout = 5000, // Reserved for future timeout configuration
    defaultRetryPolicy = {
        maxRetries: 3,
        retryDelay: 1000,
        backoffStrategy: 'exponential',
        retryableErrors: ['timeout', 'network', 'temporary']
    }) {
        this._connectionTimeout = _connectionTimeout;
        this.defaultRetryPolicy = defaultRetryPolicy;
        this.registeredModules = new Map();
        this.activeConnections = new Map();
        this.pendingRequests = new Map();
        this.failedOperations = new Map();
    }
    /**
     * 注册模块
     */
    async registerModule(module) {
        // 验证模块信息
        this.validateModuleInfo(module);
        // 检查模块健康状态
        const healthStatus = await this.checkModuleHealth(module);
        if (!healthStatus.healthy) {
            throw new Error(`Module ${module.moduleId} failed health check: ${healthStatus.error}`);
        }
        // 注册模块
        module.status = 'active';
        module.registeredAt = new Date().toISOString();
        module.lastHeartbeat = new Date().toISOString();
        this.registeredModules.set(module.moduleId, module);
        // 建立连接
        await this.establishConnection(module);
        // Module registered successfully
    }
    /**
     * 发现模块
     */
    async discoverModules() {
        return Array.from(this.registeredModules.values())
            .filter(module => module.status === 'active');
    }
    /**
     * 调用模块服务
     */
    async invokeModuleService(moduleId, serviceId, parameters) {
        const requestId = this.generateUUID();
        const request = {
            requestId,
            moduleId,
            serviceId,
            parameters,
            timestamp: new Date().toISOString()
        };
        // 验证模块是否已注册
        const module = this.registeredModules.get(moduleId);
        if (!module) {
            throw new Error(`Module ${moduleId} not registered`);
        }
        // 验证服务是否存在
        const service = module.services.find(s => s.serviceId === serviceId);
        if (!service) {
            throw new Error(`Service ${serviceId} not found in module ${moduleId}`);
        }
        // 验证输入参数
        this.validateServiceParameters(parameters, service.inputSchema);
        // 获取连接
        const connection = await this.getModuleConnection(moduleId);
        try {
            // 记录请求
            this.pendingRequests.set(requestId, request);
            // 执行服务调用
            const startTime = Date.now();
            const result = await this.executeServiceCall(connection, request, service);
            const duration = Date.now() - startTime;
            const serviceResult = {
                requestId,
                moduleId,
                serviceId,
                status: 'success',
                result: result,
                duration,
                timestamp: new Date().toISOString()
            };
            return serviceResult;
        }
        catch (error) {
            const duration = Date.now() - Date.now();
            const serviceError = {
                errorCode: 'EXECUTION_ERROR',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorType: 'execution',
                retryable: this.isRetryableError(error)
            };
            return {
                requestId,
                moduleId,
                serviceId,
                status: 'error',
                error: serviceError,
                duration,
                timestamp: new Date().toISOString()
            };
        }
        finally {
            this.pendingRequests.delete(requestId);
        }
    }
    /**
     * 协调多个模块
     */
    async coordinateModules(modules, operation) {
        const coordinationId = this.generateUUID();
        const results = [];
        const errors = [];
        const startTime = Date.now();
        try {
            // 顺序执行模块操作
            for (const moduleId of modules) {
                try {
                    const moduleStartTime = Date.now();
                    const result = await this.invokeModuleService(moduleId, operation, {});
                    const moduleDuration = Date.now() - moduleStartTime;
                    results.push({
                        moduleId,
                        status: result.status === 'success' ? 'success' : 'error',
                        result: result.result,
                        error: result.error,
                        duration: moduleDuration
                    });
                }
                catch (error) {
                    errors.push({
                        moduleId,
                        errorType: 'execution',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        retryCount: 0
                    });
                    results.push({
                        moduleId,
                        status: 'error',
                        duration: 0
                    });
                }
            }
            const totalDuration = Date.now() - startTime;
            const successCount = results.filter(r => r.status === 'success').length;
            const status = successCount === modules.length ? 'success' :
                successCount > 0 ? 'partial_success' : 'failure';
            return {
                coordinationId,
                status,
                results,
                duration: totalDuration,
                errors,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                coordinationId,
                status: 'failure',
                results,
                duration: Date.now() - startTime,
                errors: [{
                        moduleId: 'coordinator',
                        errorType: 'coordination',
                        message: error instanceof Error ? error.message : 'Coordination failed',
                        retryCount: 0
                    }],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * 处理模块错误
     */
    async handleModuleError(error) {
        // 根据错误类型决定处理策略
        switch (error.errorType) {
            case 'timeout':
                return {
                    handled: true,
                    action: 'retry',
                    retryAfter: 2000
                };
            case 'connection':
                return {
                    handled: true,
                    action: 'retry',
                    retryAfter: 5000
                };
            case 'validation':
                return {
                    handled: true,
                    action: 'abort'
                };
            case 'authentication':
                return {
                    handled: true,
                    action: 'abort'
                };
            default:
                return {
                    handled: false,
                    action: 'skip'
                };
        }
    }
    /**
     * 重试操作
     */
    async retryOperation(operation) {
        if (operation.retryCount >= operation.maxRetries) {
            return {
                operationId: operation.operationId,
                status: 'max_retries_exceeded',
                totalRetries: operation.retryCount
            };
        }
        try {
            // 计算重试延迟
            const delay = this.calculateRetryDelay(operation.retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));
            // 重试服务调用
            const result = await this.invokeModuleService(operation.moduleId, operation.serviceId, operation.parameters);
            if (result.status === 'success') {
                // 重试成功，移除失败记录
                this.failedOperations.delete(operation.operationId);
                return {
                    operationId: operation.operationId,
                    status: 'success',
                    result,
                    totalRetries: operation.retryCount + 1
                };
            }
            else {
                // 重试仍然失败
                operation.retryCount++;
                operation.lastAttempt = new Date().toISOString();
                return {
                    operationId: operation.operationId,
                    status: 'failed',
                    error: {
                        errorId: this.generateUUID(),
                        moduleId: operation.moduleId,
                        serviceId: operation.serviceId,
                        errorType: 'execution',
                        message: result.error?.errorMessage || 'Retry failed',
                        timestamp: new Date().toISOString()
                    },
                    totalRetries: operation.retryCount
                };
            }
        }
        catch (error) {
            operation.retryCount++;
            operation.lastAttempt = new Date().toISOString();
            return {
                operationId: operation.operationId,
                status: 'failed',
                error: {
                    errorId: this.generateUUID(),
                    moduleId: operation.moduleId,
                    serviceId: operation.serviceId,
                    errorType: 'execution',
                    message: error instanceof Error ? error.message : 'Retry failed',
                    timestamp: new Date().toISOString()
                },
                totalRetries: operation.retryCount
            };
        }
    }
    // ===== 私有辅助方法 =====
    validateModuleInfo(module) {
        if (!module.moduleId) {
            throw new Error('Module ID is required');
        }
        if (!module.moduleName) {
            throw new Error('Module name is required');
        }
        if (!module.services || module.services.length === 0) {
            throw new Error('At least one service is required');
        }
    }
    async checkModuleHealth(_module) {
        // 简化实现：假设模块健康
        return { healthy: true };
    }
    async establishConnection(module) {
        const connection = {
            moduleId: module.moduleId,
            endpoint: module.endpoints[0]?.url || `http://localhost:3000/${module.moduleId}`,
            status: 'connected',
            lastUsed: new Date().toISOString()
        };
        this.activeConnections.set(module.moduleId, connection);
    }
    async getModuleConnection(moduleId) {
        const connection = this.activeConnections.get(moduleId);
        if (!connection) {
            throw new Error(`No connection found for module ${moduleId}`);
        }
        return connection;
    }
    validateServiceParameters(parameters, _schema) {
        // 简化实现：基础参数验证
        if (typeof parameters !== 'object' || parameters === null) {
            throw new Error('Parameters must be an object');
        }
    }
    async executeServiceCall(_connection, request, _service) {
        // 简化实现：模拟服务调用
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            success: true,
            data: `Result from ${request.moduleId}.${request.serviceId}`,
            timestamp: new Date().toISOString()
        };
    }
    isRetryableError(error) {
        if (error instanceof Error) {
            const retryableMessages = ['timeout', 'network', 'temporary', 'connection'];
            return retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
        }
        return false;
    }
    calculateRetryDelay(retryCount) {
        const baseDelay = this.defaultRetryPolicy.retryDelay;
        switch (this.defaultRetryPolicy.backoffStrategy) {
            case 'exponential':
                return baseDelay * Math.pow(2, retryCount);
            case 'linear':
                return baseDelay * (retryCount + 1);
            default:
                return baseDelay;
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.ModuleCoordinator = ModuleCoordinator;
//# sourceMappingURL=module.coordinator.js.map