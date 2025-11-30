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
