# MPLP 版本内容规范

## 🎯 版本分类定义

### Dev版本 (开发版本)
**用途**: 内部开发、测试、实验性功能  
**访问权限**: 内部团队  
**发布频率**: 持续集成，每次提交  
**稳定性**: 不保证稳定性  

### Release版本 (开源版本)
**用途**: 公开发布、生产使用  
**访问权限**: 公开可用  
**发布频率**: 按计划发布 (如每月/季度)  
**稳定性**: 生产级稳定性保证  

## 📦 版本内容对比表

| 内容类别 | Dev版本 | Release版本 | 约束规则 |
|----------|---------|-------------|----------|
| **核心代码** | ✅ 全部 | ✅ 筛选后 | 移除实验性代码 |
| **测试代码** | ✅ 全部 | ✅ 筛选后 | 移除内部测试 |
| **文档** | ✅ 全部 | ✅ 公开部分 | 移除内部文档 |
| **配置文件** | ✅ 全部 | ✅ 通用配置 | 移除内部配置 |
| **示例代码** | ✅ 全部 | ✅ 公开示例 | 移除内部示例 |
| **工具脚本** | ✅ 全部 | ✅ 必要工具 | 移除内部工具 |
| **依赖项** | ✅ 全部 | ✅ 公开依赖 | 移除内部依赖 |

## 🔒 Dev版本内容 (完整开发环境)

### ✅ **包含内容**

#### 核心代码模块
```
src/
├── modules/core/                    # 核心功能模块
├── modules/experimental/            # 🔒 实验性功能
├── modules/internal/                # 🔒 内部专用模块
├── core/performance/                # 性能优化工具
├── core/monitoring/                 # 🔒 内部监控系统
├── core/analytics/                  # 🔒 数据分析模块
├── shared/                          # 共享类型和工具
├── utils/                           # 工具函数
└── internal/                        # 🔒 内部工具和配置
```

#### 测试代码
```
tests/
├── unit/                           # 单元测试
├── integration/                    # 集成测试
├── e2e/                           # 端到端测试
├── performance/                    # 性能测试
├── internal/                       # 🔒 内部测试
├── experimental/                   # 🔒 实验性测试
├── load/                          # 🔒 负载测试
└── security/                      # 🔒 安全测试
```

#### 文档和配置
```
docs/
├── public/                        # 公开文档
├── internal/                      # 🔒 内部文档
├── architecture/                  # 🔒 架构设计文档
├── deployment/                    # 🔒 部署文档
└── security/                      # 🔒 安全文档

configs/
├── development/                   # 🔒 开发环境配置
├── staging/                       # 🔒 测试环境配置
├── production/                    # 🔒 生产环境配置
└── internal/                      # 🔒 内部服务配置
```

#### 工具和脚本
```
scripts/
├── build/                         # 构建脚本
├── test/                          # 测试脚本
├── deployment/                    # 🔒 部署脚本
├── monitoring/                    # 🔒 监控脚本
├── analytics/                     # 🔒 分析脚本
└── internal/                      # 🔒 内部工具脚本
```

## 🌍 Release版本内容 (开源发布)

### ✅ **必须包含**

#### 核心功能代码
```
src/
├── modules/core/
│   ├── orchestrator/
│   │   ├── core-orchestrator.ts                    ✅ 基础调度器
│   │   └── performance-enhanced-orchestrator.ts    ✅ 性能增强调度器
│   └── types/
│       └── core.types.ts                          ✅ 核心类型定义
├── core/performance/
│   └── real-performance-optimizer.ts              ✅ 性能优化工具
├── shared/
│   └── types/                                     ✅ 共享类型
├── utils/
│   ├── logger.ts                                  ✅ 日志工具
│   └── common.ts                                  ✅ 通用工具
└── index.ts                                       ✅ 统一导出
```

#### 验证测试代码
```
tests/
├── unit/                                          ✅ 完整单元测试
├── integration/                                   ✅ 完整集成测试
├── e2e/                                          ✅ 完整E2E测试
├── performance/
│   ├── real-business-performance.test.ts          ✅ 真实性能测试
│   └── realistic-optimized-performance.test.ts    ✅ 优化对比测试
└── test-utils/                                   ✅ 测试工具
```

#### 公开文档
```
docs/
├── README.md                                      ✅ 项目介绍
├── api-reference.md                               ✅ API文档
├── performance-guide.md                           ✅ 性能指南
├── getting-started.md                             ✅ 快速开始
├── migration-guide.md                             ✅ 迁移指南
├── contributing.md                                ✅ 贡献指南
├── changelog.md                                   ✅ 更新日志
└── examples/                                      ✅ 示例代码
```

#### 配置和工具
```
.github/workflows/                                 ✅ CI/CD配置
package.json                                       ✅ 包配置
tsconfig.json                                      ✅ TypeScript配置
jest.config.js                                     ✅ 测试配置
LICENSE                                            ✅ 许可证
SECURITY.md                                        ✅ 安全策略
```

### ❌ **严格排除**

#### 内部代码模块
```
❌ src/modules/experimental/          # 实验性功能
❌ src/modules/internal/              # 内部专用模块
❌ src/core/monitoring/               # 内部监控系统
❌ src/core/analytics/                # 数据分析模块
❌ src/internal/                      # 内部工具和配置
```

#### 内部测试代码
```
❌ tests/internal/                    # 内部测试
❌ tests/experimental/                # 实验性测试
❌ tests/load/                        # 负载测试
❌ tests/security/                    # 安全测试
❌ tests/performance/ultra-fast-*     # 虚假性能测试
```

