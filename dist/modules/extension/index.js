"use strict";
/**
 * MPLP Extension模块主入口
 *
 * @description Extension模块的统一导出入口，提供扩展管理和插件协调功能
 * @version 1.0.0
 * @module L2协调层 - Extension模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION_MODULE_INFO = void 0;
const tslib_1 = require("tslib");
// ===== DDD架构层导出 =====
// API层
tslib_1.__exportStar(require("./api/controllers/extension.controller"), exports);
tslib_1.__exportStar(require("./api/dto/extension.dto"), exports);
tslib_1.__exportStar(require("./api/mappers/extension.mapper"), exports);
// 应用层 - 3个核心服务
tslib_1.__exportStar(require("./application/services/extension-management.service"), exports);
tslib_1.__exportStar(require("./application/services/extension-analytics.service"), exports);
tslib_1.__exportStar(require("./application/services/extension-security.service"), exports);
// 领域层
tslib_1.__exportStar(require("./domain/entities/extension.entity"), exports);
tslib_1.__exportStar(require("./domain/repositories/extension.repository.interface"), exports);
// 基础设施层
tslib_1.__exportStar(require("./infrastructure/repositories/extension.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/protocols/extension.protocol"), exports);
tslib_1.__exportStar(require("./infrastructure/factories/extension-protocol.factory"), exports);
// ===== 模块集成 =====
tslib_1.__exportStar(require("./module"), exports);
// ===== 类型定义导出 =====
tslib_1.__exportStar(require("./types"), exports);
/**
 * Extension模块信息
 */
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
//# sourceMappingURL=index.js.map