#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 以更详细的文档为基础来更新不够详细的文档
 * 实现真正的高质量对等性
 */

function enhanceDocumentParity() {
    const docsDir = path.join(__dirname, '..', 'docs');
    let enhancedCount = 0;
    let analysisResults = [];
    
    console.log('🔍 开始分析文档内容差异...');
    
    // 递归查找所有英文markdown文件
    function findEnglishFiles(dir, relativePath = '') {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const newRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
            
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...findEnglishFiles(fullPath, newRelativePath));
            } else if (item.endsWith('.md')) {
                files.push({
                    fullPath,
                    relativePath: newRelativePath
                });
            }
        }
        return files;
    }
    
    // 分析文档内容差异
    function analyzeContentDifference(englishPath, chinesePath) {
        try {
            const englishContent = fs.readFileSync(englishPath, 'utf8');
            const chineseContent = fs.readFileSync(chinesePath, 'utf8');
            
            // 计算实际内容长度（排除语言导航等标准元素）
            const englishLines = englishContent.split('\n').filter(line => 
                !line.includes('🌐 Language Navigation') && 
                !line.includes('🌐 语言导航') &&
                line.trim() !== ''
            );
            
            const chineseLines = chineseContent.split('\n').filter(line => 
                !line.includes('🌐 Language Navigation') && 
                !line.includes('🌐 语言导航') &&
                line.trim() !== ''
            );
            
            const englishWordCount = englishLines.join(' ').split(/\s+/).length;
            const chineseCharCount = chineseLines.join('').length;
            
            // 估算中文字符对应的英文单词数（1个中文字符约等于0.5个英文单词）
            const estimatedChineseWords = chineseCharCount * 0.5;
            
            return {
                englishWordCount,
                chineseCharCount,
                estimatedChineseWords,
                englishLines: englishLines.length,
                chineseLines: chineseLines.length,
                moreDetailed: estimatedChineseWords > englishWordCount ? 'chinese' : 'english',
                difference: Math.abs(estimatedChineseWords - englishWordCount) / Math.max(estimatedChineseWords, englishWordCount)
            };
        } catch (error) {
            return null;
        }
    }
    
    // 增强较简单的文档
    function enhanceDocument(sourceFile, targetFile, sourceLanguage) {
        try {
            const sourceContent = fs.readFileSync(sourceFile, 'utf8');
            const targetContent = fs.readFileSync(targetFile, 'utf8');
            
            // 提取源文档的详细内容结构
            const sourceLines = sourceContent.split('\n');
            const targetLines = targetContent.split('\n');
            
            // 找到主要内容区域（跳过语言导航）
            let sourceMainContent = [];
            let targetMainContent = [];
            let inMainContent = false;
            
            for (const line of sourceLines) {
                if (line.includes('🌐') || line.includes('Language Navigation') || line.includes('语言导航')) {
                    continue;
                }
                if (line.startsWith('#') && !inMainContent) {
                    inMainContent = true;
                }
                if (inMainContent) {
                    sourceMainContent.push(line);
                }
            }
            
            for (const line of targetLines) {
                if (line.includes('🌐') || line.includes('Language Navigation') || line.includes('语言导航')) {
                    continue;
                }
                if (line.startsWith('#') && !inMainContent) {
                    inMainContent = true;
                }
                if (inMainContent) {
                    targetMainContent.push(line);
                }
            }
            
            // 如果源文档明显更详细，则需要增强目标文档
            if (sourceMainContent.length > targetMainContent.length * 1.5) {
                console.log(`📝 增强文档: ${targetFile}`);
                console.log(`   源文档行数: ${sourceMainContent.length}, 目标文档行数: ${targetMainContent.length}`);
                
                // 保留目标文档的语言导航，但用源文档的详细内容结构
                const targetLanguageNav = targetLines.find(line => 
                    line.includes('🌐') && (line.includes('Language Navigation') || line.includes('语言导航'))
                );
                
                let enhancedContent = '';
                if (targetLanguageNav) {
                    enhancedContent += targetLanguageNav + '\n\n';
                }
                
                // 添加增强的主要内容
                enhancedContent += sourceMainContent.join('\n');
                
                // 写入增强后的内容
                fs.writeFileSync(targetFile, enhancedContent, 'utf8');
                enhancedCount++;
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`❌ 处理文档时出错 ${targetFile}:`, error.message);
            return false;
        }
    }
    
    // 查找所有英文文档
    const englishFiles = findEnglishFiles(path.join(docsDir, 'en'));
    
    console.log(`📊 找到 ${englishFiles.length} 个英文文档`);
    
    // 分析每个文档对
    for (const englishFile of englishFiles) {
        const chineseRelativePath = englishFile.relativePath.replace(/^en\//, 'zh-CN/');
        const chineseFullPath = path.join(docsDir, chineseRelativePath);
        
        if (fs.existsSync(chineseFullPath)) {
            const analysis = analyzeContentDifference(englishFile.fullPath, chineseFullPath);
            
            if (analysis && analysis.difference > 0.3) { // 如果差异超过30%
                analysisResults.push({
                    englishFile: englishFile.relativePath,
                    chineseFile: chineseRelativePath,
                    analysis
                });
                
                // 增强较简单的文档
                if (analysis.moreDetailed === 'chinese') {
                    enhanceDocument(chineseFullPath, englishFile.fullPath, 'chinese');
                } else if (analysis.moreDetailed === 'english') {
                    enhanceDocument(englishFile.fullPath, chineseFullPath, 'english');
                }
            }
        }
    }
    
    // 输出分析结果
    console.log('\n📊 文档内容差异分析结果:');
    console.log(`总计分析: ${analysisResults.length} 个文档对`);
    console.log(`增强文档: ${enhancedCount} 个`);
    
    // 显示前10个最大差异的文档
    const topDifferences = analysisResults
        .sort((a, b) => b.analysis.difference - a.analysis.difference)
        .slice(0, 10);
    
    console.log('\n🔍 内容差异最大的10个文档对:');
    for (const result of topDifferences) {
        console.log(`${result.englishFile} vs ${result.chineseFile}`);
        console.log(`  更详细: ${result.analysis.moreDetailed === 'chinese' ? '中文' : '英文'}`);
        console.log(`  差异: ${(result.analysis.difference * 100).toFixed(1)}%`);
        console.log('');
    }
    
    console.log(`✅ 文档对等性增强完成！增强了 ${enhancedCount} 个文档。`);
}

// 运行增强
enhanceDocumentParity();
