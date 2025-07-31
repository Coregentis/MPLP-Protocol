# MPLP 项目目录重构计划

## 🎯 重构目标

1. **符合发布标准**: 按照Dev/Release版本要求重新组织目录结构
2. **清晰的模块分离**: 明确区分公开模块和内部模块
3. **引用路径优化**: 统一和简化模块间的引用关系
4. **向后兼容**: 确保重构后功能完全正常

## 📁 当前目录结构分析

### 现有结构
```
mplp-v1.0/
├── src/
│   ├── modules/core/                    # 核心模块 ✅ 公开
│   ├── core/performance/                # 性能优化 ✅ 公开
│   ├── shared/                          # 共享类型 ✅ 公开
│   ├── utils/                           # 工具函数 ✅ 公开
│   └── index.ts                         # 主入口 ✅ 公开
├── tests/
│   ├── unit/                           # 单元测试 ✅ 公开
│   ├── integration/                    # 集成测试 ✅ 公开
│   ├── e2e/                           # E2E测试 ✅ 公开
│   ├── performance/                    # 性能测试 ⚠️ 混合
│   └── test-utils/                     # 测试工具 ✅ 公开
├── docs/                               # 文档 ⚠️ 混合
├── scripts/                            # 脚本 ⚠️ 混合
└── examples/                           # 示例 ❌ 缺失
```

### 问题识别
1. **性能测试混合**: 包含真实测试和虚假测试
2. **文档混合**: 公开文档和内部文档混在一起
3. **脚本混合**: 公开工具和内部工具混在一起
4. **缺少示例**: 没有独立的示例目录
5. **内部模块未分离**: 没有明确的内部模块目录

## 🎯 目标目录结构

### 重构后结构
```
mplp-v1.0/
├── src/
│   ├── public/                         # 🆕 公开模块
│   │   ├── modules/core/               # 核心模块
│   │   ├── performance/                # 性能优化
│   │   ├── shared/                     # 共享类型
│   │   ├── utils/                      # 工具函数
│   │   └── index.ts                    # 公开API入口
│   ├── internal/                       # 🆕 内部模块
│   │   ├── experimental/               # 实验性功能
│   │   ├── monitoring/                 # 内部监控
│   │   ├── analytics/                  # 数据分析
│   │   └── dev-tools/                  # 开发工具
│   └── index.ts                        # 主入口 (包含所有)
├── tests/
│   ├── public/                         # 🆕 公开测试
│   │   ├── unit/                       # 单元测试
│   │   ├── integration/                # 集成测试
│   │   ├── e2e/                        # E2E测试
│   │   ├── performance/                # 真实性能测试
│   │   └── test-utils/                 # 测试工具
│   └── internal/                       # 🆕 内部测试
│       ├── experimental/               # 实验性测试
│       ├── load/                       # 负载测试
│       └── security/                   # 安全测试
├── docs/
│   ├── public/                         # 🆕 公开文档
│   │   ├── api/                        # API文档
│   │   ├── guides/                     # 用户指南
│   │   └── examples/                   # 示例文档
│   └── internal/                       # 🆕 内部文档
│       ├── architecture/               # 架构文档
│       ├── deployment/                 # 部署文档
│       └── security/                   # 安全文档
├── examples/                           # 🆕 示例代码
│   ├── basic/                          # 基础示例
│   ├── advanced/                       # 高级示例
│   └── performance/                    # 性能示例
├── scripts/
│   ├── public/                         # 🆕 公开脚本
│   │   ├── build/                      # 构建脚本
│   │   └── test/                       # 测试脚本
│   └── internal/                       # 🆕 内部脚本
│       ├── deployment/                 # 部署脚本
│       └── monitoring/                 # 监控脚本
└── configs/                            # 🆕 配置文件
    ├── public/                         # 公开配置
    └── internal/                       # 内部配置
```

## 📋 重构步骤计划

### 阶段1: 准备和分析 (1天)

#### Step 1.1: 依赖关系分析
- [ ] 分析所有文件的import/export关系
- [ ] 识别循环依赖
- [ ] 记录外部依赖

#### Step 1.2: 文件分类
- [ ] 标记公开文件
- [ ] 标记内部文件
- [ ] 标记混合文件 (需要拆分)

#### Step 1.3: 创建变更追踪表
- [ ] 记录所有文件的当前路径
- [ ] 记录目标路径
- [ ] 记录引用关系

### 阶段2: 目录结构创建 (半天)

#### Step 2.1: 创建新目录结构
```bash
mkdir -p src/public/{modules/core,performance,shared,utils}
mkdir -p src/internal/{experimental,monitoring,analytics,dev-tools}
mkdir -p tests/public/{unit,integration,e2e,performance,test-utils}
mkdir -p tests/internal/{experimental,load,security}
mkdir -p docs/public/{api,guides,examples}
mkdir -p docs/internal/{architecture,deployment,security}
mkdir -p examples/{basic,advanced,performance}
mkdir -p scripts/public/{build,test}
mkdir -p scripts/internal/{deployment,monitoring}
mkdir -p configs/{public,internal}
```

#### Step 2.2: 创建路径映射文件
- [ ] 创建路径映射配置
- [ ] 创建别名配置
- [ ] 更新TypeScript配置

### 阶段3: 文件迁移 (2天)

#### Step 3.1: 公开模块迁移
- [ ] 迁移 `src/modules/core/` → `src/public/modules/core/`
- [ ] 迁移 `src/core/performance/` → `src/public/performance/`
- [ ] 迁移 `src/shared/` → `src/public/shared/`
- [ ] 迁移 `src/utils/` → `src/public/utils/`

#### Step 3.2: 测试文件迁移
- [ ] 迁移真实性能测试到 `tests/public/performance/`
- [ ] 移除虚假性能测试
- [ ] 迁移其他公开测试

