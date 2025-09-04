# Extension API 参考

**插件系统和自定义功能 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Extension%20模块-blue.svg)](../modules/extension/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--extension.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-92%2F92%20通过-green.svg)](../modules/extension/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/extension-api.md)

---

## 🎯 概述

Extension API为多智能体系统提供全面的插件系统和可扩展性功能。它支持动态加载、生命周期管理、安全隔离和自定义功能集成。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  ExtensionController,
  ExtensionManagementService,
  CreateExtensionDto,
  UpdateExtensionDto,
  ExtensionResponseDto
} from 'mplp/modules/extension';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const extensionModule = mplp.getModule('extension');
```

## 🏗️ 核心接口

### **ExtensionResponseDto** (响应接口)

```typescript
interface ExtensionResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  extensionId: string;            // 唯一扩展标识符
  contextId: string;              // 关联的上下文ID
  name: string;                   // 扩展名称
  version: string;                // 扩展版本
  status: ExtensionStatus;        // 扩展状态
  type: ExtensionType;            // 扩展类型
  
  // 扩展配置
  configuration: ExtensionConfig;
  capabilities: string[];         // 扩展能力
  dependencies: ExtensionDependency[];
  
  // 生命周期信息
  lifecycle: {
    installDate: string;
    lastActivated?: string;
    lastDeactivated?: string;
    activationCount: number;
  };
  
  // 安全和权限
  permissions: ExtensionPermission[];
  securityLevel: SecurityLevel;
  
  // 元数据
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateExtensionDto** (创建请求接口)

```typescript
interface CreateExtensionDto {
  contextId: string;              // 必需：关联的上下文ID
  name: string;                   // 必需：扩展名称
  version: string;                // 必需：扩展版本
  type: ExtensionType;            // 必需：扩展类型
  
  // 扩展包信息
  packageInfo: {
    source: string;               // 包源（URL、文件路径等）
    checksum?: string;            // 包校验和
    signature?: string;           // 数字签名
  };
  
  // 配置
  configuration?: Partial<ExtensionConfig>;
  permissions?: ExtensionPermission[];
  
  // 依赖
  dependencies?: ExtensionDependency[];
  
  // 元数据
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **ExtensionStatus** (扩展状态)

```typescript
enum ExtensionStatus {
  INSTALLED = 'installed',        // 已安装但未激活
  ACTIVE = 'active',              // 激活并运行中
  INACTIVE = 'inactive',          // 非激活状态
  ERROR = 'error',                // 错误状态
  UPDATING = 'updating',          // 更新中
  UNINSTALLING = 'uninstalling'   // 卸载中
}
```

### **ExtensionType** (扩展类型)

```typescript
enum ExtensionType {
  AGENT_CAPABILITY = 'agent_capability',     // 智能体能力扩展
  PROTOCOL_HANDLER = 'protocol_handler',     // 协议处理器
  DATA_PROCESSOR = 'data_processor',         // 数据处理器
  UI_COMPONENT = 'ui_component',             // UI组件
  INTEGRATION = 'integration',               // 外部集成
  MIDDLEWARE = 'middleware'                  // 中间件扩展
}
```

## 🎮 控制器API

### **ExtensionController**

主要的REST API控制器，提供HTTP端点访问。

#### **安装扩展**
```typescript
async installExtension(dto: CreateExtensionDto): Promise<ExtensionOperationResult>
```

**HTTP端点**: `POST /api/extensions/install`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "advanced-nlp-processor",
  "version": "2.1.0",
  "type": "data_processor",
  "packageInfo": {
    "source": "https://extensions.mplp.io/nlp-processor-2.1.0.zip",
    "checksum": "sha256:abc123...",
    "signature": "sig:def456..."
  },
  "configuration": {
    "enableAdvancedFeatures": true,
    "maxProcessingThreads": 4
  },
  "permissions": [
    {
      "resource": "data.process",
      "actions": ["read", "write"],
      "scope": "context"
    }
  ]
}
```

#### **激活扩展**
```typescript
async activateExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP端点**: `POST /api/extensions/{extensionId}/activate`

#### **停用扩展**
```typescript
async deactivateExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP端点**: `POST /api/extensions/{extensionId}/deactivate`

#### **卸载扩展**
```typescript
async uninstallExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP端点**: `DELETE /api/extensions/{extensionId}`

#### **获取扩展**
```typescript
async getExtension(extensionId: string): Promise<ExtensionResponseDto>
```

**HTTP端点**: `GET /api/extensions/{extensionId}`

#### **列出扩展**
```typescript
async listExtensions(filter?: ExtensionFilter): Promise<ExtensionResponseDto[]>
```

**HTTP端点**: `GET /api/extensions`

#### **更新扩展配置**
```typescript
async updateExtensionConfig(extensionId: string, config: Partial<ExtensionConfig>): Promise<ExtensionOperationResult>
```

**HTTP端点**: `PUT /api/extensions/{extensionId}/config`

## 🔧 服务层API

### **ExtensionManagementService**

核心业务逻辑服务，提供扩展管理功能。

#### **主要方法**

```typescript
class ExtensionManagementService {
  // 生命周期管理
  async installExtension(request: InstallExtensionRequest): Promise<ExtensionEntity>;
  async uninstallExtension(extensionId: string): Promise<boolean>;
  async activateExtension(extensionId: string): Promise<ExtensionEntity>;
  async deactivateExtension(extensionId: string): Promise<ExtensionEntity>;
  
  // 配置管理
  async updateExtensionConfig(extensionId: string, config: Partial<ExtensionConfig>): Promise<ExtensionEntity>;
  async getExtensionConfig(extensionId: string): Promise<ExtensionConfig>;
  
  // 查询和发现
  async getExtensionById(extensionId: string): Promise<ExtensionEntity | null>;
  async listExtensions(filter?: ExtensionFilter): Promise<ExtensionEntity[]>;
  async searchExtensions(query: ExtensionSearchQuery): Promise<ExtensionSearchResult>;
  
  // 安全和验证
  async validateExtension(extensionId: string): Promise<ValidationResult>;
  async checkExtensionPermissions(extensionId: string): Promise<PermissionCheckResult>;
  
  // 分析和监控
  async getExtensionMetrics(extensionId: string): Promise<ExtensionMetrics>;
  async getExtensionHealth(extensionId: string): Promise<ExtensionHealth>;
}
```

## 📊 数据结构

### **ExtensionConfig** (扩展配置)

```typescript
interface ExtensionConfig {
  autoStart: boolean;             // 上下文激活时自动启动
  maxMemoryUsage: number;         // 最大内存使用量（MB）
  maxCpuUsage: number;            // 最大CPU使用率（%）
  timeoutSettings: {
    initialization: number;       // 初始化超时（ms）
    operation: number;            // 操作超时（ms）
    shutdown: number;             // 关闭超时（ms）
  };
  customSettings: Record<string, any>; // 扩展特定设置
}
```

### **ExtensionDependency** (扩展依赖)

```typescript
interface ExtensionDependency {
  name: string;                   // 依赖名称
  version: string;                // 所需版本
  type: 'extension' | 'library' | 'service';
  optional: boolean;              // 是否为可选依赖
  source?: string;                // 依赖源
}
```

### **ExtensionPermission** (扩展权限)

```typescript
interface ExtensionPermission {
  resource: string;               // 资源标识符
  actions: string[];              // 允许的操作
  scope: 'global' | 'context' | 'local';
  conditions?: string[];          // 权限条件
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/extension/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/extension/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/extension/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/extension/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
