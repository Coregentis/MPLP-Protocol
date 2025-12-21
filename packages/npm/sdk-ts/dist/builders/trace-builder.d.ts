/**
 * © 2025 邦士（北京）网络科技有限公司
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
