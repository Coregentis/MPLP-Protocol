#!/bin/bash
# MPLP模块版本一致性修复工具 v3.0
# 基于Context模块TDD重构成功经验制定
# 
# 用途: 自动修复模块中的版本不一致问题
# 目标: 统一所有版本引用为v1.0.0
# 
# 用法: ./fix-version-consistency.sh <module_name>
# 示例: ./fix-version-consistency.sh context

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "❌ 错误: 请提供模块名称"
  echo "用法: $0 <module_name>"
  echo "示例: $0 context"
  exit 1
fi

echo "🔧 开始修复模块版本一致性: $MODULE_NAME"
echo "目标版本: v1.0.0"
echo "=========================================="

# 检查模块目录是否存在
if [ ! -d "src/modules/$MODULE_NAME" ]; then
  echo "❌ 错误: 模块目录不存在: src/modules/$MODULE_NAME"
  exit 1
fi

# 创建备份目录
BACKUP_DIR="backup/version-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📋 步骤1: 扫描版本不一致文件"
echo "------------------------------------------"

# 查找所有版本不一致的文件
VERSION_ISSUES_FILES=$(find src/modules/$MODULE_NAME -name "*.ts" -exec grep -l "v2\|V2\|version.*2" {} \;)

if [ -z "$VERSION_ISSUES_FILES" ]; then
  echo "✅ 未发现版本不一致问题"
  exit 0
fi

echo "发现以下文件存在版本不一致问题:"
echo "$VERSION_ISSUES_FILES" | nl

# 统计问题数量
TOTAL_FILES=$(echo "$VERSION_ISSUES_FILES" | wc -l)
echo ""
echo "总计: $TOTAL_FILES 个文件需要修复"

echo ""
echo "📋 步骤2: 创建文件备份"
echo "------------------------------------------"

# 备份所有需要修复的文件
while IFS= read -r file; do
  if [ -n "$file" ]; then
    # 创建相对路径的备份目录结构
    backup_path="$BACKUP_DIR/$file"
    backup_dir=$(dirname "$backup_path")
    mkdir -p "$backup_dir"
    
    # 复制文件到备份目录
    cp "$file" "$backup_path"
    echo "✅ 备份: $file -> $backup_path"
  fi
done <<< "$VERSION_ISSUES_FILES"

echo ""
echo "📋 步骤3: 执行版本修复"
echo "------------------------------------------"

FIXED_FILES=0
FAILED_FILES=0

# 逐个修复文件
while IFS= read -r file; do
  if [ -n "$file" ]; then
    echo "🔧 修复文件: $file"
    
    # 创建临时文件
    temp_file="${file}.tmp"
    
    # 执行版本修复
    sed_success=true
    
    # 1. 更新文件头部版本注释
    sed 's/@version.*2.*/@version 1.0.0/g' "$file" > "$temp_file" || sed_success=false
    
    # 2. 更新Schema版本引用
    sed -i 's/v2\./v1./g' "$temp_file" || sed_success=false
    sed -i 's/V2\./V1./g' "$temp_file" || sed_success=false
    
    # 3. 更新API版本声明
    sed -i 's/version.*["\x27]2["\x27]/version: "1.0.0"/g' "$temp_file" || sed_success=false
    sed -i 's/version.*["\x27]2\.[0-9]*\.[0-9]*["\x27]/version: "1.0.0"/g' "$temp_file" || sed_success=false
    
    # 4. 更新协议版本引用
    sed -i 's/protocolVersion.*["\x27]2["\x27]/protocolVersion: "1.0.0"/g' "$temp_file" || sed_success=false
    sed -i 's/protocolVersion.*["\x27]2\.[0-9]*\.[0-9]*["\x27]/protocolVersion: "1.0.0"/g' "$temp_file" || sed_success=false
    
    # 5. 更新Schema文件引用
    sed -i 's/mplp-.*-v2\.json/mplp-\1-v1.json/g' "$temp_file" || sed_success=false
    
    # 6. 更新注释中的版本引用
    sed -i 's/v2\.0/v1.0/g' "$temp_file" || sed_success=false
    sed -i 's/V2\.0/V1.0/g' "$temp_file" || sed_success=false
    
    if [ "$sed_success" = true ]; then
      # 替换原文件
      mv "$temp_file" "$file"
      echo "  ✅ 修复成功"
      FIXED_FILES=$((FIXED_FILES + 1))
    else
      # 清理临时文件
      rm -f "$temp_file"
      echo "  ❌ 修复失败"
      FAILED_FILES=$((FAILED_FILES + 1))
    fi
  fi
done <<< "$VERSION_ISSUES_FILES"

echo ""
echo "📋 步骤4: 验证修复结果"
echo "------------------------------------------"

# 重新扫描版本问题
REMAINING_ISSUES=$(find src/modules/$MODULE_NAME -name "*.ts" -exec grep -l "v2\|V2\|version.*2" {} \; | wc -l)

echo "修复统计:"
echo "  - 成功修复: $FIXED_FILES 个文件"
echo "  - 修复失败: $FAILED_FILES 个文件"
echo "  - 剩余问题: $REMAINING_ISSUES 个文件"

if [ $REMAINING_ISSUES -eq 0 ]; then
  echo ""
  echo "🎉 版本一致性修复完成！"
  echo "✅ 所有文件已统一为v1.0.0版本"
  
  # 运行TypeScript检查验证修复效果
  echo ""
  echo "📋 步骤5: TypeScript编译验证"
  echo "------------------------------------------"
  
  TS_ERRORS=$(npx tsc --noEmit --project . 2>&1 | grep "src/modules/$MODULE_NAME" | wc -l)
  if [ $TS_ERRORS -eq 0 ]; then
    echo "✅ TypeScript编译检查通过"
  else
    echo "⚠️ 发现 $TS_ERRORS 个TypeScript错误，可能需要手动修复"
    echo "详细错误信息:"
    npx tsc --noEmit --project . 2>&1 | grep "src/modules/$MODULE_NAME" | head -5
  fi
  
  echo ""
  echo "📋 备份信息"
  echo "------------------------------------------"
  echo "原始文件已备份到: $BACKUP_DIR"
  echo "如需回滚，请使用以下命令:"
  echo "  cp -r $BACKUP_DIR/src/modules/$MODULE_NAME/* src/modules/$MODULE_NAME/"
  
else
  echo ""
  echo "⚠️ 版本修复未完全成功"
  echo "剩余问题文件:"
  find src/modules/$MODULE_NAME -name "*.ts" -exec grep -l "v2\|V2\|version.*2" {} \;
  echo ""
  echo "💡 建议:"
  echo "1. 手动检查剩余问题文件"
  echo "2. 确认是否为特殊情况（如注释、字符串等）"
  echo "3. 必要时手动修复"
  echo ""
  echo "📋 备份信息"
  echo "原始文件已备份到: $BACKUP_DIR"
fi

echo ""
echo "📋 后续建议"
echo "------------------------------------------"
echo "1. 运行质量门禁检查: ./check-module-quality.sh $MODULE_NAME"
echo "2. 运行ESLint检查: npx eslint src/modules/$MODULE_NAME --ext .ts"
echo "3. 运行测试验证: npm test -- --testPathPattern=\"$MODULE_NAME\""
echo "4. 提交代码前再次确认版本一致性"

exit 0
