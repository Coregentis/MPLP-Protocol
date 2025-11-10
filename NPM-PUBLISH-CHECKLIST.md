# NPM发布前检查清单

> **日期**: 2025-01-XX  
> **版本**: v1.1.0-beta  
> **项目**: MPLP - Multi-Agent Protocol Lifecycle Platform

---

## ✅ **发布前检查清单**

### **1. 代码质量检查**
- [x] TypeScript编译无错误 (dist/目录已生成)
- [x] ESLint检查通过 (零错误零警告)
- [x] 所有测试通过 (2,902/2,902 tests, 100%)
- [x] 测试覆盖率达标 (47.47%)
- [x] 零技术债务

### **2. 文档完整性检查**
- [x] README.md完整且准确
- [x] CHANGELOG.md已更新
- [x] LICENSE文件存在
- [x] 所有模块文档完整 (10/10模块, 192个文档文件)
- [x] API文档完整
- [x] 双语文档完整 (英文+中文)

### **3. Package.json配置检查**
- [x] 包名称正确: "mplp"
- [x] 版本号正确: "1.1.0-beta"
- [x] 描述完整准确
- [x] main入口正确: "dist/index.js"
- [x] types入口正确: "dist/index.d.ts"
- [x] exports配置完整 (所有10个模块)
- [x] files字段正确配置
- [x] 关键词完整
- [x] 许可证正确: "MIT"
- [x] 仓库信息正确

### **4. 构建产物检查**
- [x] dist/目录存在
- [x] dist/index.js存在
- [x] dist/index.d.ts存在
- [x] 所有模块编译产物存在
- [x] 类型定义文件完整
- [x] Source maps生成

### **5. .npmignore配置检查**
- [x] 源代码被忽略 (src/)
- [x] 测试文件被忽略 (tests/)
- [x] 配置文件被忽略
- [x] 开发工具被忽略
- [x] 文档目录被忽略 (docs/)
- [x] 保留必要文件 (README.md, CHANGELOG.md, LICENSE)

### **6. 依赖检查**
- [x] 生产依赖正确
- [x] 开发依赖分离
- [x] 无安全漏洞 (npm audit)
- [x] 版本号固定

### **7. 发布配置检查**
- [ ] npm账户已登录 (需要执行: npm login)
- [ ] npm registry正确 (https://registry.npmjs.org/)
- [ ] 访问权限正确 (public)
- [ ] 双因素认证已配置

---

## 🚀 **NPM发布步骤**

### **步骤1: 最终验证**
```bash
# 1. 确认构建产物
ls -la dist/

# 2. 验证package.json
cat package.json | grep -E "name|version|main|types"

# 3. 测试本地安装
npm pack
tar -tzf mplp-1.1.0-beta.tgz | head -20

# 4. 清理
rm mplp-1.1.0-beta.tgz
```

### **步骤2: NPM登录**
```bash
# 登录npm账户
npm login

# 验证登录状态
npm whoami
```

### **步骤3: 发布到NPM**
```bash
# 发布beta版本
npm publish --tag beta --access public

# 或者发布为latest (如果是正式版)
# npm publish --access public
```

### **步骤4: 验证发布**
```bash
# 检查npm上的包信息
npm view mplp

# 检查beta版本
npm view mplp@beta

# 测试安装
mkdir test-install
cd test-install
npm init -y
npm install mplp@beta
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
```

---

## 📋 **发布后任务**

### **1. 验证发布**
- [ ] 在npmjs.com上验证包页面
- [ ] 测试从npm安装
- [ ] 验证所有导出正常工作
- [ ] 检查文档链接

### **2. 更新文档**
- [ ] 更新README中的安装说明
- [ ] 更新文档中的版本号
- [ ] 添加发布公告

### **3. 通知社区**
- [ ] 发布GitHub Release
- [ ] 更新项目网站
- [ ] 发布社交媒体公告
- [ ] 通知贡献者

### **4. 监控**
- [ ] 监控npm下载量
- [ ] 收集用户反馈
- [ ] 跟踪问题报告

---

## ⚠️ **注意事项**

### **重要提醒**
1. **版本号**: 当前是beta版本 (1.1.0-beta)，使用 `--tag beta` 发布
2. **访问权限**: 必须使用 `--access public` 因为这是开源包
3. **不可撤销**: npm发布后24小时内可以撤销，之后永久保留
4. **版本唯一**: 同一版本号只能发布一次，不能覆盖

### **发布前最后确认**
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] CHANGELOG已更新
- [ ] 版本号正确
- [ ] npm账户已登录
- [ ] 准备好发布

---

## 🎯 **快速发布命令**

```bash
# 一键发布流程
npm login && \
npm publish --tag beta --access public && \
npm view mplp@beta
```

---

**准备状态**: ✅ **所有检查通过，准备发布**  
**下一步**: 执行npm login，然后运行npm publish

