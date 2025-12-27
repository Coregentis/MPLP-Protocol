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
export interface RuntimeContext {
    ids: {
        runId: string;
    };
    coordination: {
        ids: {
            runId: string;
        };
        metadata: Record<string, any>;
    };
    events: any[];
}
export interface RuntimeResult {
    success?: boolean;
    output?: any;
    error?: any;
    events?: any[];
}
export interface ValueStateLayer {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}
export interface ActionExecutionLayer {
    execute(action: any): Promise<any>;
}
export declare class InMemoryVSL implements ValueStateLayer {
    private store;
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}
export declare class InMemoryAEL implements ActionExecutionLayer {
    execute(action: any): Promise<{
        status: string;
        action: any;
    }>;
}
export type RuntimeModuleRegistry = Record<string, (args: {
    ctx: any;
}) => Promise<{
    output: any;
    events: any[];
}>>;
export interface RunSingleAgentFlowOptions {
    flow: any;
    runtimeContext: RuntimeContext;
    modules: RuntimeModuleRegistry;
    vsl: ValueStateLayer;
}
export declare function runSingleAgentFlow(options: RunSingleAgentFlowOptions): Promise<RuntimeResult>;
