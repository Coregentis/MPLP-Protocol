/**
 * MPLP性能监控框架集成示例
 *
 * 展示如何在应用程序中集成性能监控框架。
 *
 * @version v1.0.0
 * @created 2025-07-16T14:30:00+08:00
 */

import express from 'express';
import { createMonitor } from '../core/performance';
import { PlanManager } from '../modules/plan/plan-manager';
import { ContextManager } from '../modules/context/context-manager';

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 创建性能监控客户端
const monitor = createMonitor();

/**
 * 应用程序启动函数
 */
async function bootstrap() {
  console.log('正在启动应用...');
  
  // 初始化性能监控
  await initPerformanceMonitoring();
  
  // 加载应用组件
  await loadApplicationComponents();
  
  // 配置Express中间件和路由
  configureExpressApp();
  
  // 启动服务器
  startServer();
}

/**
 * 初始化性能监控
 */
async function initPerformanceMonitoring() {
  console.log('初始化性能监控...');
  
  try {
    // 启动监控
    await monitor.start();
    console.log('性能监控已启动');
  } catch (error) {
    console.error('性能监控启动失败:', error);
  }
}

/**
 * 加载应用程序组件
 */
async function loadApplicationComponents() {
  console.log('加载应用组件...');
  
  // 使用计时器测量组件加载时间
  await monitor.timeAsync('app.components.loading_time', async () => {
    // 初始化Context管理器
    const contextManager = new ContextManager();
    await monitor.timeAsync('app.components.context_manager_init', async () => {
      await contextManager.init();
    });
    
    // 初始化Plan管理器
    const planManager = new PlanManager();
    await monitor.timeAsync('app.components.plan_manager_init', async () => {
      await planManager.init();
    });
    
    // 注册其他应用组件...
  });
  
  console.log('应用组件加载完成');
}

/**
 * 配置Express应用
 */
function configureExpressApp() {
  console.log('配置Express应用...');
  
  // 添加监控中间件
  app.use(monitor.apiMetricsMiddleware());
  
  // 基础中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // 设置路由
  configureRoutes();
}

/**
 * 配置API路由
 */
function configureRoutes() {
  // 健康检查路由
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // 指标路由
  app.get('/metrics', async (req, res) => {
    // 收集所有指标
    const metrics = monitor.registry.getAllMetrics();
    
    // 转换为可序列化的格式
    const serializableMetrics = metrics.map(metric => ({
      name: metric.name,
      type: metric.type,
      value: metric.value,
      description: metric.description,
      unit: metric.unit,
      timestamp: metric.timestamp
    }));
    
    res.json({ metrics: serializableMetrics });
  });
  
  // 模拟API路由
  app.get('/api/contexts', async (req, res) => {
    try {
      // 使用计时器测量API处理时间
      const result = await monitor.timeAsync('api.contexts.get_time', async () => {
        // 模拟数据库查询延迟
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 模拟数据
        return [
          { id: 1, name: 'Context 1' },
          { id: 2, name: 'Context 2' }
        ];
      });
      
      // 计数成功请求
      monitor.counter('api.contexts.success').increment();
      
      res.json(result);
    } catch (error) {
      // 计数失败请求
      monitor.counter('api.contexts.error').increment();
      
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/plans', async (req, res) => {
    try {
      // 记录请求大小
      const requestSize = JSON.stringify(req.body).length;
      monitor.histogram('api.plans.request_size').update(requestSize);
      
      // 使用计时器测量API处理时间
      const result = await monitor.timeAsync('api.plans.create_time', async () => {
        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 模拟创建结果
        return { 
          id: 'plan-' + Date.now(),
          name: req.body.name || 'New Plan',
          created: new Date().toISOString()
        };
      });
      
      // 计数成功请求
      monitor.counter('api.plans.created').increment();
      
      res.status(201).json(result);
    } catch (error) {
      // 计数失败请求
      monitor.counter('api.plans.error').increment();
      
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // 其他路由...
}

/**
 * 启动HTTP服务器
 */
function startServer() {
  app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
    
    // 记录服务器启动事件
    monitor.counter('app.server_starts').increment();
    
    // 开始记录服务器运行时间
    const uptimeGauge = monitor.gauge('app.uptime_seconds');
    
    // 每10秒更新一次运行时间
    setInterval(() => {
      const uptimeSeconds = process.uptime();
      uptimeGauge.update(uptimeSeconds);
    }, 10000);
  });
}

// 启动应用并处理错误
bootstrap().catch(error => {
  console.error('应用启动失败:', error);
  process.exit(1);
}); 