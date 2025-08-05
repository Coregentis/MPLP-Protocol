/**
 * Express服务器配置
 */
import express from 'express';
import { config } from './config';

export function createServer(): express.Application {
  const app = express();

  // 中间件配置
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 健康检查路由
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API路由
  app.use('/api', (req, res) => {
    res.json({ message: 'MPLP API Server' });
  });

  return app;
}

export default createServer;
