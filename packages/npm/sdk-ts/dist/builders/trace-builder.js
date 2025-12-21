"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendTrace = appendTrace;
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const core_1 = require("@mplp/core");
const uuid_1 = require("uuid");
function appendTrace(context, plan, options) {
    const traceId = (0, uuid_1.v4)();
    const rootSpanId = (0, uuid_1.v4)();
    const trace = {
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
    const validation = (0, core_1.validateTrace)(trace);
    if (!validation.ok) {
        throw new Error(`Invalid Trace generated: ${JSON.stringify(validation.errors)}`);
    }
    return trace;
}
