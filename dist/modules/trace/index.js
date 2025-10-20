"use strict";
/**
 * Trace模块统一导出
 *
 * @description 提供Trace模块的统一导出接口
 * @version 1.0.0
 * @schema 基于 mplp-trace.json Schema驱动开发
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceProtocolFactory = exports.TraceMapper = exports.TraceProtocol = exports.TraceRepository = exports.TraceManagementService = exports.TraceController = exports.TraceEntity = void 0;
const tslib_1 = require("tslib");
// ===== API层导出 ===== (MANDATORY SECTION)
tslib_1.__exportStar(require("./api/controllers/trace.controller"), exports);
tslib_1.__exportStar(require("./api/dto/trace.dto"), exports);
tslib_1.__exportStar(require("./api/mappers/trace.mapper"), exports);
// ===== 应用层导出 ===== (MANDATORY SECTION)
tslib_1.__exportStar(require("./application/services/trace-management.service"), exports);
// ===== 领域层导出 ===== (MANDATORY SECTION)
tslib_1.__exportStar(require("./domain/entities/trace.entity"), exports);
tslib_1.__exportStar(require("./domain/repositories/trace-repository.interface"), exports);
// ===== 基础设施层导出 ===== (MANDATORY SECTION)
tslib_1.__exportStar(require("./infrastructure/repositories/trace.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/protocols/trace.protocol"), exports);
tslib_1.__exportStar(require("./infrastructure/factories/trace-protocol.factory"), exports);
// ===== 具体类导出 ===== (MANDATORY SECTION)
var trace_entity_1 = require("./domain/entities/trace.entity");
Object.defineProperty(exports, "TraceEntity", { enumerable: true, get: function () { return trace_entity_1.TraceEntity; } });
var trace_controller_1 = require("./api/controllers/trace.controller");
Object.defineProperty(exports, "TraceController", { enumerable: true, get: function () { return trace_controller_1.TraceController; } });
var trace_management_service_1 = require("./application/services/trace-management.service");
Object.defineProperty(exports, "TraceManagementService", { enumerable: true, get: function () { return trace_management_service_1.TraceManagementService; } });
var trace_repository_1 = require("./infrastructure/repositories/trace.repository");
Object.defineProperty(exports, "TraceRepository", { enumerable: true, get: function () { return trace_repository_1.TraceRepository; } });
var trace_protocol_1 = require("./infrastructure/protocols/trace.protocol");
Object.defineProperty(exports, "TraceProtocol", { enumerable: true, get: function () { return trace_protocol_1.TraceProtocol; } });
var trace_mapper_1 = require("./api/mappers/trace.mapper");
Object.defineProperty(exports, "TraceMapper", { enumerable: true, get: function () { return trace_mapper_1.TraceMapper; } });
var trace_protocol_factory_1 = require("./infrastructure/factories/trace-protocol.factory");
Object.defineProperty(exports, "TraceProtocolFactory", { enumerable: true, get: function () { return trace_protocol_factory_1.TraceProtocolFactory; } });
//# sourceMappingURL=index.js.map