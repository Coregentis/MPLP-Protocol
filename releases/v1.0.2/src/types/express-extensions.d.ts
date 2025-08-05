/**
 * Express类型扩展
 * 
 * 扩展Express类型定义，确保与项目需求兼容
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions?: string[];
      };
      session?: Record<string, any>;
      context?: {
        requestId: string;
        traceId: string;
        userId?: string;
      };
    }

    interface Response {
      locals: {
        traceAdapter?: any;
        requestId?: string;
        startTime?: number;
      };
    }
  }
}

// 认证请求接口
export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    role: string;
    permissions?: string[];
  };
  body: any;
  params: any;
  query: any;
}

// API响应接口
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// 分页响应接口
export interface PaginatedAPIResponse<T = any> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
