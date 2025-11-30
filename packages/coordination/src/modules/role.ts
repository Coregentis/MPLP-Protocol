import type { Role } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface RoleModuleInput {
    name: string;
    capabilities?: string[];
}

export interface RoleModuleOutput {
    role: Role;
}

export type RoleModuleHandler = ModuleHandler<RoleModuleInput, RoleModuleOutput>;
