/**
 * MPLP基准测试示例
 *
 * 展示如何使用基准测试框架测试不同组件和功能的性能。
 * 包含不同类型的基准测试示例，如吞吐量、延迟、资源使用等。
 *
 * @version v1.0.0
 * @created 2025-07-17T12:30:00+08:00
 */

import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { performance } from 'perf_hooks';
import {
  BenchmarkClient,
  BenchmarkType,
  BenchmarkLevel,
  BenchmarkContext
} from '../core/performance/benchmark';

// 创建基准测试客户端
const benchmarkClient = new BenchmarkClient('./reports/benchmark');

/**
 * 运行所有基准测试
 */
async function runAllBenchmarks() {
  console.log('开始运行基准测试...');

  await runCPUBenchmarks();
  await runMemoryBenchmarks();
  await runIOBenchmarks();
  await runComparisonBenchmarks();

  console.log('所有基准测试完成！');
}

/**
 * 运行CPU密集型基准测试
 */
async function runCPUBenchmarks() {
  console.log('\n运行CPU密集型基准测试...');

  // 示例1：斐波那契数列计算
  const fibResult = await benchmarkClient.createBenchmark('fibonacci')
    .withType(BenchmarkType.THROUGHPUT)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('计算斐波那契数列')
    .withTags(['cpu', 'math', 'recursion'])
    .withIterations(100)
    .withWarmup(5)
    .withThresholds({
      'duration': {
        mean: 10,
        p95: 15
      }
    })
    .run(async () => {
      fibonacci(30);
    });

  // 示例2：排序算法
  const sortResult = await benchmarkClient.createBenchmark('array_sort')
    .withType(BenchmarkType.THROUGHPUT)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('数组排序性能')
    .withTags(['cpu', 'sort', 'array'])
    .withIterations(50)
    .withParams({
      arraySize: 10000
    })
    .run(async (context) => {
      const arraySize = context.params.arraySize || 10000;
      const array = Array.from({ length: arraySize }, () => Math.random());
      array.sort((a, b) => a - b);
    });

  // 示例3：哈希计算
  const hashResult = await benchmarkClient.createBenchmark('hash_calculation')
    .withType(BenchmarkType.THROUGHPUT)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('SHA-256哈希计算')
    .withTags(['cpu', 'crypto', 'hash'])
    .withIterations(100)
    .run(async () => {
      const data = Buffer.from('a'.repeat(10000));
      crypto.createHash('sha256').update(data).digest('hex');
    });

  console.log('CPU密集型基准测试完成！');
}

/**
 * 运行内存密集型基准测试
 */
async function runMemoryBenchmarks() {
  console.log('\n运行内存密集型基准测试...');

  // 示例1：大数组创建
  const arrayResult = await benchmarkClient.createBenchmark('large_array_creation')
    .withType(BenchmarkType.RESOURCE)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('创建大型数组')
    .withTags(['memory', 'array'])
    .withIterations(20)
    .run(async () => {
      const largeArray = new Array(1000000).fill(0).map((_, i) => i);
    });

  // 示例2：字符串连接
  const stringResult = await benchmarkClient.createBenchmark('string_concatenation')
    .withType(BenchmarkType.RESOURCE)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('字符串连接')
    .withTags(['memory', 'string'])
    .withIterations(50)
    .run(async () => {
      let result = '';
      for (let i = 0; i < 100000; i++) {
        result += 'a';
      }
    });

  // 示例3：对象创建
  const objectResult = await benchmarkClient.createBenchmark('object_creation')
    .withType(BenchmarkType.RESOURCE)
    .withLevel(BenchmarkLevel.UNIT)
    .withDescription('创建大量对象')
    .withTags(['memory', 'object'])
    .withIterations(20)
    .run(async () => {
      const objects = [];
      for (let i = 0; i < 100000; i++) {
        objects.push({
          id: i,
          name: `item-${i}`,
          value: Math.random(),
          data: {
            created: new Date(),
            updated: new Date(),
            tags: ['tag1', 'tag2', 'tag3']
          }
        });
      }
    });

  console.log('内存密集型基准测试完成！');
}

/**
 * 运行IO密集型基准测试
 */
async function runIOBenchmarks() {
  console.log('\n运行IO密集型基准测试...');

  // 准备测试文件
  const testDir = './temp/benchmark';
  await fs.mkdir(testDir, { recursive: true });
  const testFile = `${testDir}/test-file.txt`;
  await fs.writeFile(testFile, 'a'.repeat(1024 * 1024)); // 1MB文件

  // 示例1：文件读取
  const readResult = await benchmarkClient.createBenchmark('file_read')
    .withType(BenchmarkType.LATENCY)
    .withLevel(BenchmarkLevel.COMPONENT)
    .withDescription('文件读取性能')
    .withTags(['io', 'file', 'read'])
    .withIterations(20)
    .run(async () => {
      await fs.readFile(testFile, 'utf8');
    });

  // 示例2：文件写入
  const writeResult = await benchmarkClient.createBenchmark('file_write')
    .withType(BenchmarkType.LATENCY)
    .withLevel(BenchmarkLevel.COMPONENT)
    .withDescription('文件写入性能')
    .withTags(['io', 'file', 'write'])
    .withIterations(20)
    .run(async () => {
      const writeFile = `${testDir}/write-test-${Date.now()}.txt`;
      await fs.writeFile(writeFile, 'b'.repeat(1024 * 1024));
      await fs.unlink(writeFile);
    });

  // 示例3：文件复制
  const copyResult = await benchmarkClient.createBenchmark('file_copy')
    .withType(BenchmarkType.LATENCY)
    .withLevel(BenchmarkLevel.COMPONENT)
    .withDescription('文件复制性能')
    .withTags(['io', 'file', 'copy'])
    .withIterations(10)
    .run(async () => {
      const copyFile = `${testDir}/copy-test-${Date.now()}.txt`;
      await fs.copyFile(testFile, copyFile);
      await fs.unlink(copyFile);
    });

  // 清理测试文件
  await fs.unlink(testFile);
  await fs.rmdir(testDir);

  console.log('IO密集型基准测试完成！');
}

/**
 * 运行比较基准测试
 */
async function runComparisonBenchmarks() {
  console.log('\n运行比较基准测试...');

  // 比较不同JSON解析方法
  const results = await benchmarkClient.runMultiple([
    {
      name: 'json_parse_native',
      type: BenchmarkType.THROUGHPUT,
      level: BenchmarkLevel.UNIT,
      iterations: 1000,
      fn: async () => {
        const obj = { a: 1, b: 'test', c: [1, 2, 3], d: { e: true, f: null } };
        const json = JSON.stringify(obj);
        JSON.parse(json);
      }
    },
    {
      name: 'json_parse_try_catch',
      type: BenchmarkType.THROUGHPUT,
      level: BenchmarkLevel.UNIT,
      iterations: 1000,
      fn: async () => {
        const obj = { a: 1, b: 'test', c: [1, 2, 3], d: { e: true, f: null } };
        const json = JSON.stringify(obj);
        try {
          JSON.parse(json);
        } catch (error) {
          // 忽略错误
        }
      }
    }
  ]);

  console.log('比较基准测试完成！');
}

/**
 * 斐波那契数列计算（递归实现）
 * @param n 项数
 * @returns 斐波那契数
 */
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 如果直接运行此文件，则执行所有基准测试
if (require.main === module) {
  runAllBenchmarks().catch(console.error);
} 