#!/bin/bash

# Plan模块质量检查脚本
# 基于plan-TDD-refactor-plan.md的质量门禁要求

echo "🔍 Plan模块质量门禁检查开始..."

# 设置错误计数
ERROR_COUNT=0

# 1. TypeScript编译检查 (ZERO ERRORS)
echo "📋 1. TypeScript编译检查..."
if ! npx tsc --noEmit --project tsconfig.json 2>/dev/null; then
    echo "❌ TypeScript编译存在错误"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ TypeScript编译通过"
fi

# 2. ESLint代码质量检查 (ZERO WARNINGS)
echo "📋 2. ESLint代码质量检查..."
if ! npx eslint "src/modules/plan/**/*.ts" --quiet; then
    echo "❌ ESLint检查存在警告或错误"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ ESLint检查通过"
fi

# 3. Plan模块单元测试 (100% PASS)
echo "📋 3. Plan模块单元测试..."
if ! npm run test:unit:plan 2>/dev/null; then
    echo "❌ Plan模块单元测试失败"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Plan模块单元测试通过"
fi

# 4. Schema映射一致性检查 (100% CONSISTENCY)
echo "📋 4. Schema映射一致性检查..."
if ! npm run validate:mapping:plan 2>/dev/null; then
    echo "❌ Schema映射一致性检查失败"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Schema映射一致性检查通过"
fi

# 5. 双重命名约定检查 (100% COMPLIANCE)
echo "📋 5. 双重命名约定检查..."
if ! npm run check:naming:plan 2>/dev/null; then
    echo "❌ 双重命名约定检查失败"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ 双重命名约定检查通过"
fi

# 总结
echo ""
echo "🎯 Plan模块质量门禁检查结果:"
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ 所有质量门禁检查通过 (5/5)"
    echo "🎉 Plan模块达到企业级质量标准"
    exit 0
else
    echo "❌ 质量门禁检查失败: $ERROR_COUNT/5 项未通过"
    echo "🚨 需要修复错误后重新检查"
    exit 1
fi
