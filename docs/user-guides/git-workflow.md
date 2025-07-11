# MPLP 1.0 Git 工作流指南

> **工作流版本**: v2.1  
> **更新时间**: 2025-07-09T19:04:01+08:00  
> **适用项目**: Multi-Agent Project Lifecycle Protocol (MPLP) v1.0  
> **关联文档**: [MPLP协议开发专项路线图](./requirements-docs/mplp_protocol_roadmap.md) | [贡献指南](./ProjectRules/CONTRIBUTING.md)  
> **协议版本**: v1.0 (完全基于Roadmap v1.0开发规划)  
> **项目周期**: 12周 (2025-07-09 至 2025-10-01)

## 📁 双仓库策略（基于Roadmap开发规划）

### 🔧 **开发仓库** (origin)
- **地址**: https://github.com/Coregentis/MPLP-Protocol-Dev
- **用途**: 开发过程记录、实验性功能、工作区备份
- **特点**: 包含所有开发文件、配置、临时代码、文档草稿、开发日志
- **访问权限**: 团队内部开发者
- **分支策略**: 支持全部开发分支和实验分支

### 🚀 **发布仓库** (release)
- **地址**: https://github.com/Coregentis/MPLP-Protocol
- **用途**: 纯净发布版本、用户下载、社区贡献、生产部署
- **特点**: 只包含生产就绪代码、正式文档、稳定版本
- **访问权限**: 公开访问、接受 Pull Request
- **分支策略**: 仅main分支和release分支

---

## 🔄 开发工作流程（基于Roadmap v1.0阶段）

### 📝 **日常开发流程 (推送到 Dev 仓库)**

#### **1. 阶段性开发 (按Roadmap 5个阶段)**
```bash
# 第一阶段: 核心架构实现 (第1-2周)
git checkout -b stage-1/core-architecture
git add .
git commit -m "feat(architecture): implement basic project structure

- Set up 6 core modules directory structure
- Configure TypeScript 5.0+ strict mode
- Implement basic Express.js server framework
- Add PostgreSQL 14+ and Redis 7+ configuration

Stage: 1/5 - Core Architecture Implementation
Timeline: Week 1-2 (2025-07-09 to 2025-07-23)"

git push origin stage-1/core-architecture

# 第二阶段: 核心模块实现 (第3-6周)
git checkout -b stage-2/core-modules
git add .
git commit -m "feat(modules): implement Context and Plan modules

- Complete Context module with state management
- Implement Plan module with task orchestration
- Add unit tests with 90%+ coverage
- Performance: Context queries <5ms, Plan parsing <8ms

Stage: 2/5 - Core Modules Implementation  
Timeline: Week 3-6 (2025-07-24 to 2025-08-20)"

git push origin stage-2/core-modules
```

#### **2. 功能模块开发**
```bash
# Context模块开发
git checkout -b feature/context-module
git add .
git commit -m "feat(context): implement global state management

- Add context protocol interface and JSON schema
- Implement CRUD operations with TypeORM
- Add Redis caching for hot context data
- Achieve target performance: state query <5ms
- Unit test coverage: 95%

Module: Context (1/6)
Performance: ✅ State query <5ms, ✅ State update <10ms
Tests: ✅ 95% coverage, ✅ All integration tests pass"

git push origin feature/context-module

# Plan模块开发
git checkout -b feature/plan-module
git add .
git commit -m "feat(plan): implement task planning structure

- Add plan protocol with dependency resolution
- Support sequential/parallel/conditional execution
- Implement task queue and scheduler
- Performance: plan parsing <8ms, execution <15ms
- Unit test coverage: 93%

Module: Plan (2/6)
Features: ✅ Dependency resolution, ✅ Multi-execution modes
Performance: ✅ Plan parsing <8ms, ✅ Scheduling <15ms"

git push origin feature/plan-module
```

#### **3. 集成开发阶段**
```bash
# API层开发
git checkout -b feature/api-layer
git add .
git commit -m "feat(api): implement REST and GraphQL endpoints

- Complete REST API for all 6 core modules
- Add GraphQL schema with complex queries
- Implement WebSocket for real-time communication
- Add authentication and RBAC authorization
- Performance: API response P95 <100ms

Stage: 3/5 - Integration and API Layer
APIs: ✅ REST endpoints, ✅ GraphQL schema, ✅ WebSocket
Security: ✅ JWT auth, ✅ RBAC permissions
Performance: ✅ P95 <100ms"

git push origin feature/api-layer
```

