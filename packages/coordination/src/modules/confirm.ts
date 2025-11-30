import type { Confirm } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface ConfirmModuleInput {
    planId: string;
    risks?: string[];
}

export interface ConfirmModuleOutput {
    confirm: Confirm;
}

export type ConfirmModuleHandler = ModuleHandler<ConfirmModuleInput, ConfirmModuleOutput>;
