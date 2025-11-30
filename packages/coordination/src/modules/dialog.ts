import type { Dialog } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface DialogModuleInput {
    sessionId: string;
    message: string;
}

export interface DialogModuleOutput {
    dialog: Dialog;
}

export type DialogModuleHandler = ModuleHandler<DialogModuleInput, DialogModuleOutput>;
