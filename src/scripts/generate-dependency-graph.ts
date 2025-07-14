/**
 * MPLP模块依赖关系图生成工具
 * 
 * 该脚本用于生成项目模块依赖关系图，支持DOT格式输出和Markdown报告生成。
 * 
 * @version v1.0.0
 * @created 2025-07-15T11:30:00+08:00
 */

import * as path from 'path';
import * as fs from 'fs';
import { EventBus } from '../core/event-bus';
import { DependencyAnalyzer } from '../core/dependency-analyzer';
import { EventType, DependencyGraphGeneratedEventData } from '../core/event-types';

// 项目根目录
const rootDir = path.resolve(__dirname, '../..');

// 命令行参数
const args = process.argv.slice(2);
const outputDir = args[0] || path.join(rootDir, 'docs/architecture');
const verbose = args.includes('--verbose') || args.includes('-v');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 生成模块依赖关系图
 */
async function generateDependencyGraph(): Promise<void> {
  console.log('📊 生成MPLP模块依赖关系图...');
  console.log(`输出目录: ${outputDir}`);

  try {
    // 创建事件总线和依赖分析器
    const eventBus = new EventBus();
    const analyzer = new DependencyAnalyzer(eventBus, {
      rootDir,
      outputDir,
      excludePatterns: [
        /\.spec\.ts$/,
        /\.test\.ts$/,
        /__tests__/,
        /node_modules/,
        /\.d\.ts$/,
        /\.(js|jsx)$/
      ]
    });

    // 监听事件
    eventBus.subscribe(EventType.DEPENDENCY_GRAPH_GENERATED, (data: DependencyGraphGeneratedEventData) => {
      console.log(`依赖图生成完成: ${data.nodeCount}个节点, ${data.relationCount}个关系`);
      console.log(`生成时间: ${data.timestamp}`);
      console.log(`验证状态: ${data.isValid ? '✅ 通过' : '❌ 失败'}`);
    });

    // 分析所有模块并生成依赖图
    console.log('开始分析模块依赖关系...');
    await analyzer.generateGraph();

    // 导出可视化文件
    const dotFilePath = path.join(outputDir, 'dependency-graph.dot');
    await analyzer.exportGraphVisualization(dotFilePath);
    console.log(`依赖图DOT文件已生成: ${dotFilePath}`);
    console.log('可使用Graphviz转换为图像: dot -Tpng dependency-graph.dot -o dependency-graph.png');

    // 提示如何安装Graphviz（如果需要）
    console.log('\n如需将DOT文件转换为图像格式，请确保已安装Graphviz:');
    console.log('- Windows: 从https://graphviz.org/download/ 下载安装');
    console.log('- macOS: brew install graphviz');
    console.log('- Linux: apt-get install graphviz 或 yum install graphviz');

    console.log('\n✅ 依赖图生成完成!');
    
    // 自动尝试转换为PNG（如果系统已安装Graphviz）
    await convertToPng(dotFilePath);
  } catch (error) {
    console.error('❌ 生成依赖图时出错:', error);
    process.exit(1);
  }
}

/**
 * 尝试使用Graphviz将DOT文件转换为PNG图像
 */
async function convertToPng(dotFilePath: string): Promise<void> {
  const { exec } = require('child_process');
  
  return new Promise<void>((resolve) => {
    const pngPath = dotFilePath.replace('.dot', '.png');
    
    console.log('尝试转换DOT为PNG图像...');
    
    exec(`dot -Tpng "${dotFilePath}" -o "${pngPath}"`, (error: any) => {
      if (error) {
        if (verbose) {
          console.log('无法转换为PNG图像，可能未安装Graphviz或发生错误:', error.message);
        } else {
          console.log('无法自动转换为PNG图像，请手动使用Graphviz转换。');
        }
      } else {
        console.log(`✅ 图像已生成: ${pngPath}`);
      }
      resolve();
    });
  });
}

// 执行生成过程
generateDependencyGraph().catch(error => {
  console.error('执行过程中出错:', error);
  process.exit(1);
}); 