/**
 * © 2025 邦士（北京）网络科技有限公司
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
