"use strict";
/**
 * MPLP共享工具函数
 *
 * @description 所有模块共享的工具函数和辅助方法
 * @version 1.0.0
 * @architecture 支持L1-L3分层架构的统一工具库
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = generateUUID;
exports.isValidUUID = isValidUUID;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.parseTimestamp = parseTimestamp;
exports.formatTimestamp = formatTimestamp;
exports.getTimeDifference = getTimeDifference;
exports.isValidVersion = isValidVersion;
exports.compareVersions = compareVersions;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.isObject = isObject;
exports.getNestedValue = getNestedValue;
exports.setNestedValue = setNestedValue;
exports.toCamelCase = toCamelCase;
exports.toSnakeCase = toSnakeCase;
exports.capitalize = capitalize;
exports.generateRandomString = generateRandomString;
exports.unique = unique;
exports.groupBy = groupBy;
exports.paginate = paginate;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.debounce = debounce;
exports.throttle = throttle;
exports.retry = retry;
// ===== UUID工具 =====
/**
 * 生成UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * 验证UUID格式
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// ===== 时间工具 =====
/**
 * 获取当前ISO 8601时间戳
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}
/**
 * 解析时间戳
 */
function parseTimestamp(timestamp) {
    return new Date(timestamp);
}
/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp, format = 'datetime') {
    const date = parseTimestamp(timestamp);
    const isoString = date.toISOString();
    switch (format) {
        case 'date':
            return isoString.split('T')[0] || '';
        case 'time':
            return isoString.split('T')[1]?.split('.')[0] || '';
        case 'datetime':
        default:
            return isoString;
    }
}
/**
 * 计算时间差（毫秒）
 */
function getTimeDifference(start, end) {
    return parseTimestamp(end).getTime() - parseTimestamp(start).getTime();
}
// ===== 版本工具 =====
/**
 * 验证语义化版本号
 */
function isValidVersion(version) {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
}
/**
 * 比较版本号
 */
function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;
        if (v1Part > v2Part)
            return 1;
        if (v1Part < v2Part)
            return -1;
    }
    return 0;
}
// ===== 对象工具 =====
/**
 * 深度克隆对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
/**
 * 深度合并对象
 */
function deepMerge(target, source) {
    const result = deepClone(target);
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (isObject(sourceValue) && isObject(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * 检查是否为对象
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/**
 * 获取对象深度路径的值
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
}
/**
 * 设置对象深度路径的值
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey)
        return;
    const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        return current[key];
    }, obj);
    target[lastKey] = value;
}
// ===== 字符串工具 =====
/**
 * 转换为camelCase
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * 转换为snake_case
 */
function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
/**
 * 首字母大写
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * 生成随机字符串
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// ===== 数组工具 =====
/**
 * 数组去重
 */
function unique(array) {
    return Array.from(new Set(array));
}
/**
 * 数组分组
 */
function groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
        const key = keyFn(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}
/**
 * 数组分页
 */
function paginate(array, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
        data: array.slice(startIndex, endIndex),
        total: array.length,
        totalPages: Math.ceil(array.length / limit)
    };
}
// ===== 验证工具 =====
/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * 验证URL格式
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
// ===== 性能工具 =====
/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * 重试函数
 */
async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                throw lastError;
            }
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw lastError;
}
// ===== 导出所有工具 =====
// 注意：其他工具模块待实现
// export * from './validation';
// export * from './formatting';
// export * from './async-helpers';
//# sourceMappingURL=index.js.map