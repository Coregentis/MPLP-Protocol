#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 全面分析文档对等性，找出需要增强的文档
 */

function comprehensiveParityAnalysis() {
    const docsDir = path.join(__dirname, '..', 'docs');
    let analysisResults = [];
    
    console.log('🔍 开始全面分析文档对等性...');
    
    // 递归查找所有英文markdown文件
    function findAllFiles(dir, basePath = '') {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item).replace(/\\/g, '/');
            
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...findAllFiles(fullPath, relativePath));
            } else if (item.endsWith('.md')) {
                files.push({
                    fullPath,
                    relativePath
                });
            }
        }
        return files;
    }
    
    // 分析单个文档对
    function analyzeDocumentPair(englishPath, chinesePath) {
        try {
            if (!fs.existsSync(englishPath) || !fs.existsSync(chinesePath)) {
                return null;
            }
            
            const englishContent = fs.readFileSync(englishPath, 'utf8');
            const chineseContent = fs.readFileSync(chinesePath, 'utf8');
            
            // 移除语言导航和空行
            const cleanEnglish = englishContent
                .split('\n')
                .filter(line => 
                    !line.includes('🌐') && 
                    !line.includes('Language Navigation') && 
                    !line.includes('语言导航') &&
                    line.trim() !== ''
                )
                .join('\n');
                
            const cleanChinese = chineseContent
                .split('\n')
                .filter(line => 
                    !line.includes('🌐') && 
                    !line.includes('Language Navigation') && 
                    !line.includes('语言导航') &&
                    line.trim() !== ''
                )
                .join('\n');
            
            const englishWords = cleanEnglish.split(/\s+/).length;
            const chineseChars = cleanChinese.length;
            const englishChars = cleanEnglish.length;
            
            // 计算差异比例
            const charDifference = Math.abs(englishChars - chineseChars) / Math.max(englishChars, chineseChars);
            
            return {
                englishWords,
                chineseChars,
                englishChars,
                charDifference,
                moreDetailed: chineseChars > englishChars ? 'chinese' : 'english',
                needsEnhancement: charDifference > 0.5 // 如果差异超过50%
            };
        } catch (error) {
            console.error(`分析文档对时出错: ${error.message}`);
            return null;
        }
    }
    
    // 查找所有英文文档
    const englishFiles = findAllFiles(path.join(docsDir, 'en'));
    
    console.log(`📊 找到 ${englishFiles.length} 个英文文档`);
    
    // 分析每个文档对
    for (const englishFile of englishFiles) {
        const chineseRelativePath = englishFile.relativePath.replace(/^en\//, 'zh-CN/');
        const chineseFullPath = path.join(docsDir, chineseRelativePath);
        
        const analysis = analyzeDocumentPair(englishFile.fullPath, chineseFullPath);
        
        if (analysis) {
            analysisResults.push({
                englishFile: englishFile.relativePath,
                chineseFile: chineseRelativePath,
                englishPath: englishFile.fullPath,
                chinesePath: chineseFullPath,
                analysis
            });
        }
    }
    
    // 找出需要增强的文档
    const needsEnhancement = analysisResults.filter(result => result.analysis.needsEnhancement);
    
    console.log('\n📊 分析结果总结:');
    console.log(`总计分析: ${analysisResults.length} 个文档对`);
    console.log(`需要增强: ${needsEnhancement.length} 个文档对`);
    
    // 按差异程度排序
    const sortedByDifference = needsEnhancement.sort((a, b) => b.analysis.charDifference - a.analysis.charDifference);
    
    console.log('\n🔍 需要增强的文档对（按差异程度排序）:');
    for (let i = 0; i < Math.min(20, sortedByDifference.length); i++) {
        const result = sortedByDifference[i];
        console.log(`${i + 1}. ${result.englishFile}`);
        console.log(`   更详细版本: ${result.analysis.moreDetailed === 'chinese' ? '中文' : '英文'}`);
        console.log(`   字符差异: ${(result.analysis.charDifference * 100).toFixed(1)}%`);
        console.log(`   英文字符: ${result.analysis.englishChars}, 中文字符: ${result.analysis.chineseChars}`);
        console.log('');
    }
    
    // 统计哪种语言更详细
    const chineseMoreDetailed = needsEnhancement.filter(r => r.analysis.moreDetailed === 'chinese').length;
    const englishMoreDetailed = needsEnhancement.filter(r => r.analysis.moreDetailed === 'english').length;
    
    console.log('📈 详细程度统计:');
    console.log(`中文更详细: ${chineseMoreDetailed} 个文档`);
    console.log(`英文更详细: ${englishMoreDetailed} 个文档`);
    
    // 返回需要增强的文档列表
    return needsEnhancement;
}

// 运行分析
const needsEnhancement = comprehensiveParityAnalysis();

// 导出结果供其他脚本使用
module.exports = { needsEnhancement };
