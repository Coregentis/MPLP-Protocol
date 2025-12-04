/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleHandler = getModuleHandler;
function getModuleHandler(registry, moduleName) {
    switch (moduleName) {
        case "context":
            return registry.context;
        case "plan":
            return registry.plan;
        case "confirm":
            return registry.confirm;
        case "trace":
            return registry.trace;
        case "role":
            return registry.role;
        case "extension":
            return registry.extension;
        case "dialog":
            return registry.dialog;
        case "collab":
            return registry.collab;
        case "core":
            return registry.core;
        case "network":
            return registry.network;
        default:
            return undefined;
    }
}
