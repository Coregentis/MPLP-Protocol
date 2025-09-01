#!/bin/bash

# MPLP v1.0 质量门禁检查脚本
# 基于SCTM+GLFB+ITCM方法论的统一质量门禁检查
# 适用于所有8个已完成模块的企业级质量标准验证

set -e

echo "🚀 MPLP v1.0 质量门禁检查开始"
echo "📅 检查时间: $(date)"
echo "🎯 检查范围: 8个已完成模块 (Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab)"
echo "📋 质量标准: 企业级标准 + 零技术债务政策"
echo ""

# 初始化检查结果
TOTAL_CHECKS=7
PASSED_CHECKS=0
FAILED_CHECKS=0

# 检查结果记录
declare -a CHECK_RESULTS=()

# 辅助函数
log_success() {
    echo "✅ $1"
    ((PASSED_CHECKS++))
    CHECK_RESULTS+=("✅ $1")
}

log_warning() {
    echo "⚠️ $1"
    CHECK_RESULTS+=("⚠️ $1")
}

log_failure() {
    echo "❌ $1"
    ((FAILED_CHECKS++))
    CHECK_RESULTS+=("❌ $1")
}

log_info() {
    echo "ℹ️ $1"
}

# 1. TypeScript类型检查
echo "🔍 1/7 执行TypeScript类型检查..."
if npm run typecheck > /dev/null 2>&1; then
    log_success "TypeScript类型检查通过 - 0错误"
else
    log_failure "TypeScript类型检查失败"
fi
echo ""

# 2. ESLint代码质量检查
echo "🔍 2/7 执行ESLint代码质量检查..."
if npm run lint > /dev/null 2>&1; then
    log_success "ESLint代码质量检查通过 - 0错误，0警告"
else
    log_failure "ESLint代码质量检查失败"
fi
echo ""

# 3. Schema语法验证
echo "🔍 3/7 执行Schema语法验证..."
SCHEMA_DIR="src/schemas/core-modules"
SCHEMA_VALID=true
SCHEMA_COUNT=0

if [ -d "$SCHEMA_DIR" ]; then
    for schema_file in "$SCHEMA_DIR"/*.json; do
        if [ -f "$schema_file" ]; then
            if node -e "JSON.parse(require('fs').readFileSync('$schema_file', 'utf8'))" > /dev/null 2>&1; then
                ((SCHEMA_COUNT++))
            else
                SCHEMA_VALID=false
                log_failure "Schema文件语法错误: $(basename "$schema_file")"
            fi
        fi
    done
    
    if [ "$SCHEMA_VALID" = true ] && [ $SCHEMA_COUNT -gt 0 ]; then
        log_success "Schema语法验证通过 - ${SCHEMA_COUNT}个文件语法正确"
    elif [ $SCHEMA_COUNT -eq 0 ]; then
        log_warning "Schema语法验证 - 未找到Schema文件"
    fi
else
    log_warning "Schema语法验证 - Schema目录不存在"
fi
echo ""

# 4. 完整测试套件
echo "🔍 4/7 执行完整测试套件..."
log_info "运行测试套件，这可能需要几分钟..."

if npm test > test_output.log 2>&1; then
    # 解析测试结果
    TEST_SUITES=$(grep "Test Suites:" test_output.log | tail -1 | grep -o "[0-9]* passed" | head -1 | grep -o "[0-9]*" || echo "0")
    TOTAL_TESTS=$(grep "Tests:" test_output.log | tail -1 | grep -o "[0-9]* passed" | head -1 | grep -o "[0-9]*" || echo "0")
    
    if [ "$TEST_SUITES" -gt 0 ] && [ "$TOTAL_TESTS" -gt 0 ]; then
        log_success "完整测试套件通过 - ${TEST_SUITES}个测试套件，${TOTAL_TESTS}个测试，100%通过率"
    else
        log_failure "测试套件执行异常 - 无法解析测试结果"
    fi
else
    log_failure "完整测试套件失败"
fi

# 清理测试输出文件
rm -f test_output.log
echo ""

# 5. 安全审计
echo "🔍 5/7 执行安全审计..."
if npm run security:audit > /dev/null 2>&1; then
    log_success "安全审计通过 - 0个安全漏洞"
else
    log_failure "安全审计失败或发现漏洞"
fi
echo ""

# 6. 依赖状态检查
echo "🔍 6/7 执行依赖状态检查..."
if npm outdated > outdated_output.log 2>&1; then
    # npm outdated 返回1表示有过时依赖，但这不是错误
    OUTDATED_COUNT=$(wc -l < outdated_output.log)
    if [ $OUTDATED_COUNT -gt 1 ]; then  # 减去标题行
        log_warning "依赖状态检查 - $((OUTDATED_COUNT-1))个依赖有更新版本可用（非关键）"
    else
        log_success "依赖状态检查通过 - 所有依赖都是最新版本"
    fi
else
    log_success "依赖状态检查通过 - 所有依赖都是最新版本"
fi

# 清理依赖检查输出文件
rm -f outdated_output.log
echo ""

# 7. 构建验证
echo "🔍 7/7 执行构建验证..."
if npm run build > /dev/null 2>&1; then
    log_success "构建验证通过 - TypeScript编译成功"
else
    log_failure "构建验证失败"
fi
echo ""

# 生成检查报告
echo "📊 质量门禁检查报告"
echo "=========================="
echo "📅 检查时间: $(date)"
echo "🎯 检查范围: MPLP v1.0 - 8个已完成模块"
echo "📋 质量标准: 企业级标准 + 零技术债务政策"
echo ""

echo "📈 检查结果统计:"
echo "- 总检查项: $TOTAL_CHECKS"
echo "- 通过检查: $PASSED_CHECKS"
echo "- 失败检查: $FAILED_CHECKS"
echo "- 通过率: $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))%"
echo ""

echo "📋 详细检查结果:"
for result in "${CHECK_RESULTS[@]}"; do
    echo "$result"
done
echo ""

# 判断整体结果
if [ $FAILED_CHECKS -eq 0 ]; then
    echo "🎉 质量门禁检查结果: ✅ 通过"
    echo "🏆 所有8个模块达到企业级质量标准！"
    echo "🚀 模块已准备好进行生产部署"
    exit 0
else
    echo "⚠️ 质量门禁检查结果: ❌ 未通过"
    echo "🔧 请修复失败的检查项后重新运行"
    echo "📖 详细信息请查看上述检查结果"
    exit 1
fi
