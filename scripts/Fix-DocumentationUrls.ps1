# MPLP文档URL和版本号批量修正脚本 (PowerShell)
# 使用SCTM+GLFB+ITCM+RBCT方法论

Write-Host "🔧 MPLP文档一致性修正脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$totalFiles = 0
$modifiedFiles = 0
$errors = @()

function Fix-DocumentationFile {
    param(
        [string]$FilePath
    )
    
    $script:totalFiles++
    $modified = $false
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $originalContent = $content
        
        # 修正仓库URL
        $content = $content -replace 'github\.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev', 'github.com/Coregentis/MPLP-Protocol-dev'
        $content = $content -replace 'github\.com/Coregentis/MPLP-Protocol-Dev-Dev', 'github.com/Coregentis/MPLP-Protocol-dev'
        
        # 修正测试数量
        $content = $content -replace '3165', '2902'
        $content = $content -replace '3,165', '2,902'
        
        # 修正版本号badge
        $content = $content -replace 'version-1\.0\.0--alpha', 'version-1.1.0--beta'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✓ 已修正: $FilePath" -ForegroundColor Green
            $script:modifiedFiles++
            $modified = $true
        }
    }
    catch {
        $script:errors += "错误处理文件 ${FilePath}: $_"
        Write-Host "✗ 错误: $FilePath - $_" -ForegroundColor Red
    }
    
    return $modified
}

# 修正根目录文档
Write-Host "📄 修正根目录文档..." -ForegroundColor Yellow
@('README.md', 'CONTRIBUTING.md', 'ROADMAP.md') | ForEach-Object {
    if (Test-Path $_) {
        Fix-DocumentationFile -FilePath $_
    }
}

# 修正docs目录
Write-Host ""
Write-Host "📚 修正docs目录文档..." -ForegroundColor Yellow
Get-ChildItem -Path "docs" -Filter "*.md" -Recurse -File | ForEach-Object {
    Fix-DocumentationFile -FilePath $_.FullName
}

# 修正docs-sdk目录
Write-Host ""
Write-Host "📦 修正docs-sdk目录文档..." -ForegroundColor Yellow
if (Test-Path "docs-sdk") {
    Get-ChildItem -Path "docs-sdk" -Filter "*.md" -Recurse -File | ForEach-Object {
        Fix-DocumentationFile -FilePath $_.FullName
    }
}

# 输出统计
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ 修正完成！" -ForegroundColor Green
Write-Host "总文件数: $totalFiles"
Write-Host "已修正文件数: $modifiedFiles"
Write-Host ""

# 显示错误（如果有）
if ($errors.Count -gt 0) {
    Write-Host "⚠️  发现 $($errors.Count) 个错误:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
}

# 验证修正结果
Write-Host "🔍 验证修正结果..." -ForegroundColor Yellow
Write-Host ""

$foundErrors = $false

# 检查是否还有错误的URL
$badUrls = Select-String -Path "docs\**\*.md","docs-sdk\**\*.md","README.md" -Pattern "MPLP-Protocol-Dev-Dev-Dev|MPLP-Protocol-Dev-Dev" -ErrorAction SilentlyContinue
if ($badUrls) {
    Write-Host "❌ 警告: 仍有文件包含错误的URL" -ForegroundColor Red
    $badUrls | Select-Object -First 5 | ForEach-Object {
        Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Red
    }
    $foundErrors = $true
} else {
    Write-Host "✓ URL修正验证通过" -ForegroundColor Green
}

# 检查是否还有错误的测试数量
$badTests = Select-String -Path "docs\**\*.md","docs-sdk\**\*.md","README.md" -Pattern "\b3165\b|\b3,165\b" -ErrorAction SilentlyContinue | Where-Object { $_.Path -notmatch "Fix-Documentation" }
if ($badTests) {
    Write-Host "⚠️  警告: 仍有文件包含旧的测试数量" -ForegroundColor Yellow
    $badTests | Select-Object -First 5 | ForEach-Object {
        Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ 测试数量修正验证通过" -ForegroundColor Green
}

Write-Host ""
if (-not $foundErrors) {
    Write-Host "🎉 所有文档修正完成！" -ForegroundColor Green
} else {
    Write-Host "⚠️  修正完成，但仍有部分问题需要手动检查" -ForegroundColor Yellow
}

