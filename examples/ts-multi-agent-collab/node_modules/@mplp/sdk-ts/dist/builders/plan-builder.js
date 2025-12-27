"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlan = createPlan;
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const core_1 = require("@mplp/core");
const uuid_1 = require("uuid");
function createPlan(context, options) {
    const plan = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        plan_id: (0, uuid_1.v4)(),
        context_id: context.context_id,
        title: options.title,
        objective: options.objective,
        status: "draft",
        steps: options.steps.map(step => ({
            step_id: (0, uuid_1.v4)(),
            description: step.description,
            status: "pending",
        }))
    };
    const validation = (0, core_1.validatePlan)(plan);
    if (!validation.ok) {
        throw new Error(`Invalid Plan generated: ${JSON.stringify(validation.errors)}`);
    }
    return plan;
}
