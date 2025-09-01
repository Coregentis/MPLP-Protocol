# CircleCI 最佳实践指南

## 🎯 概述

本文档总结了MPLP项目在使用CircleCI时的最佳实践，包括配置优化、性能提升、安全措施和监控策略。

## 🏗️ 配置最佳实践

### 1. 工作流设计

#### 开发工作流 (development)
```yaml
# 特点：快速反馈，并行执行
development:
  jobs:
    - test-unit          # 快速单元测试
    - test-integration   # 集成测试
    - test-performance   # 性能测试
    - build-and-validate # 构建验证
    - security-audit     # 安全检查
    - backup-check       # 备份检查
```

#### 发布工作流 (release)
```yaml
# 特点：严格验证，顺序执行
release:
  jobs:
    - test-unit:
        filters:
          tags: { only: /^v.*/ }
          branches: { ignore: /.*/ }
    - build-public-release:
        requires: [test-unit, test-integration]
    - deploy-to-npm:
        requires: [build-public-release]
```

#### 定时工作流
```yaml
# 夜间工作流：定期维护
nightly:
  triggers:
    - schedule:
        cron: "0 2 * * *"
  jobs:
    - scheduled-backup
    - test-performance
    - security-audit

# 周度工作流：深度检查
weekly:
  triggers:
    - schedule:
        cron: "0 1 * * 0"
  jobs:
    - flaky-test-detection
```

### 2. 任务优化

#### 缓存策略
```yaml
# 依赖缓存
- restore_cache:
    keys:
      - v1-dependencies-{{ checksum "package-lock.json" }}
      - v1-dependencies-
- save_cache:
    paths: [node_modules]
    key: v1-dependencies-{{ checksum "package-lock.json" }}

# 构建缓存
- restore_cache:
    keys:
      - v1-build-{{ .Environment.CIRCLE_SHA1 }}
- save_cache:
    paths: [dist]
    key: v1-build-{{ .Environment.CIRCLE_SHA1 }}
```

#### 并行化测试
```yaml
test-parallel:
  parallelism: 4
  steps:
    - run:
        command: |
          TESTFILES=$(circleci tests glob "tests/**/*.test.ts" | circleci tests split --split-by=timings)
          npm test $TESTFILES
```

#### 资源优化
```yaml
# 性能测试使用更大资源
test-performance:
  resource_class: medium+
  
# 构建任务使用标准资源
build-and-validate:
  resource_class: medium
```

### 3. 环境变量管理

#### 分层管理
```bash
# 项目级别
NPM_TOKEN=npm_xxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxx

# 上下文级别
PRODUCTION_API_KEY=prod_key
STAGING_API_KEY=staging_key

# 任务级别
TEST_DATABASE_URL=test_db_url
```

#### 安全实践
```yaml
# 使用上下文保护敏感信息
deploy-to-npm:
  context: 
    - npm-publishing
    - github-access
```

## ⚡ 性能优化

### 1. 构建时间优化

#### Docker镜像选择
```yaml
# 使用官方优化镜像
docker:
  - image: cimg/node:18.17  # 预装工具，启动快

# 避免使用
docker:
  - image: node:18          # 基础镜像，需要额外安装
```

#### 依赖安装优化
```yaml
# 使用orb简化配置
- node/install-packages:
    pkg-manager: npm
    cache-version: v1

# 手动优化
- run:
    name: Install dependencies
    command: |
      if [ ! -d node_modules ]; then
        npm ci --prefer-offline --no-audit
      fi
```

### 2. 测试优化

#### 智能测试执行
```yaml
# 只运行变更相关的测试
- run:
    name: Run affected tests
    command: |
      CHANGED_FILES=$(git diff --name-only HEAD~1)
      if echo "$CHANGED_FILES" | grep -E "\.(ts|js)$"; then
        npm run test:affected
      else
        echo "No code changes, skipping tests"
      fi
```

#### 测试结果缓存
```yaml
# 缓存测试结果
- restore_cache:
    keys:
      - v1-test-results-{{ .Environment.CIRCLE_SHA1 }}
- run:
    name: Run tests
    command: npm test
- save_cache:
    paths: [test-results]
    key: v1-test-results-{{ .Environment.CIRCLE_SHA1 }}
```

### 3. 工件管理

