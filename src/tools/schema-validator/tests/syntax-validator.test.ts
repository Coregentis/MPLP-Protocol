/**
 * MPLP Schema Syntax Validator Tests
 * 
 * @description 语法验证器测试套件
 * @version 1.0.0
 * @standardized MPLP协议验证工具标准化规范 v1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MplpSyntaxValidator } from '../core/syntax-validator';
import { ValidationResult } from '../types';

describe('MplpSyntaxValidator', () => {
  let validator: MplpSyntaxValidator;
  let tempDir: string;

  beforeEach(async () => {
    // 创建临时测试目录
    tempDir = path.join(__dirname, 'temp-schemas');
    await fs.mkdir(tempDir, { recursive: true });
    validator = new MplpSyntaxValidator(tempDir);
  });

  afterEach(async () => {
    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('validateSchemaContent', () => {
    it('应该验证有效的Schema内容', async () => {
      const validSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema for validation",
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "uuid": {
            "type": "string",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
          }
        },
        "properties": {
          "test_id": { "$ref": "#/$defs/uuid" },
          "test_name": { "type": "string" }
        }
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(validSchema, null, 2),
        'test-schema'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.validatorVersion).toBe('1.0.0');
    });

    it('应该检测JSON语法错误', async () => {
      const invalidJson = '{ "invalid": json }';

      const result = await validator.validateSchemaContent(invalidJson, 'invalid-schema');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorCode).toBe('JSON_SYNTAX_ERROR');
      expect(result.errors[0].errorType).toBe('syntax');
    });

    it('应该检测缺失的必需字段', async () => {
      const incompleteSchema = {
        "type": "object"
        // 缺少 $schema, $id, title, description, version
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(incompleteSchema),
        'incomplete-schema'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const missingFields = result.errors.filter(e => e.errorCode === 'SCHEMA_STRUCTURE_ERROR');
      expect(missingFields.length).toBeGreaterThan(0);
    });

    it('应该检测错误的$schema值', async () => {
      const wrongSchemaVersion = {
        "$schema": "http://json-schema.org/draft-04/schema#", // 错误版本
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema",
        "version": "1.0.0",
        "type": "object"
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(wrongSchemaVersion),
        'wrong-schema-version'
      );

      expect(result.isValid).toBe(false);
      const schemaErrors = result.errors.filter(e => 
        e.location.jsonPath === '$schema' && e.errorCode === 'SCHEMA_STRUCTURE_ERROR'
      );
      expect(schemaErrors.length).toBeGreaterThan(0);
    });

    it('应该检测错误的$id格式', async () => {
      const wrongIdFormat = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://example.com/wrong-format.json", // 错误格式
        "title": "Test Schema",
        "description": "A test schema",
        "version": "1.0.0",
        "type": "object"
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(wrongIdFormat),
        'wrong-id-format'
      );

      expect(result.isValid).toBe(false);
      const idErrors = result.errors.filter(e => 
        e.location.jsonPath === '$id' && e.errorCode === 'SCHEMA_STRUCTURE_ERROR'
      );
      expect(idErrors.length).toBeGreaterThan(0);
    });

    it('应该检测camelCase字段命名并发出警告', async () => {
      const camelCaseSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema",
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "uuid": {
            "type": "string",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
          }
        },
        "properties": {
          "testId": { "$ref": "#/$defs/uuid" }, // camelCase - 应该警告
          "test_name": { "type": "string" } // snake_case - 正确
        }
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(camelCaseSchema),
        'camelcase-schema'
      );

      expect(result.isValid).toBe(true); // 警告不影响有效性
      expect(result.warnings.length).toBeGreaterThan(0);
      
      const namingWarnings = result.warnings.filter(w => 
        w.warningCode === 'NAMING_CONVENTION_WARNING'
      );
      expect(namingWarnings.length).toBeGreaterThan(0);
    });

    it('应该检测缺失的$defs并报错', async () => {
      const noDefs = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema",
        "version": "1.0.0",
        "type": "object"
        // 缺少 $defs
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(noDefs),
        'no-defs-schema'
      );

      expect(result.isValid).toBe(false);
      const defsErrors = result.errors.filter(e => 
        e.location.jsonPath === '$defs' && e.errorCode === 'MPLP_RULE_ERROR'
      );
      expect(defsErrors.length).toBeGreaterThan(0);
    });

    it('应该检测缺失的uuid定义并报错', async () => {
      const noUuidDef = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema",
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "other_type": { "type": "string" }
          // 缺少 uuid 定义
        }
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(noUuidDef),
        'no-uuid-def-schema'
      );

      expect(result.isValid).toBe(false);
      const uuidErrors = result.errors.filter(e => 
        e.location.jsonPath === '$defs.uuid' && e.errorCode === 'MPLP_RULE_ERROR'
      );
      expect(uuidErrors.length).toBeGreaterThan(0);
    });

    it('应该对缺失描述发出警告', async () => {
      const noDescription = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        // 缺少 description
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "uuid": {
            "type": "string",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
          }
        }
      };

      const result = await validator.validateSchemaContent(
        JSON.stringify(noDescription),
        'no-description-schema'
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      const descriptionWarnings = result.warnings.filter(w => 
        w.location.jsonPath === 'description' && w.warningCode === 'BEST_PRACTICE_WARNING'
      );
      expect(descriptionWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateSchema', () => {
    it('应该验证存在的Schema文件', async () => {
      const validSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/test-schema.json",
        "title": "Test Schema",
        "description": "A test schema for validation",
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "uuid": {
            "type": "string",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
          }
        }
      };

      const schemaPath = path.join(tempDir, 'mplp-test.json');
      await fs.writeFile(schemaPath, JSON.stringify(validSchema, null, 2));

      const result = await validator.validateSchema(schemaPath);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该处理不存在的文件', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.json');

      const result = await validator.validateSchema(nonExistentPath);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorCode).toBe('FILE_ACCESS_ERROR');
    });
  });

  describe('validateAllSchemas', () => {
    it('应该验证目录中的所有Schema文件', async () => {
      // 创建多个测试Schema文件
      const schemas = [
        {
          name: 'mplp-test1.json',
          content: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$id": "https://mplp.dev/schemas/v1.0/test1-schema.json",
            "title": "Test1 Schema",
            "description": "First test schema",
            "version": "1.0.0",
            "type": "object",
            "$defs": { "uuid": { "type": "string", "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" } }
          }
        },
        {
          name: 'mplp-test2.json',
          content: {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$id": "https://mplp.dev/schemas/v1.0/test2-schema.json",
            "title": "Test2 Schema",
            "description": "Second test schema",
            "version": "1.0.0",
            "type": "object",
            "$defs": { "uuid": { "type": "string", "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" } }
          }
        }
      ];

      for (const schema of schemas) {
        const schemaPath = path.join(tempDir, schema.name);
        await fs.writeFile(schemaPath, JSON.stringify(schema.content, null, 2));
      }

      const results = await validator.validateAllSchemas();

      expect(results).toHaveLength(2);
      expect(results.every(r => r.isValid)).toBe(true);
    });

    it('应该处理空目录', async () => {
      const results = await validator.validateAllSchemas();

      expect(results).toHaveLength(0);
    });

    it('应该处理不存在的目录', async () => {
      const nonExistentValidator = new MplpSyntaxValidator('/non/existent/path');
      
      const results = await nonExistentValidator.validateAllSchemas();

      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors[0].errorCode).toBe('DIRECTORY_ACCESS_ERROR');
    });
  });

  describe('错误ID生成', () => {
    it('应该生成唯一的错误ID', async () => {
      const invalidJson1 = '{ invalid1 }';
      const invalidJson2 = '{ invalid2 }';

      const result1 = await validator.validateSchemaContent(invalidJson1, 'test1');
      const result2 = await validator.validateSchemaContent(invalidJson2, 'test2');

      expect(result1.errors[0].errorId).toBeDefined();
      expect(result2.errors[0].errorId).toBeDefined();
      expect(result1.errors[0].errorId).not.toBe(result2.errors[0].errorId);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成验证', async () => {
      const largeSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://mplp.dev/schemas/v1.0/large-schema.json",
        "title": "Large Schema",
        "description": "A large schema for performance testing",
        "version": "1.0.0",
        "type": "object",
        "$defs": {
          "uuid": {
            "type": "string",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
          }
        },
        "properties": {}
      };

      // 添加大量属性
      for (let i = 0; i < 100; i++) {
        (largeSchema.properties as any)[`field_${i}`] = { "type": "string" };
      }

      const startTime = Date.now();
      const result = await validator.validateSchemaContent(
        JSON.stringify(largeSchema),
        'large-schema'
      );
      const duration = Date.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
