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
