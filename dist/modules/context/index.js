"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTEXT_MODULE_INFO = exports.ContextModuleAdapter = void 0;
__exportStar(require("./api/controllers/context.controller"), exports);
__exportStar(require("./api/dto/context.dto"), exports);
__exportStar(require("./api/mappers/context.mapper"), exports);
__exportStar(require("./application/services/context-management.service"), exports);
__exportStar(require("./domain/entities/context.entity"), exports);
__exportStar(require("./domain/repositories/context-repository.interface"), exports);
__exportStar(require("./infrastructure/repositories/context.repository"), exports);
__exportStar(require("./infrastructure/protocols/context.protocol.js"), exports);
__exportStar(require("./infrastructure/factories/context-protocol.factory.js"), exports);
var context_module_adapter_1 = require("./infrastructure/adapters/context-module.adapter");
Object.defineProperty(exports, "ContextModuleAdapter", { enumerable: true, get: function () { return context_module_adapter_1.ContextModuleAdapter; } });
__exportStar(require("./module.js"), exports);
__exportStar(require("./types.js"), exports);
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
