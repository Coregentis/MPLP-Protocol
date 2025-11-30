import type { Network } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface NetworkModuleInput {
    target: string;
    payload: unknown;
}

export interface NetworkModuleOutput {
    network: Network;
}

export type NetworkModuleHandler = ModuleHandler<NetworkModuleInput, NetworkModuleOutput>;
