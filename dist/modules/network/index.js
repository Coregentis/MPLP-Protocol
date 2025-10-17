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
exports.NETWORK_MODULE_INFO = exports.NetworkModuleAdapter = void 0;
__exportStar(require("./api/controllers/network.controller"), exports);
__exportStar(require("./api/dto/network.dto"), exports);
__exportStar(require("./api/mappers/network.mapper"), exports);
__exportStar(require("./application/services/network-management.service"), exports);
__exportStar(require("./domain/entities/network.entity"), exports);
__exportStar(require("./domain/repositories/network-repository.interface"), exports);
__exportStar(require("./infrastructure/repositories/network.repository"), exports);
__exportStar(require("./infrastructure/protocols/network.protocol"), exports);
__exportStar(require("./infrastructure/factories/network-protocol.factory"), exports);
var network_module_adapter_1 = require("./infrastructure/adapters/network-module.adapter");
Object.defineProperty(exports, "NetworkModuleAdapter", { enumerable: true, get: function () { return network_module_adapter_1.NetworkModuleAdapter; } });
__exportStar(require("./module"), exports);
__exportStar(require("./types"), exports);
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
