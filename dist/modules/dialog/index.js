"use strict";
/**
 * Dialog Module Index
 * @description Dialog模块统一导出入口
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogSecurityService = void 0;
const tslib_1 = require("tslib");
// ===== 类型定义导出 =====
tslib_1.__exportStar(require("./types"), exports);
// ===== 领域实体导出 =====
tslib_1.__exportStar(require("./domain/entities/dialog.entity"), exports);
// ===== API层导出 =====
tslib_1.__exportStar(require("./api/mappers/dialog.mapper"), exports);
// ===== 应用层导出 =====
tslib_1.__exportStar(require("./application/services/dialog-management.service"), exports);
tslib_1.__exportStar(require("./application/services/dialog-analytics.service"), exports);
var dialog_security_service_1 = require("./application/services/dialog-security.service");
Object.defineProperty(exports, "DialogSecurityService", { enumerable: true, get: function () { return dialog_security_service_1.DialogSecurityService; } });
// ===== 基础设施层导出 =====
tslib_1.__exportStar(require("./infrastructure/adapters/dialog.adapter"), exports);
// export * from './infrastructure/repositories/dialog.repository';
// export * from './infrastructure/protocols/dialog.protocol';
// ===== 模块配置导出 =====
tslib_1.__exportStar(require("./module"), exports);
//# sourceMappingURL=index.js.map