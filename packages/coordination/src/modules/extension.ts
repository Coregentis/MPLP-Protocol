import type { Extension } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface ExtensionModuleInput {
    extensionId: string;
    config?: Record<string, unknown>;
}

export interface ExtensionModuleOutput {
    extension: Extension;
}

export type ExtensionModuleHandler = ModuleHandler<ExtensionModuleInput, ExtensionModuleOutput>;
