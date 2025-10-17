#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 详细分析多语言文档对等性问题
 */

function detailedParityAnalysis() {
    const docsDir = path.join(__dirname, '..', 'docs');
    const enDir = path.join(docsDir, 'en');
    const zhDir = path.join(docsDir, 'zh-CN');
    
    console.log('🔍 开始详细多语言对等性分析...\n');
    
    // 1. 找出额外的中文文档
    console.log('📋 1. 查找额外的中文文档：');
    const extraChineseFiles = findExtraChineseFiles(enDir, zhDir);
    
    // 2. 分析内容长度差异
    console.log('\n📊 2. 分析内容长度差异：');
    analyzeContentDifferences(enDir, zhDir);
    
    // 3. 检查翻译质量问题
    console.log('\n🔍 3. 检查翻译质量问题：');
    checkTranslationQuality(enDir, zhDir);
}

function findExtraChineseFiles(enDir, zhDir) {
    const extraFiles = [];
    
    function scanDirectory(enPath, zhPath, relativePath = '') {
        if (!fs.existsSync(enPath)) {
            // 英文目录不存在，检查中文目录
            if (fs.existsSync(zhPath)) {
                const zhFiles = fs.readdirSync(zhPath);
                zhFiles.forEach(file => {
                    const zhFilePath = path.join(zhPath, file);
                    const stat = fs.statSync(zhFilePath);
                    if (stat.isFile() && file.endsWith('.md')) {
                        extraFiles.push(path.join(relativePath, file).replace(/\\/g, '/'));
                        console.log(`   ❌ 额外中文文档: zh-CN/${path.join(relativePath, file).replace(/\\/g, '/')}`);
                    } else if (stat.isDirectory()) {
                        scanDirectory(
                            path.join(enPath, file),
                            zhFilePath,
                            path.join(relativePath, file)
                        );
                    }
                });
            }
            return;
        }
        
        if (!fs.existsSync(zhPath)) {
            return;
        }
        
        const enFiles = fs.readdirSync(enPath);
        const zhFiles = fs.readdirSync(zhPath);
        
        // 检查中文目录中的额外文件
        zhFiles.forEach(file => {
            if (!enFiles.includes(file)) {
                const zhFilePath = path.join(zhPath, file);
                const stat = fs.statSync(zhFilePath);
                if (stat.isFile() && file.endsWith('.md')) {
                    extraFiles.push(path.join(relativePath, file).replace(/\\/g, '/'));
                    console.log(`   ❌ 额外中文文档: zh-CN/${path.join(relativePath, file).replace(/\\/g, '/')}`);
                }
            }
        });
        
        // 递归检查子目录
        enFiles.forEach(file => {
            const enFilePath = path.join(enPath, file);
            const zhFilePath = path.join(zhPath, file);
            const stat = fs.statSync(enFilePath);
            
            if (stat.isDirectory()) {
                scanDirectory(enFilePath, zhFilePath, path.join(relativePath, file));
            }
        });
    }
    
    scanDirectory(enDir, zhDir);
    
    if (extraFiles.length === 0) {
        console.log('   ✅ 未发现额外的中文文档');
    } else {
        console.log(`   📊 总计发现 ${extraFiles.length} 个额外中文文档`);
    }
    
    return extraFiles;
}

