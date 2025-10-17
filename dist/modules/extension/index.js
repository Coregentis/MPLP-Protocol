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
exports.EXTENSION_MODULE_INFO = void 0;
__exportStar(require("./api/controllers/extension.controller"), exports);
__exportStar(require("./api/dto/extension.dto"), exports);
__exportStar(require("./api/mappers/extension.mapper"), exports);
__exportStar(require("./application/services/extension-management.service"), exports);
__exportStar(require("./application/services/extension-analytics.service"), exports);
__exportStar(require("./application/services/extension-security.service"), exports);
__exportStar(require("./domain/entities/extension.entity"), exports);
__exportStar(require("./domain/repositories/extension.repository.interface"), exports);
__exportStar(require("./infrastructure/repositories/extension.repository"), exports);
__exportStar(require("./infrastructure/protocols/extension.protocol"), exports);
__exportStar(require("./infrastructure/factories/extension-protocol.factory"), exports);
__exportStar(require("./module"), exports);
__exportStar(require("./types"), exports);
exports.EXTENSION_MODULE_INFO = {
    name: 'extension',
    version: '1.0.0',
    description: 'MPLP扩展管理和插件协调模块',
    layer: 'L2',
    status: 'implementing',
    features: [
        '扩展生命周期管理',
        '插件协调',
        '扩展点管理',
        'API扩展',
        '事件订阅',
        '安全沙箱',
        '资源限制',
        '代码签名',
        '权限管理',
        '性能监控',
        '版本历史',
        '搜索元数据',
        '事件集成',
        '审计追踪'
    ],
    dependencies: [
        'security',
        'performance',
        'eventBus',
        'errorHandler',
        'coordination',
        'orchestration',
        'sandboxing',
        'resourceManagement',
        'protocolVersion'
    ]
};
