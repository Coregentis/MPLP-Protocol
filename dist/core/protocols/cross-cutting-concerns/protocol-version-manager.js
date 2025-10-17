"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPProtocolVersionManager = void 0;
class MLPPProtocolVersionManager {
    currentVersion = '1.0.0';
    supportedVersions = [
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
    getCurrentVersion() {
        return this.currentVersion;
    }
    getSupportedVersions() {
        return this.supportedVersions;
    }
    checkCompatibility(_requestedVersion) {
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
        const supportedVersion = this.supportedVersions.find(v => v.version === _requestedVersion);
        if (!supportedVersion) {
            result.errors.push(`Unsupported version: ${_requestedVersion}`);
            result.recommendations.push(`Please use version ${this.currentVersion}`);
            return result;
        }
        const [reqMajor, reqMinor, reqPatch] = _requestedVersion.split('.').map(Number);
        const [curMajor, curMinor, curPatch] = this.currentVersion.split('.').map(Number);
        if (reqMajor < curMajor) {
            result.warnings.push(`Requested version ${_requestedVersion} is older than current ${this.currentVersion}`);
            result.compatible = true;
        }
        else if (reqMajor > curMajor) {
            result.errors.push(`Requested version ${_requestedVersion} is newer than supported ${this.currentVersion}`);
        }
        else {
            result.compatible = true;
            if (reqMinor < curMinor || (reqMinor === curMinor && reqPatch < curPatch)) {
                result.warnings.push(`Using older version ${_requestedVersion}, consider upgrading to ${this.currentVersion}`);
            }
        }
        return result;
    }
    validateVersionFormat(_version) {
        const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
        return semverRegex.test(_version);
    }
    getVersionInfo(_version) {
        return this.supportedVersions.find(v => v.version === _version) || null;
    }
    registerVersion(_versionInfo) {
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
    async healthCheck() {
        return this.validateVersionFormat(this.currentVersion);
    }
}
exports.MLPPProtocolVersionManager = MLPPProtocolVersionManager;
