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
import { Plan, Context } from "@mplp/core";
export interface CreatePlanOptions {
    title: string;
    objective: string;
    steps: Array<{
        description: string;
        toolName?: string;
        parameters?: Record<string, any>;
    }>;
}
export declare function createPlan(context: Context, options: CreatePlanOptions): Plan;
