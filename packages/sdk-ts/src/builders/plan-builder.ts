import { Plan, Context, validatePlan } from "@mplp/core-protocol";
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
            // Optional fields if supported by schema, but keeping it minimal for now
            // toolName and parameters might need to go into specific step structure if schema supports it
            // checking schema... PlanStepCore has step_id, description, status.
            // If we want tool info, it might be in description or we need to check if schema allows extra props or specific step types.
            // For now, let's stick to core fields.
        }))
    };

    const validation = validatePlan(plan);
    if (!validation.ok) {
        throw new Error(`Invalid Plan generated: ${JSON.stringify(validation.errors)}`);
    }

    return plan;
}
