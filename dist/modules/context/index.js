"use strict";
/**
 * MPLP Context模块主入口
 *
 * @description Context模块的统一导出入口，提供上下文和全局状态管理功能
 * @version 1.0.0
 * @module L2协调层 - Context模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTEXT_MODULE_INFO = exports.ContextModuleAdapter = void 0;
const tslib_1 = require("tslib");
// ===== DDD架构层导出 =====
// API层
tslib_1.__exportStar(require("./api/controllers/context.controller"), exports);
tslib_1.__exportStar(require("./api/dto/context.dto"), exports);
tslib_1.__exportStar(require("./api/mappers/context.mapper"), exports);
// 应用层
tslib_1.__exportStar(require("./application/services/context-management.service"), exports);
// 领域层
tslib_1.__exportStar(require("./domain/entities/context.entity"), exports);
tslib_1.__exportStar(require("./domain/repositories/context-repository.interface"), exports);
// 基础设施层
tslib_1.__exportStar(require("./infrastructure/repositories/context.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/protocols/context.protocol.js"), exports);
tslib_1.__exportStar(require("./infrastructure/factories/context-protocol.factory.js"), exports);
// ===== 适配器导出 =====
var context_module_adapter_1 = require("./infrastructure/adapters/context-module.adapter");
Object.defineProperty(exports, "ContextModuleAdapter", { enumerable: true, get: function () { return context_module_adapter_1.ContextModuleAdapter; } });
// ===== 模块集成 =====
tslib_1.__exportStar(require("./module.js"), exports);
// ===== 类型定义导出 =====
tslib_1.__exportStar(require("./types.js"), exports);
/**
 * Context模块信息
 */
exports.CONTEXT_MODULE_INFO = {
    name: 'context',
    version: '1.0.0',
    description: 'MPLP上下文和全局状态管理模块',
    layer: 'L2',
    status: 'implementing',
    features: [
        '上下文管理',
        '状态同步',
        '生命周期管理',
        '权限控制',
        '审计追踪',
        '性能监控',
        '版本历史',
        '搜索索引',
        '缓存策略',
        '同步配置',
        '错误处理',
        '集成接口',
        '事件集成'
    ],
    dependencies: [
        'security',
        'performance',
        'eventBus',
        'errorHandler',
        'coordination',
        'orchestration',
        'stateSync',
        'transaction',
        'protocolVersion'
    ]
};
//# sourceMappingURL=index.js.map