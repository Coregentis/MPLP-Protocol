#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class SchemaValidator {
    ajv;
    schemasDir;
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true, verbose: true, strict: false });
        (0, ajv_formats_1.default)(this.ajv);
        this.schemasDir = path.join(process.cwd(), 'src/schemas');
    }
    async checkSyntax() {
        console.log('🔍 检查Schema语法...');
        const schemaFiles = await this.getSchemaFiles();
        const results = [];
        for (const file of schemaFiles) {
            const result = await this.validateSyntax(file);
            results.push(result);
            if (result.valid) {
                console.log(`✅ ${path.basename(file)} - 语法正确`);
            }
            else {
                console.log(`❌ ${path.basename(file)} - 语法错误:`);
                result.errors.forEach(error => console.log(`   ${error}`));
            }
        }
        return this.createSummary(results);
    }
    async checkCompatibility() {
        console.log('🔍 检查Schema兼容性...');
        const schemaFiles = await this.getSchemaFiles();
        const results = [];
        for (const file of schemaFiles) {
            const result = await this.validateCompatibility(file);
            results.push(result);
        }
        return this.createSummary(results);
    }
    async checkEnterprise() {
        console.log('🔍 企业级Schema验证...');
        const schemaFiles = await this.getSchemaFiles();
        const results = [];
        for (const file of schemaFiles) {
            const result = await this.validateEnterprise(file);
            results.push(result);
        }
        return this.createSummary(results);
    }
    async getSchemaFiles() {
        if (!fs.existsSync(this.schemasDir)) {
            console.warn(`⚠️ Schema目录不存在: ${this.schemasDir}`);
            return [];
        }
        const pattern = path.join(this.schemasDir, '**/mplp-*.json').replace(/\\/g, '/');
        console.log(`🔍 使用模式: ${pattern}`);
        const files = await (0, glob_1.glob)(pattern);
        console.log(`🔍 找到 ${files.length} 个Schema文件:`);
        files.forEach(file => console.log(`  - ${path.relative(process.cwd(), file)}`));
        return files;
    }
    async validateSyntax(file) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            file
        };
        try {
            const content = fs.readFileSync(file, 'utf8');
            const schema = JSON.parse(content);
            this.ajv.compile(schema);
            if (!schema.$schema) {
                result.warnings.push('缺少$schema字段');
            }
            if (!schema.title) {
                result.warnings.push('缺少title字段');
            }
            if (!schema.description) {
                result.warnings.push('缺少description字段');
            }
        }
        catch (error) {
            result.valid = false;
            result.errors.push(`解析错误: ${error instanceof Error ? error.message : String(error)}`);
        }
        return result;
    }
    async validateCompatibility(file) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            file
        };
        try {
            const content = fs.readFileSync(file, 'utf8');
            const schema = JSON.parse(content);
            if (schema.$schema && !schema.$schema.includes('draft-07')) {
                result.warnings.push('建议使用JSON Schema Draft-07');
            }
            const fileName = path.basename(file, '.json');
            if (!fileName.startsWith('mplp-')) {
                result.errors.push('Schema文件名应以mplp-开头');
                result.valid = false;
            }
        }
        catch (error) {
            result.valid = false;
            result.errors.push(`兼容性检查失败: ${error instanceof Error ? error.message : String(error)}`);
        }
        return result;
    }
    async validateEnterprise(file) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            file
        };
        try {
            const content = fs.readFileSync(file, 'utf8');
            const schema = JSON.parse(content);
            if (!schema.examples) {
                result.warnings.push('建议提供examples字段');
            }
            this.checkNamingConvention(schema, result);
        }
        catch (error) {
            result.valid = false;
            result.errors.push(`企业级验证失败: ${error instanceof Error ? error.message : String(error)}`);
        }
        return result;
    }
    checkNamingConvention(obj, result, path = '') {
        if (typeof obj !== 'object' || obj === null)
            return;
        const objRecord = obj;
        if (objRecord.properties && typeof objRecord.properties === 'object') {
            for (const [key, value] of Object.entries(objRecord.properties)) {
                const currentPath = path ? `${path}.${key}` : key;
                if (!/^[a-z][a-z0-9_]*$/.test(key)) {
                    result.warnings.push(`字段 ${currentPath} 应使用snake_case命名`);
                }
                this.checkNamingConvention(value, result, currentPath);
            }
        }
    }
    createSummary(results) {
        const validFiles = results.filter(r => r.valid).length;
        return {
            totalFiles: results.length,
            validFiles,
            invalidFiles: results.length - validFiles,
            results
        };
    }
}
async function main() {
    const command = process.argv[2] || 'check-syntax';
    const validator = new SchemaValidator();
    let summary;
    try {
        switch (command) {
            case 'check-syntax':
                summary = await validator.checkSyntax();
                break;
            case 'check-compatibility':
                summary = await validator.checkCompatibility();
                break;
            case 'check-enterprise':
                summary = await validator.checkEnterprise();
                break;
            default:
                console.error(`未知命令: ${command}`);
                process.exit(1);
        }
        console.log('\n📊 验证摘要:');
        console.log(`总文件数: ${summary.totalFiles}`);
        console.log(`有效文件: ${summary.validFiles}`);
        console.log(`无效文件: ${summary.invalidFiles}`);
        if (summary.invalidFiles > 0) {
            console.log('\n❌ 验证失败');
            process.exit(1);
        }
        else {
            console.log('\n✅ 所有Schema验证通过');
            process.exit(0);
        }
    }
    catch (error) {
        console.error('验证过程中发生错误:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