### 🚀 **里程碑发布流程 (重要节点备份)**

#### **1. 阶段完成标记**
```bash
# 第一阶段完成
git add .
git commit -m "milestone: Stage 1 Complete - Core Architecture Implementation

✅ COMPLETED DELIVERABLES:
- Project skeleton with 6 core modules structure  
- Database models (PostgreSQL 14+ + TypeORM)
- Basic Express.js server with security middleware
- Core protocol framework and TypeScript interfaces
- Logging and error handling framework

✅ PERFORMANCE VERIFIED:
- TypeScript compilation: 0 errors
- Code quality: ESLint + Prettier passes
- Basic server startup: <3 seconds

✅ STAGE TIMELINE:
- Started: 2025-07-09
- Completed: 2025-07-23 (on schedule)
- Duration: 2 weeks (as planned in Roadmap v1.0)

Next Stage: Stage 2 - Core Modules Implementation (Week 3-6)"

git tag -a v1.0.0-stage1 -m "Stage 1 Complete: Core Architecture"
git push origin main --tags

# 主要里程碑发布
git add .
git commit -m "milestone: Alpha Release - 6 Core Modules Complete

✅ MAJOR ACHIEVEMENTS:
- All 6 core modules implemented and tested
- Context: Global state management ✅
- Plan: Task planning and orchestration ✅  
- Confirm: Validation and approval workflows ✅
- Trace: Operation tracking and monitoring ✅
- Role: RBAC and permission management ✅
- Extension: Plugin framework and integrations ✅

✅ PERFORMANCE BENCHMARKS MET:
- API response time: P95 85ms (target <100ms) ✅
- Protocol parsing: 7ms average (target <10ms) ✅
- System throughput: 12,000 TPS (target >10,000) ✅
- Test coverage: 94% unit, 87% integration ✅

✅ SECURITY AUDIT PASSED:
- 0 high-severity vulnerabilities ✅
- JWT authentication implemented ✅
- RBAC authorization active ✅
- TLS 1.3 enforced ✅

Ready for Stage 3: Integration and API Layer
Timeline: On track with Roadmap v1.0 (Week 7-8)"

git tag -a v1.0.0-alpha.1 -m "Alpha Release: 6 Core Modules Complete"
git push origin main --tags
```

### 🎯 **发布流程 (推送到 Release 仓库)**

#### **1. 发布准备阶段**
```bash
# 创建发布分支
git checkout -b release/v1.0.0

# 清理开发文件和配置
# - 移除 .env.example 中的开发配置
# - 清理临时文档和开发日志
# - 确保 README.md 面向最终用户
# - 生成生产环境配置示例

# 更新版本信息
npm version 1.0.0 --no-git-tag-version

# 提交发布准备
git add .
git commit -m "release: prepare MPLP v1.0.0 for production release

🎯 RELEASE BASED ON ROADMAP V1.0:
- Complete 5-stage development process (12 weeks)
- All Roadmap milestones achieved on schedule
- Technical stack matches Roadmap specifications

🚀 CORE FEATURES:
- 6 Core Modules: Context/Plan/Confirm/Trace/Role/Extension
- Multi-platform integration: TracePilot + Coregentis
- Complete API suite: REST + GraphQL + WebSocket
- Production-ready deployment with Docker + Kubernetes

📊 PERFORMANCE ACHIEVEMENTS:
- API Response: P95 <100ms, P99 <200ms ✅
- Protocol Parsing: <10ms average ✅  
- System Throughput: >10,000 TPS ✅
- System Availability: 99.9% ✅

🛡️ SECURITY & QUALITY:
- 0 high-severity vulnerabilities ✅
- Test Coverage: 94% unit, 87% integration, 67% E2E ✅
- TLS 1.3 + JWT + RBAC security stack ✅
- Complete audit trail and monitoring ✅

📋 PRODUCTION READY:
- Docker containerization optimized
- Kubernetes deployment manifests
- Monitoring and alerting configured
- Documentation complete and user-friendly
- Installation and deployment guides

Timeline: Completed 2025-10-01 (exactly as planned in Roadmap v1.0)"
```

