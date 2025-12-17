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

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = readdirSync(dirPath);

    files.forEach(function (file) {
        if (statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith(".schema.json")) {
                arrayOfFiles.push(join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

function validateAll() {
    const schemasDir = join(__dirname, "../schemas/v2");
    const files = getAllFiles(schemasDir);

    console.log(`Found ${files.length} schema files.`);

    let hasError = false;
    const schemas: { file: string; schema: any }[] = [];

    // First pass: Load all schemas
    for (const file of files) {
        try {
            const content = readFileSync(file, "utf8");
            const schema = JSON.parse(content);
            schemas.push({ file, schema });
        } catch (err) {
            console.error("Error reading/parsing", file);
            console.error(err);
            hasError = true;
        }
    }

    // Add all schemas to Ajv
    try {
        schemas.forEach(s => {
            if (s.schema.$id) {
                // Check if schema with this ID already exists to avoid error
                if (!ajv.getSchema(s.schema.$id)) {
                    ajv.addSchema(s.schema);
                }
            }
        });
    } catch (err) {
        console.error("Error adding schemas to Ajv:");
        console.error(err);
        hasError = true;
    }

    // Second pass: Validate each schema
    for (const { file, schema } of schemas) {
        try {
            ajv.compile(schema);
            console.log("OK:", file);
        } catch (err: any) {
            console.error("Schema error in", file);
            console.error(err.message);
            if (err.errors) console.error(err.errors);
            hasError = true;
            process.exit(1); // Exit on first error to debug
        }
    }

    if (hasError) {
        process.exit(1);
    }
}

validateAll();
