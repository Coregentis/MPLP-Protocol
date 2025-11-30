// @ts-nocheck
import { SingleAgentFlowContract } from "../packages/coordination/src/flows";

function assert(cond: boolean, msg: string) {
    if (!cond) {
        console.error("❌ FAIL:", msg);
        process.exit(1);
    } else {
        console.log("✅ PASS:", msg);
    }
}

console.log("Verifying Coordination Contracts...");

assert(
    SingleAgentFlowContract.steps.length >= 3,
    "SingleAgentFlowContract should have at least 3 steps"
);

assert(
    typeof SingleAgentFlowContract.flowId === "string",
    "SingleAgentFlowContract.flowId must be a string"
);

console.log("All coordination contract checks passed.");