#### 选择性存储
```yaml
# 只在需要时存储工件
- store_artifacts:
    path: coverage
    destination: coverage-reports
- when:
    condition:
      equal: [main, << pipeline.git.branch >>]
    steps:
      - store_artifacts:
          path: performance-reports
```

## 🔒 安全最佳实践

### 1. 访问控制

#### 分支保护
```yaml
# 限制敏感操作到特定分支
deploy-to-npm:
  filters:
    tags: { only: /^v.*/ }
    branches: { ignore: /.*/ }
```

#### 上下文使用
```yaml
# 使用受限上下文
production-deploy:
  context: production-secrets
  filters:
    branches: { only: main }
```

### 2. 密钥管理

#### 环境变量
```bash
# 使用描述性名称
NPM_PUBLISH_TOKEN=xxx
GITHUB_RELEASE_TOKEN=xxx
BACKUP_ENCRYPTION_KEY=xxx

# 避免
TOKEN=xxx
KEY=xxx
SECRET=xxx
```

#### 密钥轮换
```yaml
# 定期检查密钥有效性
security-audit:
  steps:
    - run:
        name: Check token validity
        command: |
          npm whoami --registry https://registry.npmjs.org/
          curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### 3. 审计和监控

#### 安全扫描
```yaml
security-audit:
  steps:
    - run:
        name: Dependency audit
        command: npm audit --audit-level=moderate
    - run:
        name: License check
        command: npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause'
```

## 📊 监控和告警

### 1. 构建监控

#### 性能指标
```yaml
# 收集构建时间
- run:
    name: Build with timing
    command: |
      START_TIME=$(date +%s)
      npm run build
      END_TIME=$(date +%s)
      echo "Build time: $((END_TIME - START_TIME)) seconds"
```

#### 失败通知
```yaml
# Slack通知
- run:
    name: Notify on failure
    command: |
      curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"Build failed: $CIRCLE_BUILD_URL"}' \
        $SLACK_WEBHOOK_URL
    when: on_fail
```

### 2. 测试监控

#### 测试趋势
```yaml
# 存储测试指标
- store_test_results:
    path: test-results
- run:
    name: Upload test metrics
    command: |
      curl -X POST "$METRICS_ENDPOINT" \
        -d "test_count=$(cat test-results/junit.xml | grep -c testcase)"
```

#### 覆盖率跟踪
```yaml
# 上传覆盖率
- codecov/upload:
    file: coverage/lcov.info
    flags: unittests
```

## 🔧 故障排除

### 1. 常见问题

#### 构建失败
```bash
# 检查步骤
1. 查看构建日志
2. 检查环境变量
3. 验证依赖版本
4. 测试本地构建
```

#### 测试不稳定
```yaml
# 重试机制
- run:
    name: Run tests with retry
    command: |
      for i in {1..3}; do
        npm test && break
        echo "Test attempt $i failed, retrying..."
        sleep 5
      done
```

#### 部署失败
```bash
# 调试步骤
1. 验证认证信息
2. 检查网络连接
3. 确认目标环境状态
4. 查看部署日志
```

### 2. 调试技巧

#### SSH调试
```yaml
# 启用SSH访问
- run:
    name: Setup SSH
    command: |
      echo 'export TERM=xterm' >> $BASH_ENV
      echo 'Rerun with SSH to debug'
```

#### 本地测试
```bash
# 使用CircleCI CLI本地测试
circleci local execute --job test-unit
circleci config validate .circleci/config.yml
```

## 📈 持续改进

### 1. 性能优化

#### 定期审查
- 每月检查构建时间趋势
- 分析资源使用情况
- 优化缓存策略
- 更新依赖版本

#### 基准测试
```yaml
# 性能基准
performance-benchmark:
  steps:
    - run:
        name: Benchmark
        command: |
          npm run benchmark
          echo "Performance baseline: $(cat benchmark-results.json)"
```

### 2. 配置维护

#### 版本管理
```yaml
# 使用固定版本
orbs:
  node: circleci/node@5.1.0  # 固定版本
  codecov: codecov/codecov@3.2.4
```

#### 定期更新
- 每季度更新orb版本
- 检查新功能和改进
- 测试配置变更
- 更新文档

---

**记住**: 持续优化是关键，定期审查和改进CircleCI配置以获得最佳性能和可靠性。
