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
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
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