#### 内部文档和配置
```
❌ docs/internal/                     # 内部文档
❌ docs/architecture/                 # 架构设计文档
❌ docs/deployment/                   # 部署文档
❌ docs/security/                     # 内部安全文档
❌ configs/                           # 所有内部配置
```

#### 内部工具和脚本
```
❌ scripts/deployment/                # 部署脚本
❌ scripts/monitoring/                # 监控脚本
❌ scripts/analytics/                 # 分析脚本
❌ scripts/internal/                  # 内部工具脚本
```

#### 敏感信息
```
❌ .env*                              # 环境变量文件
❌ secrets/                           # 密钥文件
❌ credentials/                       # 凭证文件
❌ *.key, *.pem                       # 密钥文件
❌ docker-compose.yml                 # 内部部署配置
```

## 🔍 内容筛选规则

### 自动化筛选规则

#### 文件路径规则
```javascript
// 排除规则
const EXCLUDE_PATTERNS = [
  '**/internal/**',
  '**/experimental/**', 
  '**/private/**',
  '**/.env*',
  '**/secrets/**',
  '**/credentials/**',
  '**/deployment/**',
  '**/monitoring/**',
  '**/analytics/**'
];

// 包含规则
const INCLUDE_PATTERNS = [
  'src/modules/core/**',
  'src/core/performance/**',
  'src/shared/**',
  'src/utils/**',
  'tests/unit/**',
  'tests/integration/**',
  'tests/e2e/**',
  'tests/performance/real-*',
  'docs/public/**'
];
```

#### 代码内容规则
```typescript
// 排除包含特定标记的代码
const EXCLUDE_MARKERS = [
  '// @internal',
  '// @experimental', 
  '// @private',
  '// @dev-only',
  '/* INTERNAL */',
  '/* EXPERIMENTAL */'
];

// 示例使用
// @internal - 此函数仅供内部使用
function internalFunction() {
  // 这个函数不会包含在开源版本中
}

export function publicFunction() {
  // 这个函数会包含在开源版本中
}
```

#### 依赖项规则
```json
{
  "dependencies": {
    "uuid": "^9.0.0"                    // ✅ 公开依赖
  },
  "devDependencies": {
    "typescript": "^5.0.0",             // ✅ 开发依赖
    "jest": "^29.0.0"                   // ✅ 测试依赖
  },
  "internalDependencies": {
    "@company/internal-sdk": "^1.0.0",  // ❌ 内部依赖
    "@company/monitoring": "^2.0.0"     // ❌ 内部依赖
  }
}
```

## 🛠️ 版本构建流程

### Dev版本构建
```bash
# 完整构建，包含所有内容
npm run build:dev
npm run test:all
npm run package:dev
```

### Release版本构建
```bash
# 筛选构建，仅包含公开内容
npm run build:release
npm run test:public
npm run security:scan
npm run package:release
```

## 📋 发布检查清单

### Dev版本检查
- [ ] 所有功能模块构建成功
- [ ] 所有测试通过 (包括内部测试)
- [ ] 内部文档更新
- [ ] 版本号递增

### Release版本检查
- [ ] ✅ 仅包含公开代码模块
- [ ] ✅ 移除所有内部标记代码
- [ ] ✅ 移除所有敏感信息
- [ ] ✅ 移除所有内部配置
- [ ] ✅ 移除所有内部文档
- [ ] ✅ 仅包含公开依赖项
- [ ] ✅ 安全扫描通过
- [ ] ✅ 许可证合规检查
- [ ] ✅ 公开测试全部通过
- [ ] ✅ 文档完整性检查
- [ ] ✅ 示例代码验证

## 🔐 安全约束

### 信息安全
- **绝对禁止**: API密钥、数据库连接字符串、内部服务地址
- **严格控制**: 内部架构信息、部署细节、安全配置
- **谨慎处理**: 性能数据、用户信息、业务逻辑

### 代码安全
- **代码审查**: 所有公开代码必须经过安全审查
- **依赖检查**: 所有公开依赖必须通过安全扫描
- **漏洞扫描**: 发布前必须进行漏洞扫描

### 合规性
- **许可证**: 确保所有依赖项许可证兼容
- **版权**: 确保没有版权问题
- **专利**: 确保没有专利冲突

## 📊 版本对比示例

### 文件数量对比
| 类别 | Dev版本 | Release版本 | 筛选率 |
|------|---------|-------------|--------|
| **源代码文件** | 150+ | 45 | 70%筛选 |
| **测试文件** | 80+ | 25 | 69%筛选 |
| **文档文件** | 50+ | 15 | 70%筛选 |
| **配置文件** | 30+ | 8 | 73%筛选 |
| **总计** | 310+ | 93 | 70%筛选 |

### 包大小对比
| 版本 | 源码大小 | 构建后大小 | 包大小 |
|------|----------|------------|--------|
| **Dev版本** | ~2.5MB | ~1.2MB | ~800KB |
| **Release版本** | ~800KB | ~400KB | ~250KB |

## 🎯 版本发布策略

### 发布频率
- **Dev版本**: 每次提交自动构建
- **Release版本**: 
  - Patch版本: 每2周 (bug修复)
  - Minor版本: 每月 (新功能)
  - Major版本: 每季度 (重大更新)

### 版本命名
- **Dev版本**: `1.0.0-dev.20250129.1`
- **Release版本**: `1.0.0`, `1.1.0`, `2.0.0`

### 发布渠道
- **Dev版本**: 内部npm registry
- **Release版本**: 公开npm registry + GitHub Releases

这样的版本内容规范确保了我们能够安全、有序地管理开发版本和开源版本，既保护了内部资产，又为开源社区提供了高质量的产品！🚀🔒
