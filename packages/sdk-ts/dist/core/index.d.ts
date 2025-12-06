/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
export * from './validators';
export interface Context {
    context_id: string;
    [key: string]: any;
}
export interface Plan {
    plan_id: string;
    context_id: string;
    steps: any[];
    [key: string]: any;
}
export interface Confirm {
    confirm_id: string;
    target_id: string;
    target_type: string;
    status: string;
    [key: string]: any;
}
export interface Trace {
    trace_id: string;
    context_id: string;
    plan_id: string;
    [key: string]: any;
}
