/**
 * Express类型修复
 * 
 * 修复Express类型与Node.js类型的冲突
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

declare module 'express-serve-static-core' {
  interface Request {
    // 移除冲突的filter属性
    filter?: any;
  }
}

// TypeORM类型定义已经正确，不需要重新声明
