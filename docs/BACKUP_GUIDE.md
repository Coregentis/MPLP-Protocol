# MPLP 备份系统使用指南

## 🎯 概述

MPLP项目采用多层次、自动化的备份策略，确保开发版本的安全性和可恢复性。

## 📋 备份触发条件

### 🚨 立即备份 (自动触发)

| 触发事件 | 命令/条件 | 保留期 | 说明 |
|---------|-----------|--------|------|
| **版本发布** | `npm version` | 365天 | 发布前自动备份 |
| **重大重构** | `npm run restructure` | 180天 | 重构前自动备份 |
| **生产部署** | 推送到main分支 | 365天 | 部署前自动备份 |
| **开源发布** | `npm run build:public-release` | 365天 | 公开发布前备份 |
| **Schema迁移** | Schema文件变更 | 180天 | 数据结构变更前备份 |

### ⏰ 延迟备份 (5分钟后执行)

| 触发事件 | 条件 | 保留期 | 说明 |
|---------|------|--------|------|
| **功能合并** | PR合并到develop | 90天 | 功能集成后备份 |
| **依赖更新** | package.json变更 | 60天 | 依赖变更后备份 |
| **配置变更** | 配置文件修改 | 60天 | 配置变更后备份 |
| **测试架构** | 测试结构变更 | 90天 | 测试变更后备份 |

### 📅 定时备份

| 类型 | 时间 | 条件 | 保留期 | 说明 |
|------|------|------|--------|------|
| **每日备份** | 每天02:00 UTC | 有变更时 | 30天 | 增量备份 |
| **每周备份** | 周日01:00 UTC | 总是执行 | 90天 | 完整备份 |
| **每月归档** | 每月1号00:00 UTC | 总是执行 | 365天 | 归档备份 |

## 🛠️ 使用方法

### 手动备份

```bash
# 创建手动备份
npm run backup:create manual "手动备份描述"

# 查看所有备份
npm run backup:list

# 恢复指定备份
npm run backup:restore backup-manual-2025-01-31T10-30-00-000Z

# 恢复到指定目录
npm run backup:restore backup-manual-2025-01-31T10-30-00-000Z ./restored-backup
```

### 特定场景备份

```bash
# 版本发布前备份
npm run backup:pre-version 1.0.1

# 重构前备份
npm run backup:pre-refactor "模块重构"

# 部署前备份
npm run backup:pre-deploy production

# 开源发布前备份
npm run backup:pre-public-release 1.0.1
```

### 自动检查备份

```bash
# 检查是否需要备份
npm run backup:auto-check
```

## 🤖 自动化流程

### GitHub Actions触发

#### 定时备份
- 自动按计划执行
- 检查变更后决定是否备份
- 自动清理过期备份

#### 手动触发
```bash
# 在GitHub上手动触发备份
gh workflow run scheduled-backup.yml \
  -f backup_type=manual \
  -f description="紧急备份"
```

### Git钩子集成

备份系统已集成到以下npm脚本中：
- `preversion` - 版本发布前自动备份
- `version` - 更新文档
- `postversion` - 推送标签

## 📊 备份监控

### 查看备份状态

```bash
# 列出最近的备份
npm run backup:list

# 查看备份详情
git tag -l "backup/*" --sort=-version:refname | head -10
```

### 备份健康检查

```bash
# 检查备份完整性
ls -la .backups/

# 检查远程备份标签
git ls-remote --tags origin | grep backup
```

## 🔄 恢复流程

### 紧急恢复

1. **确定恢复点**
   ```bash
   npm run backup:list
   ```

2. **创建当前状态备份**
   ```bash
   npm run backup:create manual "恢复前备份"
   ```

3. **执行恢复**
   ```bash
   npm run backup:restore <backup-id> ./emergency-restore
   ```

4. **验证恢复结果**
   ```bash
   cd emergency-restore
   npm install
   npm test
   ```

### 部分文件恢复

```bash
# 恢复到临时目录
npm run backup:restore <backup-id> ./temp-restore

# 复制需要的文件
cp ./temp-restore/specific-file ./

# 清理临时目录
rm -rf ./temp-restore
```

## 📁 备份内容

### 包含的文件
- 所有源代码
- 配置文件
- 文档和脚本
- Schema定义
- 测试文件

### 排除的文件
- `.git` 目录
- `node_modules` (除月度归档)
- 构建产物 (除特定备份)
- 临时文件
- 日志文件
- 环境变量文件

### 特殊处理
- **月度归档**: 包含完整的node_modules
- **版本发布**: 包含构建产物
- **每日备份**: 仅源代码，高压缩比

## ⚙️ 配置管理

### 备份策略配置
配置文件: `config/backup-strategy.json`

```json
{
  "triggers": {
    "immediate": { ... },
    "delayed": { ... },
    "scheduled": { ... }
  },
  "retention_policy": { ... },
  "storage": { ... }
}
```

### 自定义备份策略

1. **修改触发条件**
   ```bash
   vim config/backup-strategy.json
   ```

2. **更新脚本配置**
   ```bash
   vim scripts/backup-manager.ts
   ```

3. **测试新配置**
   ```bash
   npm run backup:create manual "测试新配置"
   ```

## 🚨 故障排除

### 常见问题

#### 备份失败
```bash
# 检查磁盘空间
df -h

# 检查权限
ls -la .backups/

# 查看错误日志
npm run backup:create manual "测试" 2>&1 | tee backup.log
```

#### 恢复失败
```bash
# 检查备份文件完整性
tar -tzf .backups/backup-xxx.tar.gz | head

# 验证备份元数据
cat .backups/metadata.json | jq '.[-1]'
```

#### 远程同步问题
```bash
# 检查Git状态
git status

# 检查远程连接
git remote -v

# 手动推送标签
git push origin --tags
```

### 应急处理

#### 备份系统故障
1. 停止自动备份
2. 手动创建紧急备份
3. 修复备份系统
4. 恢复自动备份

#### 存储空间不足
1. 清理旧备份
2. 压缩现有备份
3. 迁移到外部存储
4. 调整保留策略

## 📞 支持联系

### 备份相关问题
- **技术支持**: backup-support@coregentis.com
- **紧急恢复**: emergency@coregentis.com
- **系统管理**: devops@coregentis.com

### 相关文档
- [发布流程文档](./RELEASE_PROCESS.md)
- [发布指南](./RELEASE_GUIDE.md)
- [备份策略配置](../config/backup-strategy.json)

---

**注意**: 定期测试备份恢复流程，确保备份系统的可靠性。
