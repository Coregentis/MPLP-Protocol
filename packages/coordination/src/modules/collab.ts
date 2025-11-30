import type { Collab } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface CollabModuleInput {
    sessionId: string;
    participants: string[];
}

export interface CollabModuleOutput {
    collab: Collab;
}

export type CollabModuleHandler = ModuleHandler<CollabModuleInput, CollabModuleOutput>;
