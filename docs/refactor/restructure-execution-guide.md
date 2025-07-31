# MPLP 项目重构执行指南

## 🎯 重构目标确认

在开始重构之前，请确认以下目标：

1. ✅ **符合发布标准**: 按照Dev/Release版本要求重新组织目录结构
2. ✅ **清晰的模块分离**: 明确区分公开模块和内部模块  
3. ✅ **引用路径优化**: 统一和简化模块间的引用关系
4. ✅ **向后兼容**: 确保重构后功能完全正常
5. ✅ **变更可追踪**: 记录所有变更，确保可回滚

## 📋 执行前检查清单

### 环境准备
- [ ] Node.js 版本 >= 16
- [ ] npm 依赖已安装 (`npm ci`)
- [ ] Git 工作区干净 (`git status`)
- [ ] 所有测试通过 (`npm test`)
- [ ] 构建成功 (`npm run build`)

### 备份确认
- [ ] 创建Git分支 (`git checkout -b refactor/project-restructure`)
- [ ] 确认备份策略
- [ ] 准备回滚计划

## 🚀 重构执行步骤

### 步骤1: 创建重构前快照

```bash
# 创建项目状态快照
npm run track:before
```

**预期结果**:
- 生成项目文件快照
- 记录所有导入导出关系
- 建立基准状态

**验证**:
```bash
# 检查快照文件是否生成
ls -la | grep snapshot
```

### 步骤2: 干运行重构预览

```bash
# 预览重构操作，不实际执行
npm run restructure:dry-run
```

**预期结果**:
- 显示所有将要执行的操作
- 预览目录结构变更
- 识别潜在问题

**检查要点**:
- [ ] 文件迁移路径正确
- [ ] 没有意外的文件删除
- [ ] 导入路径更新合理

### 步骤3: 执行实际重构

```bash
# 执行实际重构 (包含自动备份)
npm run restructure
```

**执行过程监控**:
- 观察控制台输出
- 确认每个步骤成功完成
- 记录任何警告或错误

**关键检查点**:
1. **目录创建**: 新目录结构是否正确创建
2. **文件迁移**: 文件是否正确移动到新位置
3. **路径更新**: import语句是否正确更新
4. **配置更新**: tsconfig.json, jest.config.js是否正确更新

### 步骤4: 创建重构后快照

```bash
# 创建重构后快照
npm run track:after
```

**预期结果**:
- 记录重构后的项目状态
- 对比前后差异
- 准备验证数据

### 步骤5: 验证重构结果

```bash
# 运行完整验证
npm run track:validate
```

**验证项目**:
1. **构建验证**: 项目是否能正常构建
2. **测试验证**: 所有测试是否通过
3. **导入验证**: 导入路径是否正确
4. **导出验证**: 导出是否完整
5. **配置验证**: 配置文件是否正确

### 步骤6: 功能完整性测试

```bash
# 运行完整测试套件
npm test

# 运行性能测试
npm run test:performance:real

# 验证构建
npm run build

# 测试Release版本构建
npm run build:release:dry-run
```

**必须通过的测试**:
- [ ] 所有单元测试 100% 通过
- [ ] 所有集成测试 100% 通过
- [ ] 所有E2E测试 100% 通过
- [ ] 真实性能测试通过
- [ ] 构建过程无错误
- [ ] Release版本构建成功

### 步骤7: 生成变更报告

```bash
# 生成完整的变更追踪报告
npm run track:report
```

**报告内容**:
- 详细的变更记录
- 验证结果总结
- 文件迁移映射
- 导入导出变更

## 📊 重构验证标准

### 🟢 成功标准

#### 功能完整性
- [ ] 所有测试 100% 通过
- [ ] 构建过程无错误  
- [ ] 导入导出正常工作
- [ ] 性能测试结果一致

#### 结构清晰性
- [ ] 公开/内部模块明确分离
- [ ] 路径引用清晰一致
- [ ] Release版本筛选正确
- [ ] 目录结构符合规范

#### 向后兼容性
- [ ] 现有API保持不变
- [ ] 外部引用路径兼容
- [ ] 配置文件向后兼容
- [ ] 发布流程正常

### 🔴 失败处理

如果验证失败，按以下步骤处理：

#### 1. 分析失败原因
```bash
# 查看详细的验证报告
cat change-tracking-report.md

# 检查具体的错误信息
npm test -- --verbose
```

#### 2. 修复问题
- 根据错误信息定位问题
- 手动修复导入路径
- 更新配置文件
- 补充缺失文件

