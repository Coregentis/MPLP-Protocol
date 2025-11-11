#!/bin/bash

# CodeQL本地扫描脚本
# 用于在本地运行CodeQL安全扫描

set -e

# CodeQL CLI路径
CODEQL_PATH="$APPDATA/Code/User/globalStorage/github.vscode-codeql/distribution1/codeql/codeql.exe"

# 检查CodeQL是否存在
if [ ! -f "$CODEQL_PATH" ]; then
    echo "❌ CodeQL CLI not found at: $CODEQL_PATH"
    echo "Please install CodeQL VSCode extension first"
    exit 1
fi

echo "✅ Found CodeQL CLI: $CODEQL_PATH"
echo ""

# 数据库目录
DB_DIR="./codeql-db"
RESULTS_DIR="./codeql-results"

# 清理旧的数据库和结果
echo "🧹 Cleaning up old database and results..."
rm -rf "$DB_DIR" "$RESULTS_DIR"
mkdir -p "$RESULTS_DIR"

# 创建CodeQL数据库
echo ""
echo "📦 Creating CodeQL database..."
echo "This may take a few minutes..."
"$CODEQL_PATH" database create "$DB_DIR" \
    --language=javascript \
    --source-root=. \
    --overwrite \
    2>&1 | grep -E "(Finalizing|Successfully|Error|Warning)" || true

if [ ! -d "$DB_DIR" ]; then
    echo "❌ Failed to create CodeQL database"
    exit 1
fi

echo "✅ Database created successfully"
echo ""

# 运行安全查询
echo "🔍 Running security queries..."
echo ""

# 查询套件
QUERY_SUITES=(
    "javascript-security-and-quality.qls"
    "javascript-security-extended.qls"
)

for SUITE in "${QUERY_SUITES[@]}"; do
    echo "Running query suite: $SUITE"
    
    RESULT_FILE="$RESULTS_DIR/${SUITE%.qls}.sarif"
    
    "$CODEQL_PATH" database analyze "$DB_DIR" \
        --format=sarif-latest \
        --output="$RESULT_FILE" \
        --sarif-category=javascript \
        -- "$SUITE" \
        2>&1 | grep -E "(Running|Interpreting|Evaluating|Results|Error|Warning)" || true
    
    if [ -f "$RESULT_FILE" ]; then
        echo "✅ Results saved to: $RESULT_FILE"
    else
        echo "⚠️  No results file generated for $SUITE"
    fi
    echo ""
done

# 生成人类可读的报告
echo "📊 Generating human-readable report..."

for SARIF_FILE in "$RESULTS_DIR"/*.sarif; do
    if [ -f "$SARIF_FILE" ]; then
        REPORT_FILE="${SARIF_FILE%.sarif}.txt"
        
        # 提取关键信息
        echo "=== CodeQL Security Scan Results ===" > "$REPORT_FILE"
        echo "File: $(basename "$SARIF_FILE")" >> "$REPORT_FILE"
        echo "Date: $(date)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        # 使用jq解析SARIF文件（如果可用）
        if command -v jq &> /dev/null; then
            echo "📋 Parsing results with jq..."
            
            # 提取结果摘要
            jq -r '.runs[0].results[] | "[\(.level // "note")] \(.ruleId): \(.message.text)"' "$SARIF_FILE" >> "$REPORT_FILE" 2>/dev/null || true
        else
            echo "⚠️  jq not found, skipping detailed parsing"
            echo "Install jq for better result formatting: https://stedolan.github.io/jq/"
        fi
        
        echo "✅ Report saved to: $REPORT_FILE"
    fi
done

echo ""
echo "🎉 CodeQL scan completed!"
echo ""
echo "📁 Results directory: $RESULTS_DIR"
echo "📄 SARIF files: $RESULTS_DIR/*.sarif"
echo "📄 Text reports: $RESULTS_DIR/*.txt"
echo ""
echo "💡 To view results in VSCode:"
echo "   1. Install 'SARIF Viewer' extension"
echo "   2. Open .sarif files in $RESULTS_DIR"
echo ""

