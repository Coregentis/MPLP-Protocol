/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2026 Bangshi Beijing Network Technology Limited Company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// @ts-nocheck
import {
    MplpRuntimeClient,
} from "@mplp/sdk-ts";

async function main() {
    console.log("Starting Single Agent Basic Example...");

    const client = new MplpRuntimeClient();
    console.log("Running flow...");

    const result = await client.runSingleAgentFlow({
        contextOptions: {
            title: "Example Context",
            root: { domain: "example", environment: "dev" }
        },
        planOptions: {
            title: "Example Plan",
            objective: "Demonstrate Single Agent Flow",
            steps: [
                { description: "Read the current protocol surface" },
                { description: "Emit a conformant trace" }
            ]
        },
        confirmOptions: {
            status: "approved"
        },
        traceOptions: {
            status: "completed"
        }
    });

    if (result.success) {
        console.log("✅ Flow succeeded!");
        console.log("Context ID:", result.output?.context?.context_id);
        console.log("Plan ID:", result.output?.plan?.plan_id);
        console.log("Confirm Status:", result.output?.confirm?.status);
        console.log("Trace ID:", result.output?.trace?.trace_id);
        console.log("Total Events:", result.context?.events?.length ?? 0);
    } else {
        console.error("❌ Flow failed:", result.error);
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
