/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
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
