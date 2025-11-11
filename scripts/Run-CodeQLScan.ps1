# CodeQL本地扫描PowerShell脚本
# 用于在Windows环境下运行CodeQL安全扫描

param(
    [switch]$QuickScan = $false,
    [switch]$FullScan = $false,
    [switch]$CreateDB = $false
)

# CodeQL CLI路径
$CodeQLPath = "$env:APPDATA\Code\User\globalStorage\github.vscode-codeql\distribution1\codeql\codeql.exe"

Write-Host "🔍 CodeQL Security Scanner" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# 检查CodeQL是否存在
if (-not (Test-Path $CodeQLPath)) {
    Write-Host "❌ CodeQL CLI not found at: $CodeQLPath" -ForegroundColor Red
    Write-Host "Please install the CodeQL VSCode extension first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found CodeQL CLI" -ForegroundColor Green
Write-Host ""

# 数据库目录
$DBDir = ".\codeql-db"
$ResultsDir = ".\codeql-results"

# 创建结果目录
if (Test-Path $ResultsDir) {
    Remove-Item $ResultsDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null

# 步骤1: 创建数据库
if ($CreateDB -or -not (Test-Path $DBDir)) {
    Write-Host "📦 Creating CodeQL database..." -ForegroundColor Cyan
    Write-Host "This will take 2-3 minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    & $CodeQLPath database create $DBDir `
        --language=javascript `
        --source-root=. `
        --overwrite
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Database created successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Using existing CodeQL database" -ForegroundColor Green
    Write-Host ""
}

# 步骤2: 运行查询
Write-Host "🔍 Running security analysis..." -ForegroundColor Cyan
Write-Host ""

$SARIFFile = "$ResultsDir\security-results.sarif"
$CSVFile = "$ResultsDir\security-results.csv"

# 运行SARIF格式分析
Write-Host "Generating SARIF report..." -ForegroundColor Yellow
& $CodeQLPath database analyze $DBDir `
    --format=sarif-latest `
    --output=$SARIFFile `
    --sarif-category=javascript `
    -- javascript-security-and-quality.qls

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SARIF report generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  SARIF report generation failed" -ForegroundColor Yellow
}

Write-Host ""

# 运行CSV格式分析
Write-Host "Generating CSV report..." -ForegroundColor Yellow
& $CodeQLPath database analyze $DBDir `
    --format=csv `
    --output=$CSVFile `
    -- javascript-security-and-quality.qls

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CSV report generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  CSV report generation failed" -ForegroundColor Yellow
}

Write-Host ""

# 步骤3: 显示结果
Write-Host "🎉 CodeQL scan completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Results directory: $ResultsDir" -ForegroundColor Cyan
Write-Host "📄 SARIF file: $SARIFFile" -ForegroundColor Cyan
Write-Host "📄 CSV file: $CSVFile" -ForegroundColor Cyan
Write-Host ""

# 解析CSV结果
if (Test-Path $CSVFile) {
    Write-Host "📋 Parsing results..." -ForegroundColor Cyan
    $csvContent = Get-Content $CSVFile
    $issueCount = ($csvContent | Measure-Object).Count - 1
    
    if ($issueCount -gt 0) {
        Write-Host "Found $issueCount potential security issues" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Top 10 issues:" -ForegroundColor Yellow
        
        $csvContent | Select-Object -Skip 1 -First 10 | ForEach-Object {
            $parts = $_ -split ','
            if ($parts.Length -ge 3) {
                Write-Host "  - $($parts[0]): $($parts[2])" -ForegroundColor White
            }
        }
    } else {
        Write-Host "✅ No security issues found!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "💡 To view detailed results:" -ForegroundColor Cyan
Write-Host "   1. Install 'SARIF Viewer' VSCode extension" -ForegroundColor White
Write-Host "   2. Open $SARIFFile in VSCode" -ForegroundColor White
Write-Host "   3. Or open $CSVFile in Excel" -ForegroundColor White
Write-Host ""

# 使用示例
Write-Host "📚 Usage examples:" -ForegroundColor Cyan
Write-Host "   .\scripts\Run-CodeQLScan.ps1              # Use existing database" -ForegroundColor White
Write-Host "   .\scripts\Run-CodeQLScan.ps1 -CreateDB    # Recreate database" -ForegroundColor White
Write-Host ""

