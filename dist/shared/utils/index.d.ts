/**
 * MPLP共享工具函数
 *
 * @description 所有模块共享的工具函数和辅助方法
 * @version 1.0.0
 * @architecture 支持L1-L3分层架构的统一工具库
 */
import { UUID, Timestamp, Version } from '../types';
/**
 * 生成UUID v4
 */
export declare function generateUUID(): UUID;
/**
 * 验证UUID格式
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * 获取当前ISO 8601时间戳
 */
export declare function getCurrentTimestamp(): Timestamp;
/**
 * 解析时间戳
 */
export declare function parseTimestamp(timestamp: Timestamp): Date;
/**
 * 格式化时间戳
 */
export declare function formatTimestamp(timestamp: Timestamp, format?: 'date' | 'time' | 'datetime'): string;
/**
 * 计算时间差（毫秒）
 */
export declare function getTimeDifference(start: Timestamp, end: Timestamp): number;
/**
 * 验证语义化版本号
 */
export declare function isValidVersion(version: string): boolean;
/**
 * 比较版本号
 */
export declare function compareVersions(version1: Version, version2: Version): number;
/**
 * 深度克隆对象
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 深度合并对象
 */
export declare function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T;
/**
 * 检查是否为对象
 */
export declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * 获取对象深度路径的值
 */
export declare function getNestedValue(obj: Record<string, unknown>, path: string): unknown;
/**
 * 设置对象深度路径的值
 */
export declare function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void;
/**
 * 转换为camelCase
 */
export declare function toCamelCase(str: string): string;
/**
 * 转换为snake_case
 */
export declare function toSnakeCase(str: string): string;
/**
 * 首字母大写
 */
export declare function capitalize(str: string): string;
/**
 * 生成随机字符串
 */
export declare function generateRandomString(length?: number): string;
/**
 * 数组去重
 */
export declare function unique<T>(array: T[]): T[];
/**
 * 数组分组
 */
export declare function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]>;
/**
 * 数组分页
 */
export declare function paginate<T>(array: T[], page: number, limit: number): {
    data: T[];
    total: number;
    totalPages: number;
};
/**
 * 验证邮箱格式
 */
export declare function isValidEmail(email: string): boolean;
/**
 * 验证URL格式
 */
export declare function isValidUrl(url: string): boolean;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 重试函数
 */
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map