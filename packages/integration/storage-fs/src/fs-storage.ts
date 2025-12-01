/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
