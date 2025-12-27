"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFsStorage = void 0;
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
const fs_1 = require("fs");
const path_1 = require("path");
class JsonFsStorage {
    constructor(config) {
        this.config = config;
    }
    filePath(key) {
        return (0, path_1.join)(this.config.baseDir, `${key}.json`);
    }
    async write(key, value) {
        const path = this.filePath(key);
        await fs_1.promises.mkdir(this.config.baseDir, { recursive: true });
        await fs_1.promises.writeFile(path, JSON.stringify(value, null, 2), "utf8");
    }
    async read(key) {
        const path = this.filePath(key);
        try {
            const content = await fs_1.promises.readFile(path, "utf8");
            return JSON.parse(content);
        }
        catch (err) {
            if (err.code === "ENOENT")
                return null;
            throw err;
        }
    }
}
exports.JsonFsStorage = JsonFsStorage;
