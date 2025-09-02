#!/bin/bash
# MPLP模块质量门禁检查脚本 v3.0
# 基于Context模块TDD重构成功经验制定
# 
# 用法: ./check-module-quality.sh <module_name>
# 示例: ./check-module-quality.sh context

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "❌ 错误: 请提供模块名称"
  echo "用法: $0 <module_name>"
  echo "示例: $0 context"
  exit 1
fi

echo "🚀 开始检查模块: $MODULE_NAME"
echo "==================================="

# 检查模块目录是否存在
if [ ! -d "src/modules/$MODULE_NAME" ]; then
  echo "❌ 错误: 模块目录不存在: src/modules/$MODULE_NAME"
  exit 1
fi

TOTAL_ERRORS=0

echo ""
echo "📋 阶段1: TypeScript编译检查"
echo "-----------------------------------"
TS_ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep "src/modules/$MODULE_NAME" | wc -l)
if [ $TS_ERRORS -gt 0 ]; then
  echo "❌ 发现 $TS_ERRORS 个TypeScript错误"
  echo "详细错误信息:"
  npx tsc --noEmit --project . 2>&1 | grep "src/modules/$MODULE_NAME"
  TOTAL_ERRORS=$((TOTAL_ERRORS + TS_ERRORS))
else
  echo "✅ TypeScript编译检查通过 (0错误)"
fi

echo ""
echo "📋 阶段2: ESLint代码质量检查"
echo "-----------------------------------"
ESLINT_WARNINGS=$(npx eslint src/modules/$MODULE_NAME --ext .ts 2>&1 | grep -c "warning\|error" || true)
if [ $ESLINT_WARNINGS -gt 0 ]; then
  echo "❌ 发现 $ESLINT_WARNINGS 个ESLint警告/错误"
  echo "详细警告信息:"
  npx eslint src/modules/$MODULE_NAME --ext .ts
  TOTAL_ERRORS=$((TOTAL_ERRORS + ESLINT_WARNINGS))
else
  echo "✅ ESLint代码质量检查通过 (0警告)"
fi

echo ""
echo "📋 阶段3: 版本一致性检查"
echo "-----------------------------------"
VERSION_ISSUES=$(find src/modules/$MODULE_NAME -name "*.ts" -exec grep -l "v2\|V2\|version.*2" {} \; | wc -l)
if [ $VERSION_ISSUES -gt 0 ]; then
  echo "❌ 发现 $VERSION_ISSUES 个版本不一致文件"
  echo "问题文件列表:"
  find src/modules/$MODULE_NAME -name "*.ts" -exec grep -l "v2\|V2\|version.*2" {} \;
  TOTAL_ERRORS=$((TOTAL_ERRORS + VERSION_ISSUES))
else
  echo "✅ 版本一致性检查通过 (100%统一为v1.0.0)"
fi

echo ""
echo "📋 阶段4: 测试执行检查"
echo "-----------------------------------"
# 检查是否有跳过的测试
TEST_OUTPUT=$(npm test -- --testPathPattern="$MODULE_NAME" --verbose 2>&1)
TEST_EXIT_CODE=$?
SKIPPED_TESTS=$(echo "$TEST_OUTPUT" | grep -c "skipped\|pending" || true)

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "❌ 测试执行失败"
  echo "$TEST_OUTPUT" | tail -20
  TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
elif [ $SKIPPED_TESTS -gt 0 ]; then
  echo "❌ 发现 $SKIPPED_TESTS 个跳过的测试"
  echo "跳过的测试列表:"
  echo "$TEST_OUTPUT" | grep "skipped\|pending"
  TOTAL_ERRORS=$((TOTAL_ERRORS + SKIPPED_TESTS))
else
  echo "✅ 测试执行检查通过 (无跳过测试)"
fi

echo ""
echo "📋 阶段5: 测试覆盖率检查"
echo "-----------------------------------"
# 运行覆盖率检查
npm test -- --testPathPattern="$MODULE_NAME" --coverage --silent > /dev/null 2>&1
COVERAGE_EXIT_CODE=$?

if [ $COVERAGE_EXIT_CODE -eq 0 ] && [ -f coverage/lcov-report/index.html ]; then
  # 尝试从coverage-summary.json读取覆盖率
  if [ -f coverage/coverage-summary.json ]; then
    COVERAGE_PERCENT=$(node -e "
      const fs = require('fs');
      try {
        const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const total = coverage.total;
        if (total && total.statements) {
          console.log(Math.round(total.statements.pct));
        } else {
          console.log('0');
        }
      } catch (e) {
        console.log('0');
      }
    ")
    
    if [ $COVERAGE_PERCENT -ge 75 ]; then
      echo "✅ 测试覆盖率检查通过 ($COVERAGE_PERCENT% ≥ 75%)"
    else
      echo "⚠️ 测试覆盖率偏低 ($COVERAGE_PERCENT% < 75%)"
      echo "建议: 补充测试用例以提高覆盖率"
    fi
  else
    echo "⚠️ 无法读取覆盖率数据"
  fi
else
  echo "⚠️ 覆盖率检查失败，请检查测试配置"
fi

echo ""
echo "📋 阶段6: 双重命名约定检查"
echo "-----------------------------------"
# 检查是否存在Mapper文件
MAPPER_FILES=$(find src/modules/$MODULE_NAME -name "*mapper*.ts" | wc -l)
if [ $MAPPER_FILES -gt 0 ]; then
  echo "✅ 发现 $MAPPER_FILES 个Mapper文件"
  
  # 检查Mapper文件中是否包含必要的方法
  MAPPER_METHODS=0
  for mapper_file in $(find src/modules/$MODULE_NAME -name "*mapper*.ts"); do
    if grep -q "toSchema\|fromSchema\|validateSchema" "$mapper_file"; then
      MAPPER_METHODS=$((MAPPER_METHODS + 1))
    fi
  done
  
  if [ $MAPPER_METHODS -gt 0 ]; then
    echo "✅ Mapper方法检查通过"
  else
    echo "⚠️ Mapper文件缺少必要方法 (toSchema, fromSchema, validateSchema)"
  fi
else
  echo "⚠️ 未发现Mapper文件，请确认双重命名约定实现"
fi

echo ""
echo "🎯 质量门禁检查结果"
echo "==================================="
echo "模块名称: $MODULE_NAME"
echo "检查时间: $(date)"
echo "总问题数: $TOTAL_ERRORS"

if [ $TOTAL_ERRORS -eq 0 ]; then
  echo ""
  echo "🎉 恭喜！模块质量门禁检查全部通过！"
  echo "✅ TypeScript编译: 0错误"
  echo "✅ ESLint检查: 0警告"
  echo "✅ 版本一致性: 100%"
  echo "✅ 测试执行: 无跳过"
  echo ""
  echo "📋 模块已达到MPLP v1.0企业级质量标准"
  exit 0
else
  echo ""
  echo "❌ 质量门禁检查未通过，发现 $TOTAL_ERRORS 个问题"
  echo ""
  echo "📋 请修复以上问题后重新运行检查"
  echo "💡 提示: 可以使用以下命令逐个修复问题:"
  echo "   - TypeScript错误: npx tsc --noEmit"
  echo "   - ESLint警告: npx eslint src/modules/$MODULE_NAME --ext .ts --fix"
  echo "   - 版本问题: 手动更新文件中的版本引用"
  echo "   - 测试问题: 创建测试适配器，禁止跳过测试"
  exit 1
fi
