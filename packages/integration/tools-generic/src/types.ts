export interface ToolInvocation {
    toolName: string;
    payload: unknown;
}

export interface ToolInvocationResult {
    toolName: string;
    success: boolean;
    output?: unknown;
    errorMessage?: string;
}

export interface ToolExecutor {
    invoke(
        invocation: ToolInvocation
    ): Promise<ToolInvocationResult>;
}
