#!/bin/bash

# MPLP模块级质量门禁验证脚本模板 (Plan模块完美质量基准)
# 用途: 验证单个模块的完美质量门禁，基于Plan模块零技术债务标准
# 使用: ./module-quality-gate.sh {module-name}
#
# 🔧 工具使用时机说明:
# 1. TDD重构每个阶段完成后的验证 (零技术债务检查)
# 2. BDD重构每个场景实现后的验证 (完美质量验证)
# 3. 模块重构最终完成前的质量确认 (Plan模块标准)
# 4. CI/CD流水线中的自动化质量检查 (100%类型安全)
# 5. 系统性批判性思维方法论合规验证 (新增)
#
# 📋 相关工具 (基于Plan模块完美质量标准):
# - check-module-quality.sh: 完整的模块质量状态检查 (零技术债务)
# - fix-version-consistency.sh: 版本一致性修复工具
# - test-adapter-template.ts: 测试适配器生成模板 (100%类型安全)
# - bdd-quality-enforcer-template.js: BDD质量执行器 (Plan模块47场景494步骤基准)
# - systematic-critical-thinking-validator.sh: 系统性批判性思维验证器 (新增)

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "❌ 错误: 请提供模块名称"
    echo "使用方法: ./module-quality-gate.sh {module-name}"
    exit 1
fi

MODULE_PATH="src/modules/$MODULE_NAME"

if [ ! -d "$MODULE_PATH" ]; then
    echo "❌ 错误: 模块目录不存在: $MODULE_PATH"
    exit 1
fi

echo "🎯 开始验证 $MODULE_NAME 模块质量门禁"
echo "📁 模块路径: $MODULE_PATH"
echo ""

# ============================================================================
# 模块级质量门禁范围说明 (CRITICAL UPDATE)
# ============================================================================
echo "🎯 模块级质量门禁范围说明 (CRITICAL UPDATE)"
echo ""
echo "📋 Plan模块完美质量标准验证案例 (2025-08-17):"
echo "  ✅ Plan模块TypeScript编译: 0错误 (零技术债务)"
echo "  ✅ Plan模块ESLint检查: 0警告 (完美代码质量)"
echo "  ✅ Plan模块BDD测试: 47场景494步骤100%通过 (完美质量)"
echo "  ✅ 结论: Plan模块达到完美质量标准"
echo "  ✅ 验证方法: find src/modules/plan -name \"*.ts\" -exec npx tsc --noEmit {} \\;"
echo ""
echo "✅ 包含在质量门禁内:"
echo "  - $MODULE_PATH/**/*.ts 的所有TypeScript错误"
echo "  - $MODULE_NAME 模块的ESLint警告和错误"
echo "  - $MODULE_NAME 模块的单元测试通过率"
echo "  - $MODULE_NAME 模块的功能完整性"
echo ""
echo "❌ 不包含在质量门禁内:"
echo "  - 其他模块的TypeScript/ESLint错误"
echo "  - node_modules依赖的类型错误"
echo "  - 项目级别的配置问题"
echo "  - 其他模块的测试失败"
echo ""

# ============================================================================
# 1. 模块专项TypeScript编译检查
# ============================================================================
echo "🔍 1. $MODULE_NAME 模块专项TypeScript编译检查"
echo "命令: find $MODULE_PATH -name \"*.ts\" -exec npx tsc --noEmit {} \\;"

TS_FILES=$(find "$MODULE_PATH" -name "*.ts" | wc -l)
echo "📊 发现 $TS_FILES 个TypeScript文件"

TS_ERRORS=0
if find "$MODULE_PATH" -name "*.ts" -exec npx tsc --noEmit {} \; 2>&1 | grep -q "error TS"; then
    echo "❌ $MODULE_NAME 模块TypeScript编译失败"
    find "$MODULE_PATH" -name "*.ts" -exec npx tsc --noEmit {} \; 2>&1 | grep "error TS" | head -10
    TS_ERRORS=1
else
    echo "✅ $MODULE_NAME 模块TypeScript编译通过 (0错误)"
fi

# ============================================================================
# 2. 模块专项ESLint检查
# ============================================================================
echo ""
echo "🔍 2. $MODULE_NAME 模块专项ESLint检查"
echo "命令: npm run lint -- $MODULE_PATH/**/*.ts"

ESLINT_ERRORS=0
if npm run lint -- "$MODULE_PATH/**/*.ts" 2>&1 | grep -q "error\|warning"; then
    echo "❌ $MODULE_NAME 模块ESLint检查失败"
    npm run lint -- "$MODULE_PATH/**/*.ts" 2>&1 | grep "error\|warning" | head -10
    ESLINT_ERRORS=1
else
    echo "✅ $MODULE_NAME 模块ESLint检查通过 (0警告/错误)"
fi

# ============================================================================
# 3. 模块专项单元测试
# ============================================================================
echo ""
echo "🔍 3. $MODULE_NAME 模块专项单元测试"
echo "命令: npm test -- --testPathPattern=\"tests/modules/$MODULE_NAME\""

TEST_ERRORS=0
if npm test -- --testPathPattern="tests/modules/$MODULE_NAME" --passWithNoTests 2>&1 | grep -q "FAIL\|failed"; then
    echo "❌ $MODULE_NAME 模块单元测试失败"
    npm test -- --testPathPattern="tests/modules/$MODULE_NAME" --passWithNoTests 2>&1 | grep "FAIL\|failed" | head -10
    TEST_ERRORS=1
else
    echo "✅ $MODULE_NAME 模块单元测试通过"
fi

# ============================================================================
# 4. 模块专项Schema映射验证 (如果存在)
# ============================================================================
echo ""
echo "🔍 4. $MODULE_NAME 模块专项Schema映射验证"

