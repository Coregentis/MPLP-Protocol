"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfirm = createConfirm;
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const core_1 = require("@mplp/core");
const uuid_1 = require("uuid");
function createConfirm(plan, options) {
    const confirm = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        confirm_id: (0, uuid_1.v4)(),
        target_type: "plan",
        target_id: plan.plan_id,
        status: options.status,
        requested_by_role: options.requestedByRole || "system",
        requested_at: new Date().toISOString(),
        ...(options.reason && { reason: options.reason })
    };
    const validation = (0, core_1.validateConfirm)(confirm);
    if (!validation.ok) {
        throw new Error(`Invalid Confirm generated: ${JSON.stringify(validation.errors)}`);
    }
    return confirm;
}
