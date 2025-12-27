/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { ContextModuleHandler, PlanModuleHandler, ConfirmModuleHandler, TraceModuleHandler, RoleModuleHandler, ExtensionModuleHandler, DialogModuleHandler, CollabModuleHandler, CoreModuleHandler, NetworkModuleHandler } from "@mplp/coordination";
export interface RuntimeModuleRegistry {
    context?: ContextModuleHandler;
    plan?: PlanModuleHandler;
    confirm?: ConfirmModuleHandler;
    trace?: TraceModuleHandler;
    role?: RoleModuleHandler;
    extension?: ExtensionModuleHandler;
    dialog?: DialogModuleHandler;
    collab?: CollabModuleHandler;
    core?: CoreModuleHandler;
    network?: NetworkModuleHandler;
}
export declare function getModuleHandler(registry: RuntimeModuleRegistry, moduleName: string): unknown;