MAPPING_ERRORS=0
if [ -f "$MODULE_PATH/api/mappers/$MODULE_NAME.mapper.ts" ]; then
    echo "发现Mapper文件，执行映射验证..."
    if npm run validate:mapping -- --module="$MODULE_NAME" 2>&1 | grep -q "error\|failed"; then
        echo "❌ $MODULE_NAME 模块Schema映射验证失败"
        npm run validate:mapping -- --module="$MODULE_NAME" 2>&1 | grep "error\|failed" | head -5
        MAPPING_ERRORS=1
    else
        echo "✅ $MODULE_NAME 模块Schema映射验证通过"
    fi
else
    echo "⚠️  未发现Mapper文件，跳过映射验证"
fi

# ============================================================================
# 5. 模块专项双重命名约定检查 (如果存在)
# ============================================================================
echo ""
echo "🔍 5. $MODULE_NAME 模块专项双重命名约定检查"

NAMING_ERRORS=0
if npm run check:naming -- --module="$MODULE_NAME" 2>&1 | grep -q "error\|failed"; then
    echo "❌ $MODULE_NAME 模块双重命名约定检查失败"
    npm run check:naming -- --module="$MODULE_NAME" 2>&1 | grep "error\|failed" | head -5
    NAMING_ERRORS=1
else
    echo "✅ $MODULE_NAME 模块双重命名约定检查通过"
fi

# ============================================================================
# 6. 模块专项BDD场景验证 (基于Plan模块完美质量标准)
# ============================================================================
echo ""
echo "🔍 6. $MODULE_NAME 模块专项BDD场景验证"

BDD_ERRORS=0
if [ -d "tests/bdd/$MODULE_NAME" ]; then
    echo "发现BDD测试目录，执行BDD场景验证..."
    if npx cucumber-js --require-module ts-node/register --require "tests/bdd/$MODULE_NAME/step-definitions/*.ts" --format progress "tests/bdd/$MODULE_NAME/features/*.feature" 2>&1 | grep -q "failed\|error"; then
        echo "❌ $MODULE_NAME 模块BDD场景验证失败"
        npx cucumber-js --require-module ts-node/register --require "tests/bdd/$MODULE_NAME/step-definitions/*.ts" --format progress "tests/bdd/$MODULE_NAME/features/*.feature" 2>&1 | grep "failed\|error" | head -5
        BDD_ERRORS=1
    else
        echo "✅ $MODULE_NAME 模块BDD场景验证通过 (Plan模块47场景494步骤基准)"
    fi
else
    echo "⚠️  未发现BDD测试目录，跳过BDD验证"
fi

# ============================================================================
# 7. 模块专项零技术债务验证 (Plan模块完美质量要求)
# ============================================================================
echo ""
echo "🔍 7. $MODULE_NAME 模块专项零技术债务验证"

DEBT_ERRORS=0
if grep -r "any\|@ts-ignore\|@ts-nocheck" "$MODULE_PATH" --include="*.ts" 2>/dev/null | grep -v "test\|spec"; then
    echo "❌ $MODULE_NAME 模块发现技术债务 (any类型或TypeScript忽略)"
    grep -r "any\|@ts-ignore\|@ts-nocheck" "$MODULE_PATH" --include="*.ts" 2>/dev/null | grep -v "test\|spec" | head -5
    DEBT_ERRORS=1
else
    echo "✅ $MODULE_NAME 模块零技术债务验证通过 (Plan模块完美质量标准)"
fi

# ============================================================================
# 质量门禁结果汇总 (Plan模块完美质量标准)
# ============================================================================
echo ""
echo "📊 $MODULE_NAME 模块质量门禁结果汇总"
echo "=================================================="

TOTAL_ERRORS=$((TS_ERRORS + ESLINT_ERRORS + TEST_ERRORS + MAPPING_ERRORS + NAMING_ERRORS + BDD_ERRORS + DEBT_ERRORS))

if [ $TS_ERRORS -eq 0 ]; then
    echo "✅ TypeScript编译: 通过"
else
    echo "❌ TypeScript编译: 失败"
fi

if [ $ESLINT_ERRORS -eq 0 ]; then
    echo "✅ ESLint检查: 通过"
else
    echo "❌ ESLint检查: 失败"
fi

if [ $TEST_ERRORS -eq 0 ]; then
    echo "✅ 单元测试: 通过"
else
    echo "❌ 单元测试: 失败"
fi

if [ $MAPPING_ERRORS -eq 0 ]; then
    echo "✅ Schema映射: 通过"
else
    echo "❌ Schema映射: 失败"
fi

if [ $NAMING_ERRORS -eq 0 ]; then
    echo "✅ 命名约定: 通过"
else
    echo "❌ 命名约定: 失败"
fi

if [ $BDD_ERRORS -eq 0 ]; then
    echo "✅ BDD场景验证: 通过"
else
    echo "❌ BDD场景验证: 失败"
fi

if [ $DEBT_ERRORS -eq 0 ]; then
    echo "✅ 零技术债务: 通过 (Plan模块完美质量标准)"
else
    echo "❌ 零技术债务: 失败"
fi

echo "=================================================="

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo "🎉 $MODULE_NAME 模块完美质量门禁验证通过！"
    echo "📈 所有检查项目均达到Plan模块完美质量标准"
    echo "🚀 模块达到零技术债务，可以进入下一阶段开发"
    echo "⭐ 恭喜！模块达到MPLP生态系统完美质量基准"
    exit 0
else
    echo "❌ $MODULE_NAME 模块完美质量门禁验证失败"
    echo "📊 失败项目数: $TOTAL_ERRORS"
    echo "🎯 目标: 达到Plan模块完美质量标准 (零技术债务)"
    echo "🔧 请修复上述问题后重新验证"
    exit 1
fi
