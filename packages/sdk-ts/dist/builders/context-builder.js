"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const core_1 = require("@mplp/core");
const uuid_1 = require("uuid");
function createContext(options) {
    const context = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        context_id: (0, uuid_1.v4)(),
        root: options.root,
        title: options.title,
        status: "active",
        ...(options.summary && { summary: options.summary }),
        ...(options.tags && { tags: options.tags }),
        ...(options.language && { language: options.language }),
        ...(options.owner_role && { owner_role: options.owner_role }),
        ...(options.constraints && { constraints: options.constraints }),
        ...options.metadata
    };
    const validation = (0, core_1.validateContext)(context);
    if (!validation.ok) {
        throw new Error(`Invalid Context generated: ${JSON.stringify(validation.errors)}`);
    }
    return context;
}