function analyzeContentDifferences(enDir, zhDir) {
    const differences = [];
    
    function compareFiles(enPath, zhPath, relativePath = '') {
        if (!fs.existsSync(enPath) || !fs.existsSync(zhPath)) {
            return;
        }
        
        const enFiles = fs.readdirSync(enPath);
        
        enFiles.forEach(file => {
            const enFilePath = path.join(enPath, file);
            const zhFilePath = path.join(zhPath, file);
            const stat = fs.statSync(enFilePath);
            
            if (stat.isFile() && file.endsWith('.md')) {
                if (fs.existsSync(zhFilePath)) {
                    const enContent = fs.readFileSync(enFilePath, 'utf8');
                    const zhContent = fs.readFileSync(zhFilePath, 'utf8');
                    
                    const enWords = enContent.split(/\s+/).length;
                    const zhChars = zhContent.length;
                    
                    // 计算差异百分比（粗略估算：1个英文单词 ≈ 2个中文字符）
                    const expectedZhChars = enWords * 2;
                    const difference = ((zhChars - expectedZhChars) / expectedZhChars * 100);
                    
                    if (Math.abs(difference) > 50) { // 差异超过50%
                        differences.push({
                            file: path.join(relativePath, file).replace(/\\/g, '/'),
                            enWords,
                            zhChars,
                            difference: difference.toFixed(1)
                        });
                    }
                }
            } else if (stat.isDirectory()) {
                compareFiles(enFilePath, zhFilePath, path.join(relativePath, file));
            }
        });
    }
    
    compareFiles(enDir, zhDir);
    
    // 显示最大的差异
    differences.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    
    console.log('   📊 内容长度差异最大的文档（前10个）：');
    differences.slice(0, 10).forEach((diff, index) => {
        const sign = diff.difference > 0 ? '+' : '';
        console.log(`   ${index + 1}. ${diff.file}`);
        console.log(`      英文: ${diff.enWords} 词, 中文: ${diff.zhChars} 字符, 差异: ${sign}${diff.difference}%`);
    });
    
    if (differences.length === 0) {
        console.log('   ✅ 未发现显著的内容长度差异');
    }
}

function checkTranslationQuality(enDir, zhDir) {
    console.log('   🔍 检查翻译质量问题...');
    
    // 检查一些常见的翻译质量问题
    const qualityIssues = [];
    
    function checkFile(enPath, zhPath, relativePath) {
        if (!fs.existsSync(enPath) || !fs.existsSync(zhPath)) {
            return;
        }
        
        try {
            const enContent = fs.readFileSync(enPath, 'utf8');
            const zhContent = fs.readFileSync(zhPath, 'utf8');
            
            // 检查标题数量是否匹配
            const enHeadings = (enContent.match(/^#+\s/gm) || []).length;
            const zhHeadings = (zhContent.match(/^#+\s/gm) || []).length;
            
            if (Math.abs(enHeadings - zhHeadings) > 2) {
                qualityIssues.push({
                    file: relativePath,
                    issue: `标题数量不匹配: 英文${enHeadings}个, 中文${zhHeadings}个`
                });
            }
            
            // 检查代码块数量是否匹配
            const enCodeBlocks = (enContent.match(/```/g) || []).length / 2;
            const zhCodeBlocks = (zhContent.match(/```/g) || []).length / 2;
            
            if (Math.abs(enCodeBlocks - zhCodeBlocks) > 1) {
                qualityIssues.push({
                    file: relativePath,
                    issue: `代码块数量不匹配: 英文${enCodeBlocks}个, 中文${zhCodeBlocks}个`
                });
            }
            
        } catch (error) {
            qualityIssues.push({
                file: relativePath,
                issue: `文件读取错误: ${error.message}`
            });
        }
    }
    
    function scanForQuality(enPath, zhPath, relativePath = '') {
        if (!fs.existsSync(enPath) || !fs.existsSync(zhPath)) {
            return;
        }
        
        const enFiles = fs.readdirSync(enPath);
        
        enFiles.forEach(file => {
            const enFilePath = path.join(enPath, file);
            const zhFilePath = path.join(zhPath, file);
            const stat = fs.statSync(enFilePath);
            
            if (stat.isFile() && file.endsWith('.md')) {
                checkFile(enFilePath, zhFilePath, path.join(relativePath, file).replace(/\\/g, '/'));
            } else if (stat.isDirectory()) {
                scanForQuality(enFilePath, zhFilePath, path.join(relativePath, file));
            }
        });
    }
    
    scanForQuality(enDir, zhDir);
    
    if (qualityIssues.length > 0) {
        console.log('   ⚠️ 发现的翻译质量问题：');
        qualityIssues.slice(0, 10).forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue.file}: ${issue.issue}`);
        });
        console.log(`   📊 总计发现 ${qualityIssues.length} 个质量问题`);
    } else {
        console.log('   ✅ 未发现明显的翻译质量问题');
    }
}

// 运行分析
detailedParityAnalysis();
