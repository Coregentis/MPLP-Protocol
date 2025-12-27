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
import { Plan, Context, validatePlan } from "@mplp/core";
import { v4 as uuidv4 } from "uuid";

export interface CreatePlanOptions {
    title: string;
    objective: string;
    steps: Array<{
        description: string;
        toolName?: string;
        parameters?: Record<string, any>;
    }>;
}

export function createPlan(context: Context, options: CreatePlanOptions): Plan {
    const plan: Plan = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        plan_id: uuidv4(),
        context_id: context.context_id,
        title: options.title,
        objective: options.objective,
        status: "draft",
        steps: options.steps.map(step => ({
            step_id: uuidv4(),
            description: step.description,
            status: "pending",
        }))
    };

    const validation = validatePlan(plan);
    if (!validation.ok) {
        throw new Error(`Invalid Plan generated: ${JSON.stringify(validation.errors)}`);
    }

    return plan;
}
