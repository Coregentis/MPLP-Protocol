/**
 * © 2025 邦士（北京）网络科技有限公司
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
