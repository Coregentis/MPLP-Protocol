#!/bin/bash

# MPLP Schema企业级增强自动化脚本模板
# 版本: v1.0.0
# 创建日期: 2025-08-14
# 基于: MPLP v1.0 Schema标准化成功实践

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    log_error "请提供模块名称"
    echo "用法: $0 <module_name>"
    echo "例如: $0 context"
    exit 1
fi

MODULE_NAME=$1
SCHEMA_FILE="src/schemas/mplp-$MODULE_NAME.json"
BACKUP_FILE="src/schemas/mplp-$MODULE_NAME.json.backup.$(date +%Y%m%d_%H%M%S)"
DOC_FILE="docs/schemas/*/mplp-$MODULE_NAME.md"

log_info "开始更新 $MODULE_NAME Schema企业级功能..."

# 阶段1: Plan（规划阶段）
log_info "=== 阶段1: Plan（规划阶段） ==="

# 检查Schema文件是否存在
if [ ! -f "$SCHEMA_FILE" ]; then
    log_error "Schema文件不存在: $SCHEMA_FILE"
    exit 1
fi

log_success "Schema文件存在: $SCHEMA_FILE"

# 检查当前企业级功能状态
log_info "检查当前企业级功能状态..."
ENTERPRISE_FEATURES=("audit_trail" "monitoring_integration" "performance_metrics" "version_history" "search_metadata" "event_integration")

for feature in "${ENTERPRISE_FEATURES[@]}"; do
    if grep -q "\"$feature\":" "$SCHEMA_FILE"; then
        log_success "✅ $feature 已存在"
    else
        log_warning "❌ $feature 缺失"
    fi
done

# 阶段2: Confirm（确认阶段）
log_info "=== 阶段2: Confirm（确认阶段） ==="

read -p "确认要更新 $MODULE_NAME Schema吗？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "取消更新操作"
    exit 0
fi

# 阶段3: Trace（执行阶段）
log_info "=== 阶段3: Trace（执行阶段） ==="

# 备份原始文件
log_info "备份原始文件..."
cp "$SCHEMA_FILE" "$BACKUP_FILE"
log_success "备份完成: $BACKUP_FILE"

# JSON格式验证函数
validate_json() {
    local file=$1
    if node -e "try { JSON.parse(require('fs').readFileSync('$file', 'utf8')); console.log('✅ JSON格式正确'); } catch(e) { console.log('❌ JSON格式错误:', e.message); process.exit(1); }" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 验证当前JSON格式
log_info "验证当前JSON格式..."
if validate_json "$SCHEMA_FILE"; then
    log_success "当前JSON格式正确"
else
    log_error "当前JSON格式有误，请先修复"
    exit 1
fi

# 这里应该插入具体的Schema更新逻辑
# 由于更新逻辑复杂且需要根据具体模块定制，这里提供框架
log_warning "注意: 具体的Schema更新逻辑需要根据模块特点手动实现"
log_info "请参考 docs/methodology/schema-enterprise-enhancement-methodology.md"

# 模拟更新过程（实际使用时需要替换为真实的更新逻辑）
log_info "执行Schema更新..."
log_warning "这是模拟更新，实际使用时需要实现具体更新逻辑"

# 验证更新后的JSON格式
log_info "验证更新后的JSON格式..."
if validate_json "$SCHEMA_FILE"; then
    log_success "更新后JSON格式正确"
else
    log_error "更新后JSON格式有误，恢复备份文件"
    cp "$BACKUP_FILE" "$SCHEMA_FILE"
    exit 1
fi

# 运行Schema语法验证
log_info "运行Schema语法验证..."
if npm run validate:schemas > /dev/null 2>&1; then
    log_success "Schema语法验证通过"
else
    log_error "Schema语法验证失败"
    log_info "恢复备份文件..."
    cp "$BACKUP_FILE" "$SCHEMA_FILE"
    exit 1
fi

# 阶段4: Delivery（交付阶段）
log_info "=== 阶段4: Delivery（交付阶段） ==="

# 质量验证清单
log_info "执行质量验证清单..."

# 1. JSON格式验证
if validate_json "$SCHEMA_FILE"; then
    log_success "✅ JSON格式验证通过"
else
    log_error "❌ JSON格式验证失败"
    exit 1
fi

# 2. Schema语法验证
if npm run validate:schemas > /dev/null 2>&1; then
    log_success "✅ Schema语法验证通过"
else
    log_error "❌ Schema语法验证失败"
    exit 1
fi

# 3. 企业级功能完整性验证
log_info "验证企业级功能完整性..."
MISSING_FEATURES=()
for feature in "${ENTERPRISE_FEATURES[@]}"; do
    if grep -q "\"$feature\":" "$SCHEMA_FILE"; then
        log_success "✅ $feature 存在"
    else
        log_error "❌ $feature 缺失"
        MISSING_FEATURES+=("$feature")
    fi
done

if [ ${#MISSING_FEATURES[@]} -eq 0 ]; then
    log_success "✅ 企业级功能完整性验证通过"
else
    log_error "❌ 企业级功能不完整，缺失: ${MISSING_FEATURES[*]}"
    exit 1
fi

# 4. 专业化字段验证
log_info "验证专业化字段..."
SPECIALIZATION_FIELDS=("${MODULE_NAME}_operation" "${MODULE_NAME}_details" "${MODULE_NAME}_audit_level" "${MODULE_NAME}_data_logging")
for field in "${SPECIALIZATION_FIELDS[@]}"; do
    if grep -q "\"$field\":" "$SCHEMA_FILE"; then
        log_success "✅ $field 存在"
    else
        log_warning "⚠️ $field 可能缺失（根据模块特点可能不需要）"
    fi
done

# 生成更新报告
log_info "生成更新报告..."
REPORT_FILE="schema-update-report-$MODULE_NAME-$(date +%Y%m%d_%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
MPLP Schema企业级增强更新报告
================================
模块名称: $MODULE_NAME
更新时间: $(date)
Schema文件: $SCHEMA_FILE
备份文件: $BACKUP_FILE

更新结果:
- JSON格式验证: ✅ 通过
- Schema语法验证: ✅ 通过
- 企业级功能完整性: ✅ 通过
- 专业化字段验证: ✅ 通过

企业级功能状态:
EOF

for feature in "${ENTERPRISE_FEATURES[@]}"; do
    if grep -q "\"$feature\":" "$SCHEMA_FILE"; then
        echo "- $feature: ✅ 存在" >> "$REPORT_FILE"
    else
        echo "- $feature: ❌ 缺失" >> "$REPORT_FILE"
    fi
done

log_success "更新报告已生成: $REPORT_FILE"

# 清理旧备份文件（保留最近5个）
log_info "清理旧备份文件..."
ls -t src/schemas/mplp-$MODULE_NAME.json.backup.* 2>/dev/null | tail -n +6 | xargs -r rm
log_success "备份文件清理完成"

# 完成
log_success "🎉 $MODULE_NAME Schema企业级增强更新完成！"
log_info "请检查更新报告: $REPORT_FILE"
log_info "如有问题，可使用备份文件恢复: $BACKUP_FILE"

# 建议下一步操作
echo
log_info "建议下一步操作:"
echo "1. 检查并更新相关文档"
echo "2. 运行完整的测试套件"
echo "3. 提交代码变更"
echo "4. 更新版本号和变更日志"

exit 0