#### 3. 重新验证
```bash
# 重新运行验证
npm run track:validate

# 重新测试
npm test
```

#### 4. 如果无法修复，执行回滚
```bash
# 回滚到重构前状态
git checkout .
git clean -fd

# 或者恢复备份
cp -r backup-[timestamp]/* .
```

## 📁 重构后目录结构确认

### 预期的新结构
```
mplp-v1.0/
├── src/
│   ├── public/                         # ✅ 公开模块
│   │   ├── modules/core/               # 核心模块
│   │   ├── performance/                # 性能优化
│   │   ├── shared/                     # 共享类型
│   │   ├── utils/                      # 工具函数
│   │   └── index.ts                    # 公开API入口
│   ├── internal/                       # ✅ 内部模块 (如果有)
│   └── index.ts                        # 主入口
├── tests/
│   ├── public/                         # ✅ 公开测试
│   │   ├── unit/                       # 单元测试
│   │   ├── integration/                # 集成测试
│   │   ├── e2e/                        # E2E测试
│   │   ├── performance/                # 真实性能测试
│   │   └── test-utils/                 # 测试工具
│   └── internal/                       # ✅ 内部测试 (如果有)
├── docs/
│   ├── public/                         # ✅ 公开文档
│   └── internal/                       # ✅ 内部文档 (如果有)
├── examples/                           # ✅ 示例代码
├── scripts/
│   ├── public/                         # ✅ 公开脚本
│   └── internal/                       # ✅ 内部脚本
└── configs/                            # ✅ 配置文件
```

### 关键文件位置确认
- [ ] `src/public/modules/core/orchestrator/core-orchestrator.ts` 存在
- [ ] `src/public/performance/real-performance-optimizer.ts` 存在
- [ ] `tests/public/performance/real-business-performance.test.ts` 存在
- [ ] `src/public/index.ts` 正确导出所有公开API
- [ ] `tsconfig.json` 包含正确的路径映射
- [ ] `jest.config.js` 包含正确的测试路径

## 🔧 常见问题和解决方案

### 问题1: 导入路径错误
**症状**: TypeScript编译错误，找不到模块
**解决**: 
```bash
# 检查路径映射
cat tsconfig.json | grep -A 10 "paths"

# 手动修复导入路径
# 将 'src/modules/core' 替换为 'src/public/modules/core'
```

### 问题2: 测试文件找不到
**症状**: Jest无法找到测试文件
**解决**:
```bash
# 检查Jest配置
cat jest.config.js | grep -A 5 "testMatch"

# 更新测试路径配置
```

### 问题3: 构建失败
**症状**: tsc编译失败
**解决**:
```bash
# 清理构建缓存
npm run clean

# 重新构建
npm run build

# 检查TypeScript错误
npx tsc --noEmit
```

### 问题4: 性能测试失败
**症状**: 性能测试结果不一致
**解决**:
```bash
# 确认真实性能测试文件存在
ls tests/public/performance/real-business-performance.test.ts

# 确认虚假测试文件已删除
ls tests/performance/ultra-fast-* 2>/dev/null || echo "已删除"
```

## 📈 重构成功指标

### 定量指标
- [ ] 测试通过率: 100%
- [ ] 构建成功率: 100%
- [ ] 导入路径更新: 100%
- [ ] 文件迁移成功率: 100%

### 定性指标
- [ ] 目录结构清晰易懂
- [ ] 公开/内部模块分离明确
- [ ] 发布版本筛选正确
- [ ] 开发体验无降级

## 🎉 重构完成后续步骤

### 1. 提交变更
```bash
# 添加所有变更
git add .

# 提交重构
git commit -m "refactor: 重构项目目录结构，分离公开和内部模块

- 将核心模块移至 src/public/modules/core/
- 将性能模块移至 src/public/performance/
- 将测试文件移至 tests/public/
- 删除虚假性能测试文件
- 更新所有导入路径和配置文件
- 添加路径映射和别名配置

Closes #重构任务编号"
```

### 2. 验证Release版本
```bash
# 测试Release版本构建
npm run release:prepare

# 验证内容筛选
npm run validate:release
```

### 3. 更新文档
- [ ] 更新README.md中的目录结构说明
- [ ] 更新开发指南
- [ ] 更新API文档路径

### 4. 团队通知
- [ ] 通知团队成员目录结构变更
- [ ] 更新开发环境设置指南
- [ ] 安排代码review

这个重构执行指南确保了我们能够安全、系统地完成项目重构，同时保持功能完整性和可追溯性！🚀
