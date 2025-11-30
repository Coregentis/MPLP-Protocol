import { Trace, Context, Plan, validateTrace } from "@mplp/core-protocol";
import { v4 as uuidv4 } from "uuid";

export interface AppendTraceOptions {
    status: "completed" | "failed" | "running";
    spans?: Array<{
        name: string;
        status: "completed" | "failed";
    }>;
}

export function appendTrace(context: Context, plan: Plan, options: AppendTraceOptions): Trace {
    const traceId = uuidv4();
    const rootSpanId = uuidv4();

    const trace: Trace = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        trace_id: traceId,
        context_id: context.context_id,
        plan_id: plan.plan_id,
        status: options.status,
        root_span: {
            trace_id: traceId,
            span_id: rootSpanId,
            context_id: context.context_id
        }
    };

    // Note: The current Trace schema is quite minimal. 
    // If we want to add child spans, we would need a more complex builder that constructs the tree.
    // For this basic builder, we just create the root trace object.

    const validation = validateTrace(trace);
    if (!validation.ok) {
        throw new Error(`Invalid Trace generated: ${JSON.stringify(validation.errors)}`);
    }

    return trace;
}
