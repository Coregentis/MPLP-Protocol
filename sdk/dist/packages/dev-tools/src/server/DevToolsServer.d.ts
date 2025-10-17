/**
 * @fileoverview Development Tools Server - HTTP server for dev tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
/**
 * Development tools server
 */
export declare class DevToolsServer {
    private app;
    private server?;
    private wsServer?;
    private debugManager;
    private performanceAnalyzer;
    private port;
    private isRunning;
    constructor(config?: any);
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Stop the server
     */
    stop(): Promise<void>;
    /**
     * Setup WebSocket server
     */
    private setupWebSocket;
    /**
     * Broadcast message to all WebSocket clients
     */
    private broadcastToClients;
    /**
     * Get server port
     */
    getPort(): number;
    /**
     * Check if server is running
     */
    isServerRunning(): boolean;
}
//# sourceMappingURL=DevToolsServer.d.ts.map