#### **2. 发布到生产仓库**
```bash
# 推送到发布仓库
git push release release/v1.0.0:main

# 创建正式发布标签
git tag -a v1.0.0 -m "MPLP v1.0.0 - Multi-Agent Project Lifecycle Protocol

🎯 BASED ON ROADMAP V1.0 SPECIFICATIONS
Complete implementation of MPLP Protocol following the 12-week development roadmap.

🚀 MAJOR FEATURES:
✅ 6 Core Modules Implementation:
   - Context: Global state management and synchronization
   - Plan: Task planning with dependency resolution  
   - Confirm: Validation and approval workflows
   - Trace: Distributed tracing and performance monitoring
   - Role: RBAC permission management with inheritance
   - Extension: Plugin framework with hot-swap capability

✅ Multi-Platform Integration:
   - TracePilot: Seamless tracing data synchronization
   - Coregentis: Enterprise platform services integration
   - Vendor-neutral architecture preventing lock-in

✅ Complete API Stack:
   - REST API: Full CRUD operations for all modules
   - GraphQL: Complex queries and real-time subscriptions
   - WebSocket: Real-time communication and state updates

🔧 TECHNICAL SPECIFICATIONS:
- Runtime: Node.js 18+ LTS
- Language: TypeScript 5.0+ (strict mode, 100% type coverage)
- Database: PostgreSQL 14+ with TypeORM + Redis 7+ cache
- Security: TLS 1.3 + JWT + OAuth 2.0 + RBAC
- Containerization: Docker + Kubernetes ready

📊 PERFORMANCE METRICS:
- API Response Time: P95 <100ms, P99 <200ms  
- Protocol Parsing: <10ms average
- System Throughput: >10,000 TPS
- Concurrent Users: >1000 supported
- System Availability: 99.9%

🧪 QUALITY ASSURANCE:
- Unit Test Coverage: 94%
- Integration Test Coverage: 87%  
- E2E Test Coverage: 67%
- Security: 0 high-severity vulnerabilities
- Code Quality: ESLint + Prettier + TypeScript strict

🛡️ SECURITY FEATURES:
- End-to-end encryption with TLS 1.3
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) with fine-grained permissions
- API rate limiting and DDoS protection
- Complete audit logging and compliance

📦 DEPLOYMENT OPTIONS:
- Docker containers with multi-stage builds
- Kubernetes deployment with auto-scaling
- Cloud-native deployment (AWS/Azure/GCP)
- On-premises installation support

📚 DOCUMENTATION:
- Complete API documentation (OpenAPI 3.0)
- Integration guides for TracePilot and Coregentis
- Installation and deployment guides
- Developer documentation and examples
- User guides and best practices

🔄 BREAKING CHANGES FROM v0.x:
- Complete protocol redesign based on 6-module architecture
- New authentication and authorization system
- Updated API endpoints following RESTful standards
- Enhanced security requirements

See CHANGELOG.md for detailed migration guide.

Development Timeline: 2025-07-09 to 2025-10-01 (12 weeks as planned)
Roadmap Compliance: 100% - All milestones achieved on schedule"

git push release v1.0.0
```

#### **3. GitHub Release 创建**
在 GitHub Release 页面创建正式发布：
- **标题**: `MPLP v1.0.0 - Multi-Agent Project Lifecycle Protocol`
- **描述**: 基于Roadmap v1.0的完整功能实现
- **标签**: `production-ready`, `roadmap-v1.0-complete`, `enterprise-grade`
- **附件**: 
  - 二进制包和源码包
  - Docker 镜像信息和部署脚本
  - API 文档和集成指南
  - 安装和配置指南

---

## 📋 分支策略（基于Roadmap开发阶段）

### **开发仓库 (Dev) 分支架构**
```
main                           # 主开发分支，同步最新稳定代码
├── develop                    # 集成分支，所有功能合并点
├── stage-1/core-architecture  # 第一阶段：核心架构实现
├── stage-2/core-modules       # 第二阶段：6个核心模块实现
├── stage-3/integration-api    # 第三阶段：集成和API层
├── stage-4/testing-docs       # 第四阶段：测试和文档
├── stage-5/release-prep       # 第五阶段：发布准备
├── feature/context            # Context模块功能分支
├── feature/plan              # Plan模块功能分支  
├── feature/confirm           # Confirm模块功能分支
├── feature/trace             # Trace模块功能分支
├── feature/role              # Role模块功能分支
├── feature/extension         # Extension模块功能分支
├── feature/tracepilot-integration  # TracePilot集成分支
├── feature/coregentis-integration  # Coregentis集成分支
├── experiment/performance    # 性能优化实验分支
├── experiment/security       # 安全加固实验分支
├── docs/api-update          # API文档更新分支
└── bugfix/critical-issue    # 关键Bug修复分支
```

