import type { RuntimeContext } from "./runtime-context";

export interface RuntimeErrorInfo {
    code: string;
    message: string;
}

export interface RuntimeResult<TOutput = unknown> {
    success: boolean;
    output?: TOutput;
    context: RuntimeContext;
    error?: RuntimeErrorInfo;
}
