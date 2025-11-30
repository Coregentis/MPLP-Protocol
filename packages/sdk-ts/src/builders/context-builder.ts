import { Context, validateContext } from "@mplp/core-protocol";
import { v4 as uuidv4 } from "uuid";

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

export function createContext(options: CreateContextOptions): Context {
    const context: Context = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        context_id: uuidv4(),
        root: options.root,
        title: options.title,
        status: "active",
        ...(options.summary && { summary: options.summary }),
        ...(options.tags && { tags: options.tags }),
        ...(options.language && { language: options.language }),
        ...(options.owner_role && { owner_role: options.owner_role }),
        ...(options.constraints && { constraints: options.constraints }),
        ...options.metadata
    };

    const validation = validateContext(context);
    if (!validation.ok) {
        throw new Error(`Invalid Context generated: ${JSON.stringify(validation.errors)}`);
    }

    return context;
}