### **发布仓库 (Release) 分支架构**
```
main                          # 稳定发布分支，仅生产就绪代码
├── release/v1.0.0           # v1.0.0发布准备分支
├── release/v1.1.0           # v1.1.0发布准备分支
├── hotfix/v1.0.1            # v1.0.1紧急修复分支
└── docs/user-guide          # 用户文档发布分支
```

---

## 🔧 Git 操作命令集

### **环境初始化和远程配置**
```bash
# 检查当前远程仓库配置
git remote -v

# 添加双仓库配置
git remote add origin https://github.com/Coregentis/MPLP-Protocol-Dev.git
git remote add release https://github.com/Coregentis/MPLP-Protocol.git

# 验证远程配置
git remote -v
# 应该显示:
# origin   https://github.com/Coregentis/MPLP-Protocol-Dev.git (fetch)
# origin   https://github.com/Coregentis/MPLP-Protocol-Dev.git (push)  
# release  https://github.com/Coregentis/MPLP-Protocol.git (fetch)
# release  https://github.com/Coregentis/MPLP-Protocol.git (push)
```

### **日常开发工作流**
```bash
# 开始新功能开发 (基于当前阶段)
git checkout -b feature/context-state-management
git add .
git commit -m "feat(context): implement state persistence mechanism

- Add state serialization and deserialization
- Implement Redis-based state caching
- Add state conflict resolution
- Performance: state operations <5ms

Module: Context (1/6) - State Management
Tests: ✅ Unit tests 95% coverage"

git push origin feature/context-state-management

# 每日进度备份
git add .
git commit -m "daily: progress on context module state management

- Implemented basic state CRUD operations
- Added Redis integration for caching
- Working on conflict resolution algorithm
- Next: Add unit tests and performance optimization

Status: 70% complete, on track for stage 2 milestone"

git push origin feature/context-state-management
```

### **阶段性集成流程**
```bash
# 阶段完成后合并到develop
git checkout develop
git pull origin develop
git merge feature/context-state-management
git commit -m "integrate: Context module state management complete

✅ Context Module Integration:
- State management fully implemented
- Redis caching active and tested  
- Performance targets met: <5ms operations
- Unit test coverage: 95%
- Integration tests: 100% pass

Ready for Stage 2 integration with Plan module"

git push origin develop

# 阶段性标签创建
git tag -a stage-2-context-complete -m "Stage 2: Context module implementation complete"
git push origin stage-2-context-complete
```

### **发布准备流程**
```bash
# 从develop创建发布分支
git checkout -b release/v1.0.0 develop

# 发布版本准备
npm run build:production
npm run test:full-suite
npm run lint:strict
npm run security:scan

# 更新版本和变更日志
npm version 1.0.0 --no-git-tag-version
git add CHANGELOG.md package.json package-lock.json
git commit -m "release: bump version to 1.0.0 and update changelog"

# 推送到发布仓库
git push release release/v1.0.0:main
git tag -a v1.0.0 -m "Release v1.0.0 based on Roadmap v1.0"
git push release v1.0.0
```

### **紧急修复流程 (Hotfix)**
```bash
# 从发布仓库main分支创建热修复
git fetch release
git checkout -b hotfix/v1.0.1 release/main

# 修复关键bug
git add .
git commit -m "hotfix: fix critical security vulnerability in JWT validation

CVE-2025-XXXX: JWT signature bypass vulnerability
- Strengthen JWT signature validation  
- Add additional input sanitization
- Update security dependencies
- Add regression tests

Security: ✅ Vulnerability patched
Tests: ✅ Security regression tests added
Performance: No impact on response times"

# 推送热修复到发布仓库
git push release hotfix/v1.0.1
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical security patch"
git push release v1.0.1

# 同步回开发仓库
git checkout main  
git merge hotfix/v1.0.1
git push origin main
```

---

## 📚 提交信息规范（Conventional Commits + MPLP扩展）

### **提交格式模板**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **MPLP特有提交类型**
- **protocol**: MPLP协议定义变更
- **module**: 核心模块实现变更
- **integration**: 平台集成相关变更
- **roadmap**: Roadmap相关的规划调整
- **stage**: 开发阶段相关的提交

