"use strict";
/**
 * Network模块主入口
 *
 * @description Network模块的公共API导出
 * @version 1.0.0
 * @layer 模块层 - 导出
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_MODULE_INFO = exports.NetworkModuleAdapter = void 0;
const tslib_1 = require("tslib");
// ===== DDD架构层导出 =====
// API层
tslib_1.__exportStar(require("./api/controllers/network.controller"), exports);
tslib_1.__exportStar(require("./api/dto/network.dto"), exports);
tslib_1.__exportStar(require("./api/mappers/network.mapper"), exports);
// 应用层
tslib_1.__exportStar(require("./application/services/network-management.service"), exports);
// 领域层
tslib_1.__exportStar(require("./domain/entities/network.entity"), exports);
tslib_1.__exportStar(require("./domain/repositories/network-repository.interface"), exports);
// 基础设施层
tslib_1.__exportStar(require("./infrastructure/repositories/network.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/protocols/network.protocol"), exports);
tslib_1.__exportStar(require("./infrastructure/factories/network-protocol.factory"), exports);
// ===== 适配器导出 =====
var network_module_adapter_1 = require("./infrastructure/adapters/network-module.adapter");
Object.defineProperty(exports, "NetworkModuleAdapter", { enumerable: true, get: function () { return network_module_adapter_1.NetworkModuleAdapter; } });
// ===== 模块集成 =====
tslib_1.__exportStar(require("./module"), exports);
// ===== 类型定义导出 =====
tslib_1.__exportStar(require("./types"), exports);
/**
 * Network模块信息
 */
exports.NETWORK_MODULE_INFO = {
    name: 'network',
    version: '1.0.0',
    description: 'MPLP网络通信和分布式协作模块',
    layer: 'L2',
    status: 'implementing',
    features: [
        '网络拓扑管理',
        '节点发现和注册',
        '路由策略优化',
        '连接状态监控',
        '负载均衡',
        '故障恢复',
        '性能监控',
        '安全通信',
        '分布式协调',
        '事件广播',
        '消息路由',
        '网络诊断',
        '拓扑可视化'
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