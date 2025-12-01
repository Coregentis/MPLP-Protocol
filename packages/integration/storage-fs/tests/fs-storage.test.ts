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

import { describe, it, expect, afterEach } from "vitest";
import { JsonFsStorage } from "../src/fs-storage";
import { promises as fs } from "fs";
import { join } from "path";

const TEST_DIR = join(__dirname, "tmp_test_storage");

describe("JsonFsStorage", () => {
    afterEach(async () => {
        try {
            await fs.rm(TEST_DIR, { recursive: true, force: true });
        } catch { }
    });

    it("should write and read JSON", async () => {
        const storage = new JsonFsStorage({ baseDir: TEST_DIR });
        const data = { foo: "bar", num: 123 };

        await storage.write("test-key", data);
        const readBack = await storage.read("test-key");

        expect(readBack).toEqual(data);
    });

    it("should return null for missing key", async () => {
        const storage = new JsonFsStorage({ baseDir: TEST_DIR });
        const result = await storage.read("missing-key");
        expect(result).toBeNull();
    });
});
