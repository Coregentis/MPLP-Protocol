/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { Dialog } from "@mplp/core";
import type { ModuleHandler } from "./index";

export interface DialogModuleInput {
    sessionId: string;
    message: string;
}

export interface DialogModuleOutput {
    dialog: Dialog;
}

export type DialogModuleHandler = ModuleHandler<DialogModuleInput, DialogModuleOutput>;