### **作用域 (Scope) 规范**
```
# 核心模块作用域
context:     Context模块相关
plan:        Plan模块相关  
confirm:     Confirm模块相关
trace:       Trace模块相关
role:        Role模块相关
extension:   Extension模块相关

# 系统层作用域
api:         API层变更
database:    数据库相关
auth:        认证授权
monitor:     监控相关
deploy:      部署相关

# 集成作用域  
tracepilot:  TracePilot集成
coregentis:  Coregentis集成
platform:    平台无关集成

# 阶段作用域
stage-1:     第一阶段：核心架构
stage-2:     第二阶段：核心模块
stage-3:     第三阶段：集成API  
stage-4:     第四阶段：测试文档
stage-5:     第五阶段：发布准备
```

### **详细提交示例**
```bash
# 功能开发提交
git commit -m "feat(context): implement distributed state synchronization

- Add cross-system state sync mechanism
- Implement conflict resolution using vector clocks
- Add state replication across multiple nodes
- Performance: sync latency <50ms P95

Module: Context (1/6) - Distributed State Management
Integration: Compatible with TracePilot state tracking  
Performance: ✅ Sync <50ms, ✅ Memory usage <100MB
Tests: ✅ 96% unit coverage, ✅ Integration tests pass

Closes #234, Related to Roadmap Stage 2 milestone"

# 阶段完成提交  
git commit -m "stage(stage-2): complete all 6 core modules implementation

✅ STAGE 2 COMPLETION SUMMARY:
All 6 core modules implemented according to Roadmap v1.0 specifications

✅ MODULES DELIVERED:
- Context: Global state management with Redis caching
- Plan: Task orchestration with dependency resolution
- Confirm: Approval workflows with auto-approval rules  
- Trace: Distributed tracing with performance monitoring
- Role: RBAC with inheritance and dynamic permissions
- Extension: Plugin framework with hot-swap support

✅ PERFORMANCE VERIFIED:
- Context operations: 4ms avg (target <5ms) ✅
- Plan parsing: 7ms avg (target <8ms) ✅  
- Confirm decisions: 2ms avg (target <3ms) ✅
- Trace recording: 1.5ms avg (target <2ms) ✅
- Role resolution: 0.8ms avg (target <1ms) ✅
- Extension calls: 45ms avg (target <50ms) ✅

✅ QUALITY METRICS:
- Combined unit test coverage: 94%
- Integration test coverage: 89%  
- Security scan: 0 high-severity issues
- Performance benchmarks: All targets exceeded

Timeline: Completed Week 6 (on schedule with Roadmap v1.0)
Next: Stage 3 - Integration and API Layer (Week 7-8)"

# 集成相关提交
git commit -m "integration(tracepilot): implement bidirectional trace sync

- Add TracePilot API adapter with authentication
- Implement real-time trace data synchronization  
- Add format conversion between MPLP and TracePilot schemas
- Add error handling and retry logic for network failures

Platform: TracePilot v2.1+ compatibility
Integration: ✅ Bidirectional sync, ✅ Real-time updates
Performance: ✅ Sync latency <100ms, ✅ Batch sync <500ms  
Security: ✅ OAuth 2.0 auth, ✅ TLS 1.3 transport

Related to Stage 3: Integration and API Layer milestone"

# 紧急修复提交
git commit -m "hotfix(security): patch JWT token validation bypass

CVE-2025-1234: Critical security vulnerability in JWT verification
- Fix signature validation bypass in expired token handling
- Add strict signature verification for all token states  
- Implement additional input validation and sanitization
- Add security headers and rate limiting enhancements

Security Level: CRITICAL (CVSS 9.1)
Fix Verification: ✅ Vulnerability patched, ✅ Regression tests added
Performance Impact: <2ms additional validation overhead
Backwards Compatibility: ✅ No breaking changes

Fixes #567, Security advisory SA-2025-001"
```

---

## 🔍 代码审查工作流

### **Pull Request 工作流程**
```bash
# 1. 功能开发完成后创建PR
git push origin feature/context-state-sync

# 2. 在GitHub创建Pull Request
# Title: feat(context): implement distributed state synchronization
# Base: develop ← Compare: feature/context-state-sync

# 3. PR描述模板
## 📋 变更摘要
实现Context模块的分布式状态同步功能，支持跨系统状态一致性管理。

## 🎯 Roadmap对齐
- ✅ 符合Stage 2: 核心模块实现阶段要求
- ✅ 满足Context模块性能指标：状态操作<5ms  
- ✅ 集成TracePilot状态追踪支持

## 🔧 技术实现
- 基于Redis的分布式状态存储
- 向量时钟冲突解决算法
- WebSocket实时状态更新推送
- 状态版本控制和历史追踪

## 📊 性能验证
- 状态同步延迟: 45ms P95 (目标<50ms) ✅
- 内存使用: 85MB (预算<100MB) ✅  
- 并发处理: 1200+ operations/sec ✅

## ✅ 检查清单
- [x] 单元测试覆盖率≥90% (实际96%)
- [x] 集成测试全部通过
- [x] 性能基准测试达标
- [x] 安全扫描无高危漏洞
- [x] API文档已更新
- [x] 符合TypeScript严格模式
- [x] ESLint和Prettier检查通过

## 🔗 相关Issue  
Closes #234, Related to Roadmap Stage 2 Context module milestone
```

