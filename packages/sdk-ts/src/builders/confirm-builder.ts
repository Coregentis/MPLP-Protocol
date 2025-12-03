/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { Confirm, Plan, validateConfirm } from "@mplp/core";
import { v4 as uuidv4 } from "uuid";

export interface CreateConfirmOptions {
    status: "approved" | "rejected" | "pending" | "cancelled";
    requestedByRole?: string;
    reason?: string;
}

export function createConfirm(plan: Plan, options: CreateConfirmOptions): Confirm {
    const confirm: Confirm = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        confirm_id: uuidv4(),
        target_type: "plan",
        target_id: plan.plan_id,
        status: options.status,
        requested_by_role: options.requestedByRole || "system",
        requested_at: new Date().toISOString(),
        ...(options.reason && { reason: options.reason })
    };

    const validation = validateConfirm(confirm);
    if (!validation.ok) {
        throw new Error(`Invalid Confirm generated: ${JSON.stringify(validation.errors)}`);
    }

    return confirm;
}
