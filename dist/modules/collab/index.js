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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.CollabProtocolFactory = exports.CollabProtocol = exports.CollabModuleAdapter = exports.CollabRepositoryImpl = exports.CollabCoordinationService = exports.CollabCoordinationStrategy = exports.CollabParticipant = exports.CollabEntity = exports.CollabManagementService = exports.CollabMapper = exports.CollabController = exports.CollabModule = void 0;
var module_1 = require("./module");
Object.defineProperty(exports, "CollabModule", { enumerable: true, get: function () { return __importDefault(module_1).default; } });
__exportStar(require("./types"), exports);
var collab_controller_1 = require("./api/controllers/collab.controller");
Object.defineProperty(exports, "CollabController", { enumerable: true, get: function () { return collab_controller_1.CollabController; } });
var collab_mapper_1 = require("./api/mappers/collab.mapper");
Object.defineProperty(exports, "CollabMapper", { enumerable: true, get: function () { return collab_mapper_1.CollabMapper; } });
__exportStar(require("./api/dto/collab.dto"), exports);
var collab_management_service_1 = require("./application/services/collab-management.service");
Object.defineProperty(exports, "CollabManagementService", { enumerable: true, get: function () { return collab_management_service_1.CollabManagementService; } });
var collab_entity_1 = require("./domain/entities/collab.entity");
Object.defineProperty(exports, "CollabEntity", { enumerable: true, get: function () { return collab_entity_1.CollabEntity; } });
Object.defineProperty(exports, "CollabParticipant", { enumerable: true, get: function () { return collab_entity_1.CollabParticipant; } });
Object.defineProperty(exports, "CollabCoordinationStrategy", { enumerable: true, get: function () { return collab_entity_1.CollabCoordinationStrategy; } });
var collab_coordination_service_1 = require("./domain/services/collab-coordination.service");
Object.defineProperty(exports, "CollabCoordinationService", { enumerable: true, get: function () { return collab_coordination_service_1.CollabCoordinationService; } });
var collab_repository_impl_1 = require("./infrastructure/repositories/collab.repository.impl");
Object.defineProperty(exports, "CollabRepositoryImpl", { enumerable: true, get: function () { return collab_repository_impl_1.CollabRepositoryImpl; } });
var collab_module_adapter_1 = require("./infrastructure/adapters/collab-module.adapter");
Object.defineProperty(exports, "CollabModuleAdapter", { enumerable: true, get: function () { return collab_module_adapter_1.CollabModuleAdapter; } });
var collab_protocol_1 = require("./infrastructure/protocols/collab.protocol");
Object.defineProperty(exports, "CollabProtocol", { enumerable: true, get: function () { return collab_protocol_1.CollabProtocol; } });
var collab_protocol_factory_1 = require("./infrastructure/factories/collab-protocol.factory");
Object.defineProperty(exports, "CollabProtocolFactory", { enumerable: true, get: function () { return collab_protocol_factory_1.CollabProtocolFactory; } });
var module_2 = require("./module");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(module_2).default; } });
