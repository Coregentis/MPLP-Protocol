/**
 * @fileoverview Development Tools Server - HTTP server for dev tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import express from 'express';
import cors from 'cors';
import { createServer, Server } from 'http';
import { WebSocketServer } from 'ws';
import { DebugManager } from '../debug/DebugManager';
import { PerformanceAnalyzer } from '../performance/PerformanceAnalyzer';

/**
 * Development tools server
 */
export class DevToolsServer {
  private app: express.Application;
  private server?: Server;
  private wsServer?: WebSocketServer;
  private debugManager: DebugManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  private port: number;
  private isRunning = false;

  constructor(config: any = {}) {
    this.port = config.port || 3002;
    this.app = express();
    this.debugManager = new DebugManager(config.debug || {});
    this.performanceAnalyzer = new PerformanceAnalyzer();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Debug API
    this.app.get('/api/debug/status', (req, res) => {
      res.json(this.debugManager.getStatistics());
    });

    this.app.post('/api/debug/start', async (req, res) => {
      try {
        await this.debugManager.start();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/debug/stop', async (req, res) => {
      try {
        await this.debugManager.stop();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Performance API
    this.app.get('/api/performance/metrics', (req, res) => {
      res.json(this.performanceAnalyzer.getPerformanceSummary());
    });

    this.app.post('/api/performance/start', async (req, res) => {
      try {
        await this.performanceAnalyzer.start();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/performance/stop', async (req, res) => {
      try {
        await this.performanceAnalyzer.stop();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Dashboard
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>MPLP Development Tools</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .button { background: #007acc; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; margin: 5px; }
            .button:hover { background: #005a9e; }
            .status { padding: 10px; border-radius: 3px; margin: 10px 0; }
            .status.active { background: #d4edda; color: #155724; }
            .status.inactive { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <h1 class="header">🛠️ MPLP Development Tools</h1>
          
          <div class="section">
            <h2>Debug Manager</h2>
            <div id="debug-status" class="status inactive">Status: Inactive</div>
            <button class="button" onclick="startDebug()">Start Debugging</button>
            <button class="button" onclick="stopDebug()">Stop Debugging</button>
          </div>

          <div class="section">
            <h2>Performance Analyzer</h2>
            <div id="perf-status" class="status inactive">Status: Inactive</div>
            <button class="button" onclick="startPerf()">Start Analysis</button>
            <button class="button" onclick="stopPerf()">Stop Analysis</button>
          </div>

          <div class="section">
            <h2>API Endpoints</h2>
            <ul>
              <li><a href="/api/debug/status">Debug Status</a></li>
              <li><a href="/api/performance/metrics">Performance Metrics</a></li>
              <li><a href="/health">Health Check</a></li>
            </ul>
          </div>

          <script>
            async function startDebug() {
              const response = await fetch('/api/debug/start', { method: 'POST' });
              updateDebugStatus();
            }
            
            async function stopDebug() {
              const response = await fetch('/api/debug/stop', { method: 'POST' });
              updateDebugStatus();
            }
            
            async function startPerf() {
              const response = await fetch('/api/performance/start', { method: 'POST' });
              updatePerfStatus();
            }
            
            async function stopPerf() {
              const response = await fetch('/api/performance/stop', { method: 'POST' });
              updatePerfStatus();
            }
            
            async function updateDebugStatus() {
              const response = await fetch('/api/debug/status');
              const data = await response.json();
              const statusEl = document.getElementById('debug-status');
              statusEl.textContent = 'Status: ' + (data.isActive ? 'Active' : 'Inactive');
              statusEl.className = 'status ' + (data.isActive ? 'active' : 'inactive');
            }
            
            async function updatePerfStatus() {
              const response = await fetch('/api/performance/metrics');
              const data = await response.json();
              const statusEl = document.getElementById('perf-status');
              statusEl.textContent = 'Status: ' + (data.isActive ? 'Active' : 'Inactive');
              statusEl.className = 'status ' + (data.isActive ? 'active' : 'inactive');
            }
            
            // Update status on load
            updateDebugStatus();
            updatePerfStatus();
            
            // Auto-refresh every 5 seconds
            setInterval(() => {
              updateDebugStatus();
              updatePerfStatus();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);
      
      // Setup WebSocket server
      this.wsServer = new WebSocketServer({ server: this.server });
      this.setupWebSocket();

      this.server.listen(this.port, () => {
        this.isRunning = true;
        console.log(`🛠️  MPLP Dev Tools Server running on http://localhost:${this.port}`);
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.isRunning = false;
        resolve();
      });
    });
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocket(): void {
    if (!this.wsServer) {
      return;
    }

    this.wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Send initial status
      ws.send(JSON.stringify({
        type: 'status',
        data: {
          debug: this.debugManager.getStatistics(),
          performance: this.performanceAnalyzer.getPerformanceSummary()
        }
      }));

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    // Forward events to WebSocket clients
    this.debugManager.on('debugEvent', (event) => {
      this.broadcastToClients({
        type: 'debugEvent',
        data: event
      });
    });

    this.performanceAnalyzer.on('metricRecorded', (metric) => {
      this.broadcastToClients({
        type: 'metricRecorded',
        data: metric
      });
    });
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  private broadcastToClients(message: any): void {
    if (!this.wsServer) {
      return;
    }

    const messageStr = JSON.stringify(message);
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  /**
   * Get server port
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }
}
