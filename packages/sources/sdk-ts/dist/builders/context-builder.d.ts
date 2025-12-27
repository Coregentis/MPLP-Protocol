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
import { Context } from "@mplp/core";
export interface CreateContextOptions {
    title: string;
    root: {
        domain: string;
        environment: string;
        entry_point?: string;
    };
    summary?: string;
    tags?: string[];
    language?: string;
    owner_role?: string;
    constraints?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare function createContext(options: CreateContextOptions): Context;
