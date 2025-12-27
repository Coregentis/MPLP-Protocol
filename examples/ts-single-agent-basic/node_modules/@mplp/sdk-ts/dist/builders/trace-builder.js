"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendTrace = appendTrace;
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
    const validation = (0, core_1.validateTrace)(trace);
    if (!validation.ok) {
        throw new Error(`Invalid Trace generated: ${JSON.stringify(validation.errors)}`);
    }
    return trace;
}
