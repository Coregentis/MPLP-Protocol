# MPLP v1.0 质量管理结构标准

## 📁 **标准化目录结构**

### **质量管理根目录: `quality/`**

```
quality/
├── configs/                    # 质量配置文件
│   ├── tsconfig/              # TypeScript配置
│   │   ├── tsconfig.context.json
│   │   ├── tsconfig.plan.json
│   │   └── tsconfig.confirm.json
│   ├── eslint/                # ESLint配置 (未来扩展)
│   └── jest/                  # Jest配置 (未来扩展)
├── scripts/                   # 质量门禁脚本
│   ├── modules/               # 模块专用脚本
│   │   ├── context/
│   │   │   └── validate-context-module.sh
│   │   ├── plan/
│   │   │   ├── validate-plan-module.sh
│   │   │   └── check-plan-module-quality.sh
│   │   └── confirm/
│   │       └── validate-confirm-module.sh
│   ├── shared/                # 共享脚本
│   │   └── validate-all-modules.sh
│   └── ci/                    # CI/CD脚本 (未来扩展)
├── reports/                   # 质量报告
│   ├── context/
│   ├── plan/
│   ├── confirm/
│   └── validation-results/    # 历史验证结果
└── docs/                      # 质量文档
    ├── standards/
    │   └── quality-management-structure.md (本文档)
    ├── processes/             # 质量流程文档 (未来扩展)
    └── modules/               # 模块质量文档 (未来扩展)
```

## 🎯 **设计原则**

### **1. 模块化管理**
- 每个模块有独立的质量配置和脚本
- 避免模块间质量检查的相互干扰
- 支持模块级别的质量门禁

### **2. 统一的工具目录**
- 所有质量工具集中在 `quality/` 目录下
- 避免根目录文件污染
- 便于维护和管理

### **3. 清晰的层次结构**
- 配置、脚本、报告、文档分离
- 模块专用和共享工具分离
- 历史数据和当前状态分离

### **4. 标准化命名**
- 统一的文件和目录命名规范
- 模块名称一致性
- 脚本功能明确性

## 🛠️ **使用方法**

### **单模块验证**
```bash
# Context模块
bash quality/scripts/modules/context/validate-context-module.sh

# Plan模块
bash quality/scripts/modules/plan/validate-plan-module.sh

# Confirm模块
bash quality/scripts/modules/confirm/validate-confirm-module.sh
```

### **全模块验证**
```bash
# 验证所有已完成模块
bash quality/scripts/shared/validate-all-modules.sh
```

### **TypeScript编译检查**
```bash
# 单模块编译检查
npx tsc --project quality/configs/tsconfig/tsconfig.context.json --noEmit
npx tsc --project quality/configs/tsconfig/tsconfig.plan.json --noEmit
npx tsc --project quality/configs/tsconfig/tsconfig.confirm.json --noEmit
```

## 📊 **质量标准**

### **模块级质量门禁**
1. **TypeScript编译**: 0错误
2. **ESLint检查**: 0错误，0警告
3. **零技术债务**: 无any类型，无TODO/FIXME
4. **双重命名约定**: Schema-TypeScript映射一致
5. **测试覆盖率**: 模块测试文件存在
6. **Mapper完整性**: toSchema/fromSchema方法完整

### **项目级质量门禁**
1. **全模块通过率**: 100%
2. **质量评分**: 100/100
3. **CI/CD集成**: 自动化质量检查
4. **持续监控**: 质量趋势跟踪

## 🔄 **维护指南**

### **添加新模块**
1. 创建模块专用目录: `quality/scripts/modules/{module_name}/`
2. 创建TypeScript配置: `quality/configs/tsconfig/tsconfig.{module_name}.json`
3. 创建验证脚本: `quality/scripts/modules/{module_name}/validate-{module_name}-module.sh`
4. 更新全模块验证脚本: `quality/scripts/shared/validate-all-modules.sh`

### **更新质量标准**
1. 更新模块验证脚本
2. 更新TypeScript配置
3. 更新文档
4. 验证所有模块

---

**文档版本**: v1.0.0  
**创建时间**: 2025-08-19  
**基于**: 系统性链式批判性思维+GLFB+统一方法论+plan-confirm-trace-delivery流程  
**维护者**: MPLP质量管理团队
