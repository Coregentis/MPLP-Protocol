#!/bin/bash
# GLFB伪代码检测脚本
# 版本: v1.0.0
# 用途: 检测和报告代码中的伪代码违规

set -e

# 配置
SRC_DIR="${1:-src}"
REPORT_FILE="glfb-pseudocode-report.txt"
EXIT_CODE=0
TOTAL_VIOLATIONS=0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 初始化报告文件
init_report() {
    cat > "$REPORT_FILE" << EOF
# GLFB伪代码检测报告
生成时间: $(date)
检测目录: $SRC_DIR
检测标准: GLFB v1.1.0

## 检测结果摘要
EOF
}

# 检测TODO标记
check_todos() {
    log_info "检测TODO标记..."
    
    local todo_files=$(find "$SRC_DIR" -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" 2>/dev/null | xargs grep -l "TODO\|FIXME\|XXX\|HACK" 2>/dev/null || true)
    local todo_count=$(echo "$todo_files" | grep -c . 2>/dev/null || echo "0")
    
    if [ "$todo_count" -gt 0 ]; then
        log_error "发现 $todo_count 个文件包含TODO标记"
        echo "### TODO标记违规 ($todo_count 个文件)" >> "$REPORT_FILE"
        echo "$todo_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "- $file" >> "$REPORT_FILE"
                grep -n "TODO\|FIXME\|XXX\|HACK" "$file" | head -3 >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
            fi
        done
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + todo_count))
        EXIT_CODE=1
    else
        log_success "未发现TODO标记"
        echo "### TODO标记检查: ✅ 通过" >> "$REPORT_FILE"
    fi
}

# 检测未实现异常
check_unimplemented() {
    log_info "检测未实现异常..."
    
    local unimpl_files=$(find "$SRC_DIR" -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" 2>/dev/null | xargs grep -l "throw new Error.*[Nn]ot.*implement\|throw new Error.*pending\|throw new Error.*TODO" 2>/dev/null || true)
    local unimpl_count=$(echo "$unimpl_files" | grep -c . 2>/dev/null || echo "0")
    
    if [ "$unimpl_count" -gt 0 ]; then
        log_error "发现 $unimpl_count 个未实现方法"
        echo "### 未实现异常违规 ($unimpl_count 个文件)" >> "$REPORT_FILE"
        echo "$unimpl_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "- $file" >> "$REPORT_FILE"
                grep -n "throw new Error.*[Nn]ot.*implement\|throw new Error.*pending\|throw new Error.*TODO" "$file" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
            fi
        done
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + unimpl_count))
        EXIT_CODE=1
    else
        log_success "未发现未实现方法"
        echo "### 未实现异常检查: ✅ 通过" >> "$REPORT_FILE"
    fi
}

# 检测空函数体
check_empty_functions() {
    log_info "检测空函数体..."
    
    local empty_files=$(find "$SRC_DIR" -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" 2>/dev/null | xargs grep -l "{\s*//.*\s*}\|{\s*}\|{\s*return;\s*}" 2>/dev/null || true)
    local empty_count=$(echo "$empty_files" | grep -c . 2>/dev/null || echo "0")
    
    if [ "$empty_count" -gt 0 ]; then
        log_warning "发现 $empty_count 个可能的空函数"
        echo "### 空函数体警告 ($empty_count 个文件)" >> "$REPORT_FILE"
        echo "注意: 这些可能是有意的空实现，请手动检查" >> "$REPORT_FILE"
        echo "$empty_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "- $file" >> "$REPORT_FILE"
            fi
        done
        echo "" >> "$REPORT_FILE"
    else
        log_success "未发现明显的空函数"
        echo "### 空函数体检查: ✅ 通过" >> "$REPORT_FILE"
    fi
}

# 检测any类型使用
check_any_types() {
    log_info "检测any类型使用..."
    
    local any_files=$(find "$SRC_DIR" -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l ": any\|<any>\|any\[\]\|Array<any>" 2>/dev/null || true)
    local any_count=$(echo "$any_files" | grep -c . 2>/dev/null || echo "0")
    
    if [ "$any_count" -gt 0 ]; then
        log_error "发现 $any_count 个文件使用any类型"
        echo "### any类型违规 ($any_count 个文件)" >> "$REPORT_FILE"
        echo "$any_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "- $file" >> "$REPORT_FILE"
                grep -n ": any\|<any>\|any\[\]\|Array<any>" "$file" | head -3 >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
            fi
        done
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + any_count))
        EXIT_CODE=1
    else
        log_success "未发现any类型使用"
        echo "### any类型检查: ✅ 通过" >> "$REPORT_FILE"
    fi
}

# 生成报告摘要
generate_summary() {
    echo "" >> "$REPORT_FILE"
    echo "## 检测摘要" >> "$REPORT_FILE"
    echo "- 总违规数量: $TOTAL_VIOLATIONS" >> "$REPORT_FILE"
    echo "- 检测状态: $([ $EXIT_CODE -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")" >> "$REPORT_FILE"
    echo "- 建议: $([ $EXIT_CODE -eq 0 ] && echo "代码已准备好进入生产环境" || echo "请修复上述违规后重新检测")" >> "$REPORT_FILE"
}

# 主函数
main() {
    echo "🔍 GLFB伪代码检测开始..."
    echo "📁 检测目录: $SRC_DIR"
    echo ""
    
    # 检查目录是否存在
    if [ ! -d "$SRC_DIR" ]; then
        log_error "目录 $SRC_DIR 不存在"
        exit 1
    fi
    
    # 初始化报告
    init_report
    
    # 执行检测
    check_todos
    check_unimplemented
    check_empty_functions
    check_any_types
    
    # 生成摘要
    generate_summary
    
    echo ""
    echo "📊 检测完成！"
    echo "📄 详细报告: $REPORT_FILE"
    
    # 结果报告
    if [ $EXIT_CODE -eq 0 ]; then
        log_success "GLFB伪代码检测通过！代码已准备好进入生产环境。"
    else
        log_error "GLFB伪代码检测失败！发现 $TOTAL_VIOLATIONS 个违规项。"
        echo ""
        log_info "请修复上述问题后重试，或查看详细报告: $REPORT_FILE"
    fi
    
    exit $EXIT_CODE
}

# 显示帮助信息
show_help() {
    cat << EOF
GLFB伪代码检测脚本 v1.0.0

用法: $0 [目录]

参数:
  目录    要检测的源代码目录 (默认: src)

选项:
  -h, --help    显示此帮助信息

示例:
  $0                # 检测 src 目录
  $0 src/modules    # 检测 src/modules 目录

检测项目:
  - TODO/FIXME/XXX/HACK 标记
  - 未实现异常 (throw new Error)
  - 空函数体
  - any 类型使用

输出:
  - 控制台实时反馈
  - 详细报告文件: glfb-pseudocode-report.txt

退出码:
  0 - 检测通过
  1 - 发现违规项
EOF
}

# 处理命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main
        ;;
esac
