/**
 * MPLP v1.0 监控指标路由
 */

import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Metrics endpoint - TODO: implement' });
});

export { router as metricsRouter }; 