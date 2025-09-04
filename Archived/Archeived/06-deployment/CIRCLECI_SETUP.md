# CircleCI 设置指南

## 🎯 概述

本指南详细说明如何为MPLP项目设置CircleCI CI/CD流水线，包括开发环境、发布流程和备份策略。

## 📋 前置条件

### 1. CircleCI账户设置
- 注册CircleCI账户: https://circleci.com/signup/
- 连接GitHub账户
- 授权访问MPLP-Protocol-Dev仓库

### 2. 环境变量配置
在CircleCI项目设置中配置以下环境变量：

```bash
# npm发布
NPM_TOKEN=your_npm_token

# GitHub访问
GITHUB_TOKEN=your_github_token

# 备份相关
BACKUP_ENCRYPTION_KEY=your_backup_key
```

## 🏗️ 项目设置步骤

### 步骤1: 添加项目到CircleCI

1. 登录CircleCI控制台
2. 点击"Add Projects"
3. 找到`Coregentis/MPLP-Protocol-Dev`
4. 点击"Set Up Project"
5. 选择"Use Existing Config"（我们已经有.circleci/config.yml）

### 步骤2: 配置项目设置

#### 环境变量设置
```bash
# 在Project Settings > Environment Variables中添加：
NPM_TOKEN=npm_xxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx
BACKUP_ENCRYPTION_KEY=your_32_char_key
```

#### SSH密钥设置
```bash
# 如果需要访问私有仓库，在Project Settings > SSH Keys中添加
```

### 步骤3: 验证配置

1. 推送代码到main分支
2. 检查CircleCI是否自动触发构建
3. 验证所有工作流正常运行

## 🔄 工作流说明

### 开发工作流 (development)
**触发条件**: 每次推送到任何分支

**包含任务**:
- `test-unit` - 单元测试
- `test-integration` - 集成测试  
- `test-performance` - 性能测试
- `build-and-validate` - 构建和验证
- `security-audit` - 安全审计
- `backup-check` - 备份检查
- `flaky-test-detection` - 不稳定测试检测（仅main分支）

### 发布工作流 (release)
**触发条件**: 推送版本标签 (v*.*.*)

**包含任务**:
1. `test-unit` - 单元测试
2. `test-integration` - 集成测试
3. `build-public-release` - 构建开源版本
4. `deploy-to-npm` - 发布到npm

### 夜间工作流 (nightly)
**触发条件**: 每天凌晨2点 (UTC)

**包含任务**:
- `scheduled-backup` - 定时备份
- `test-performance` - 性能回归测试
- `security-audit` - 安全扫描

### 周度工作流 (weekly)
**触发条件**: 每周日凌晨1点 (UTC)

**包含任务**:
- `test-unit` - 完整单元测试
- `test-integration` - 完整集成测试
- `flaky-test-detection` - 不稳定测试检测

## 🛠️ 任务详解

### test-unit
```yaml
# 运行单元测试
command: npm run test:unit
artifacts: coverage/
test_results: test-results/
```

### test-integration
```yaml
# 运行集成测试
command: npm run test:integration
test_results: test-results/
```

### test-performance
```yaml
# 运行性能测试
resource_class: medium+
command: npm run test:performance
artifacts: performance-reports/
```

### build-and-validate
```yaml
# TypeScript编译和Schema验证
commands:
  - npm run build
  - npm run validate:schemas
artifacts: dist/
```

### security-audit
```yaml
# 安全审计
command: npm run security:audit
```

### backup-check
```yaml
# 备份检查和创建
commands:
  - npm run backup:auto-check
  - npm run backup:create (仅main分支)
```

### build-public-release
```yaml
# 构建开源版本
commands:
  - npm run build:public-release -- $VERSION
  - npm run validate:public-release
artifacts: public-release/
workspace: public-release/
```

### deploy-to-npm
```yaml
# 发布到npm
commands:
  - npm publish --access public
requires: build-public-release
```

## 📊 监控和告警

### 构建状态监控
- CircleCI Dashboard
- GitHub状态检查
- Slack通知（可选）

### 性能监控
- 性能测试报告
- 构建时间趋势
- 资源使用情况

### 备份监控
- 备份成功/失败状态
- 备份文件大小
- 存储空间使用

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查日志
# 验证环境变量
# 检查依赖版本
```

#### 2. 测试超时
```bash
# 增加resource_class
# 优化测试代码
# 并行化测试
```

#### 3. 部署失败
```bash
# 检查NPM_TOKEN
# 验证包配置
# 检查版本号
```

#### 4. 备份失败
```bash
# 检查存储权限
# 验证备份脚本
# 检查磁盘空间
```

## 🔧 高级配置

### 并行化测试
```yaml
parallelism: 4
command: |
  TESTFILES=$(circleci tests glob "tests/**/*.test.ts" | circleci tests split --split-by=timings)
  npm test $TESTFILES
```

### 缓存优化
```yaml
- restore_cache:
    keys:
      - v1-dependencies-{{ checksum "package-lock.json" }}
      - v1-dependencies-
- save_cache:
    paths:
      - node_modules
    key: v1-dependencies-{{ checksum "package-lock.json" }}
```

### 条件执行
```yaml
- run:
    name: Deploy to staging
    command: |
      if [ "$CIRCLE_BRANCH" = "develop" ]; then
        npm run deploy:staging
      fi
```

## 📈 最佳实践

### 1. 构建优化
- 使用适当的Docker镜像
- 启用依赖缓存
- 并行化测试执行
- 优化资源类别

### 2. 安全实践
- 使用环境变量存储敏感信息
- 定期轮换访问令牌
- 限制分支访问权限
- 启用安全扫描

### 3. 监控实践
- 设置构建通知
- 监控构建时间趋势
- 跟踪测试覆盖率
- 监控部署成功率

### 4. 备份实践
- 定期验证备份完整性
- 测试恢复流程
- 监控备份存储空间
- 自动化备份清理

## 📞 支持联系

### CircleCI相关问题
- **技术支持**: circleci-support@coregentis.com
- **配置问题**: devops@coregentis.com
- **紧急问题**: emergency@coregentis.com

### 相关文档
- [CircleCI官方文档](https://circleci.com/docs/)
- [MPLP发布流程](./RELEASE_PROCESS.md)
- [备份策略指南](./BACKUP_GUIDE.md)

---

**注意**: 定期检查和更新CircleCI配置，确保与项目需求保持一致。
