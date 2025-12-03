/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { promises as fs } from "fs";
import { join } from "path";

export interface FsStorageConfig {
    baseDir: string;
}

export class JsonFsStorage {
    constructor(private readonly config: FsStorageConfig) { }

    private filePath(key: string): string {
        return join(this.config.baseDir, `${key}.json`);
    }

    async write<T>(key: string, value: T): Promise<void> {
        const path = this.filePath(key);
        await fs.mkdir(this.config.baseDir, { recursive: true });
        await fs.writeFile(path, JSON.stringify(value, null, 2), "utf8");
    }

    async read<T>(key: string): Promise<T | null> {
        const path = this.filePath(key);
        try {
            const content = await fs.readFile(path, "utf8");
            return JSON.parse(content) as T;
        } catch (err: any) {
            if (err.code === "ENOENT") return null;
            throw err;
        }
    }
}