#### Step 3.3: 文档迁移
- [ ] 迁移公开文档到 `docs/public/`
- [ ] 创建内部文档目录

### 阶段4: 引用路径更新 (2天)

#### Step 4.1: 更新import路径
- [ ] 更新所有TypeScript文件的import语句
- [ ] 更新测试文件的import语句
- [ ] 更新配置文件的路径引用

#### Step 4.2: 更新配置文件
- [ ] 更新 `tsconfig.json` 路径映射
- [ ] 更新 `jest.config.js` 测试路径
- [ ] 更新 `package.json` 脚本路径

### 阶段5: 验证和测试 (1天)

#### Step 5.1: 功能验证
- [ ] 运行所有测试确保通过
- [ ] 验证构建过程
- [ ] 验证导入导出正常

#### Step 5.2: 发布版本验证
- [ ] 运行Release版本构建
- [ ] 验证内容筛选正确
- [ ] 确认无功能损失

## 📊 变更追踪表

### 核心模块路径变更
| 原路径 | 新路径 | 影响的引用文件 | 状态 |
|--------|--------|----------------|------|
| `src/modules/core/orchestrator/` | `src/public/modules/core/orchestrator/` | 15个文件 | 📋 待迁移 |
| `src/modules/core/types/` | `src/public/modules/core/types/` | 25个文件 | 📋 待迁移 |
| `src/core/performance/` | `src/public/performance/` | 8个文件 | 📋 待迁移 |
| `src/shared/` | `src/public/shared/` | 30个文件 | 📋 待迁移 |
| `src/utils/` | `src/public/utils/` | 20个文件 | 📋 待迁移 |

### 测试文件路径变更
| 原路径 | 新路径 | 影响的引用文件 | 状态 |
|--------|--------|----------------|------|
| `tests/unit/` | `tests/public/unit/` | 配置文件 | 📋 待迁移 |
| `tests/integration/` | `tests/public/integration/` | 配置文件 | 📋 待迁移 |
| `tests/e2e/` | `tests/public/e2e/` | 配置文件 | 📋 待迁移 |
| `tests/performance/real-*` | `tests/public/performance/` | 配置文件 | 📋 待迁移 |
| `tests/test-utils/` | `tests/public/test-utils/` | 多个测试文件 | 📋 待迁移 |

### 需要删除的文件
| 文件路径 | 删除原因 | 状态 |
|----------|----------|------|
| `tests/performance/ultra-fast-performance.test.ts` | 虚假性能测试 | ❌ 待删除 |
| `tests/performance/optimized-performance.test.ts` | 临时测试文件 | ❌ 待删除 |
| `docs/performance/performance-optimization-achievement.md` | 虚假性能报告 | ❌ 待删除 |

## 🔧 自动化迁移脚本

### 路径映射配置
```typescript
// path-mapping.config.ts
export const PATH_MAPPINGS = {
  // 源代码映射
  'src/modules/core': 'src/public/modules/core',
  'src/core/performance': 'src/public/performance',
  'src/shared': 'src/public/shared',
  'src/utils': 'src/public/utils',
  
  // 测试映射
  'tests/unit': 'tests/public/unit',
  'tests/integration': 'tests/public/integration',
  'tests/e2e': 'tests/public/e2e',
  'tests/test-utils': 'tests/public/test-utils',
  
  // 文档映射
  'docs/api': 'docs/public/api',
  'docs/guides': 'docs/public/guides'
};

export const FILES_TO_DELETE = [
  'tests/performance/ultra-fast-performance.test.ts',
  'tests/performance/optimized-performance.test.ts',
  'docs/performance/performance-optimization-achievement.md'
];
```

### TypeScript配置更新
```json
// tsconfig.json 路径映射
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@public/*": ["src/public/*"],
      "@internal/*": ["src/internal/*"],
      "@core/*": ["src/public/modules/core/*"],
      "@performance/*": ["src/public/performance/*"],
      "@shared/*": ["src/public/shared/*"],
      "@utils/*": ["src/public/utils/*"],
      "@tests/*": ["tests/public/*"]
    }
  }
}
```

## ⚠️ 风险控制措施

### 1. 备份策略
- [ ] 创建完整项目备份
- [ ] 使用Git分支进行重构
- [ ] 每个阶段创建检查点

### 2. 验证机制
- [ ] 每步完成后运行测试
- [ ] 验证构建过程
- [ ] 检查导入导出完整性

### 3. 回滚计划
- [ ] 记录每个变更的逆操作
- [ ] 准备快速回滚脚本
- [ ] 保留原始路径的兼容性

## 📈 成功标准

### 功能完整性
- [ ] 所有测试100%通过
- [ ] 构建过程无错误
- [ ] 导入导出正常工作

### 结构清晰性
- [ ] 公开/内部模块明确分离
- [ ] 路径引用清晰一致
- [ ] 发布版本筛选正确

### 向后兼容性
- [ ] 现有API保持不变
- [ ] 外部引用路径兼容
- [ ] 配置文件向后兼容

## 🚀 执行时间表

| 阶段 | 时间 | 负责人 | 检查点 |
|------|------|--------|--------|
| 准备和分析 | Day 1 | 开发团队 | 依赖分析完成 |
| 目录创建 | Day 1.5 | 开发团队 | 新结构创建 |
| 文件迁移 | Day 2-3 | 开发团队 | 文件迁移完成 |
| 路径更新 | Day 4-5 | 开发团队 | 引用更新完成 |
| 验证测试 | Day 6 | 测试团队 | 功能验证通过 |

这个重构计划确保了我们能够安全、系统地整理项目结构，同时保持功能完整性和向后兼容性！🎯
