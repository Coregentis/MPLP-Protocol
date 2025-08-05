/**
 * Mock Schema Validator for Testing
 * 
 * 提供测试用的模拟Schema验证器
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export class MockSchemaValidator {
  private shouldFail = false;
  private validationCount = 0;

  validate(data: any, schema?: any): ValidationResult {
    this.validationCount++;
    
    if (this.shouldFail) {
      return {
        valid: false,
        errors: ['Mock validation error']
      };
    }

    return {
      valid: true
    };
  }

  validateSchema(schema: any): ValidationResult {
    this.validationCount++;
    
    if (this.shouldFail) {
      return {
        valid: false,
        errors: ['Mock schema validation error']
      };
    }

    return {
      valid: true
    };
  }

  // 测试辅助方法
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  getValidationCount(): number {
    return this.validationCount;
  }

  reset(): void {
    this.shouldFail = false;
    this.validationCount = 0;
  }
}