### **代码审查检查项**
```bash
# 审查者检查清单
## 🎯 Roadmap符合性
- [ ] 符合当前开发阶段要求
- [ ] 实现与Roadmap规范一致
- [ ] 性能目标达成验证

## 🔧 技术质量  
- [ ] TypeScript严格模式无错误
- [ ] 单元测试覆盖率≥90%
- [ ] 集成测试通过
- [ ] 性能基准达标

## 🛡️ 安全检查
- [ ] 输入验证和清理
- [ ] 权限和认证检查  
- [ ] 安全扫描通过
- [ ] 敏感数据保护

## 📚 文档完整性
- [ ] API文档更新
- [ ] 代码注释充分
- [ ] CHANGELOG条目添加
- [ ] 架构影响评估
```

---

## 📊 Git 工作流监控和指标

### **开发进度跟踪**
```bash
# 查看当前阶段进度
git log --oneline --grep="stage-2" --since="2025-07-24" --until="2025-08-20"

# 统计各模块开发进度
git log --oneline --grep="feat(context)" --count
git log --oneline --grep="feat(plan)" --count  
git log --oneline --grep="feat(confirm)" --count
git log --oneline --grep="feat(trace)" --count
git log --oneline --grep="feat(role)" --count
git log --oneline --grep="feat(extension)" --count

# 查看阶段性里程碑
git tag -l "stage-*" --sort=-version:refname
git tag -l "v*" --sort=-version:refname
```

### **质量指标监控**
```bash
# 检查提交质量
git log --oneline --since="1 week ago" | grep -E "(feat|fix|docs|test|refactor)"

# 统计各类型提交
git log --oneline --since="1 month ago" | grep "feat(" | wc -l
git log --oneline --since="1 month ago" | grep "fix(" | wc -l  
git log --oneline --since="1 month ago" | grep "test(" | wc -l

# 检查分支健康度
git branch -r --merged origin/develop
git branch -r --no-merged origin/develop
```

### **发布准备度评估**
```bash
# 检查发布就绪性
npm run test:coverage  # 确保测试覆盖率≥90%
npm run build:production  # 确保生产构建成功
npm run lint:strict  # 确保代码质量检查通过
npm run security:audit  # 确保安全扫描通过

# 验证Roadmap里程碑完成度
git log --grep="milestone:" --oneline --since="2025-07-09"
git tag -l "*stage*" --sort=version:refname
```

---

## 🔗 相关资源和支持

### **Git工作流工具**
- **GitHub CLI**: `gh pr create`, `gh pr review`, `gh release create`
- **Git Flow工具**: `git flow feature start`, `git flow release start`  
- **Conventional Commits工具**: `commitizen`, `semantic-release`
- **代码质量检查**: `husky`, `lint-staged`, `commitlint`

### **自动化工作流**
```yaml
# .github/workflows/roadmap-compliance.yml
name: Roadmap Compliance Check
on: [push, pull_request]
jobs:
  roadmap-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check Stage Compliance
        run: |
          # 检查提交是否符合当前阶段要求
          # 验证性能基准是否达标  
          # 确保测试覆盖率满足要求
```

### **团队协作资源**
- **项目看板**: GitHub Projects with Roadmap v1.0 milestones
- **代码审查指南**: [CONTRIBUTING.md](./ProjectRules/CONTRIBUTING.md)
- **技术标准**: [技术规范统一标准.md](./requirements-docs/技术规范统一标准.md)
- **开发指南**: [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)

### **联系和支持**
- **技术支持**: mplp-support@coregentis.com
- **Git工作流问题**: git-workflow@coregentis.com  
- **Roadmap相关**: roadmap@coregentis.com
- **紧急支持**: emergency@coregentis.com

---

**Git工作流版本**: v2.1  
**维护团队**: Coregentis MPLP项目团队  
**更新周期**: 每个开发阶段开始时更新  
**最后更新**: 2025-07-09 (与Roadmap v1.0完全同步) 