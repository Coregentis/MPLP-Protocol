"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlan = createPlan;
/**
 * © 2025 邦士（北京）网络科技有限公司
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
            // Optional fields if supported by schema, but keeping it minimal for now
            // toolName and parameters might need to go into specific step structure if schema supports it
            // checking schema... PlanStepCore has step_id, description, status.
            // If we want tool info, it might be in description or we need to check if schema allows extra props or specific step types.
            // For now, let's stick to core fields.
        }))
    };
    const validation = (0, core_1.validatePlan)(plan);
    if (!validation.ok) {
        throw new Error(`Invalid Plan generated: ${JSON.stringify(validation.errors)}`);
    }
    return plan;
}
