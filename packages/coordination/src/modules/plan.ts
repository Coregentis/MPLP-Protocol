import type { Plan } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface PlanModuleInput {
    contextId: string;
    objective?: string;
}

export interface PlanModuleOutput {
    plan: Plan;
}

export type PlanModuleHandler = ModuleHandler<PlanModuleInput, PlanModuleOutput>;
