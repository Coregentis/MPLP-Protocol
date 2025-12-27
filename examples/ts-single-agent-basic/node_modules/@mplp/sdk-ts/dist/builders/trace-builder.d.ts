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
import { Trace, Context, Plan } from "@mplp/core";
export interface AppendTraceOptions {
    status: "completed" | "failed" | "running";
    spans?: Array<{
        name: string;
        status: "completed" | "failed";
    }>;
}
export declare function appendTrace(context: Context, plan: Plan, options: AppendTraceOptions): Trace;
