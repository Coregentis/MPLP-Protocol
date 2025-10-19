"use strict";
/**
 * MPLP协议版本管理器
 *
 * @description L3层统一版本管理，提供协议版本控制和兼容性检查
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPProtocolVersionManager = void 0;
/**
 * MPLP协议版本管理器
 *
 * @description 统一的版本管理实现，等待CoreOrchestrator激活
 */
class MLPPProtocolVersionManager {
    constructor() {
        this.currentVersion = '1.0.0';
        this.supportedVersions = [
            {
                version: '1.0.0',
                releaseDate: '2025-08-25',
                features: [
                    'L1-L3分层架构',
                    '10个L2协调层模块',
                    '9个横切关注点管理器',
                    'Schema驱动开发',
                    '双重命名约定',
                    '预留接口模式',
                    'CoreOrchestrator中心化协调'
                ]
            }
        ];
    }
    /**
     * 获取当前协议版本
     */
    getCurrentVersion() {
        return this.currentVersion;
    }
    /**
     * 获取支持的版本列表
     */
    getSupportedVersions() {
        return this.supportedVersions;
    }
    /**
     * 检查版本兼容性
     */
    checkCompatibility(_requestedVersion) {
        // TODO: 等待CoreOrchestrator激活 - 实现版本兼容性检查逻辑
        const result = {
            compatible: false,
            warnings: [],
            errors: [],
            recommendations: []
        };
        if (_requestedVersion === this.currentVersion) {
            result.compatible = true;
            return result;
        }
        // 检查是否为支持的版本
        const supportedVersion = this.supportedVersions.find(v => v.version === _requestedVersion);
        if (!supportedVersion) {
            result.errors.push(`Unsupported version: ${_requestedVersion}`);
            result.recommendations.push(`Please use version ${this.currentVersion}`);
            return result;
        }
        // 版本比较逻辑
        const [reqMajor, reqMinor, reqPatch] = _requestedVersion.split('.').map(Number);
        const [curMajor, curMinor, curPatch] = this.currentVersion.split('.').map(Number);
        if (reqMajor < curMajor) {
            result.warnings.push(`Requested version ${_requestedVersion} is older than current ${this.currentVersion}`);
            result.compatible = true; // 向后兼容
        }
        else if (reqMajor > curMajor) {
            result.errors.push(`Requested version ${_requestedVersion} is newer than supported ${this.currentVersion}`);
        }
        else {
            // 同一主版本
            result.compatible = true;
            if (reqMinor < curMinor || (reqMinor === curMinor && reqPatch < curPatch)) {
                result.warnings.push(`Using older version ${_requestedVersion}, consider upgrading to ${this.currentVersion}`);
            }
        }
        return result;
    }
    /**
     * 验证协议版本格式
     */
    validateVersionFormat(_version) {
        const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
        return semverRegex.test(_version);
    }
    /**
     * 获取版本信息
     */
    getVersionInfo(_version) {
        return this.supportedVersions.find(v => v.version === _version) || null;
    }
    /**
     * 注册新版本
     */
    registerVersion(_versionInfo) {
        // TODO: 等待CoreOrchestrator激活 - 实现版本注册逻辑
        if (!this.validateVersionFormat(_versionInfo.version)) {
            return false;
        }
        const existingIndex = this.supportedVersions.findIndex(v => v.version === _versionInfo.version);
        if (existingIndex >= 0) {
            this.supportedVersions[existingIndex] = _versionInfo;
        }
        else {
            this.supportedVersions.push(_versionInfo);
        }
        return true;
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        return this.validateVersionFormat(this.currentVersion);
    }
}
exports.MLPPProtocolVersionManager = MLPPProtocolVersionManager;
//# sourceMappingURL=protocol-version-manager.js.map