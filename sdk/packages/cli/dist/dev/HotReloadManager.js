"use strict";
/**
 * @fileoverview Hot reload manager implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadManager = void 0;
const events_1 = require("events");
const MPLPEventManager_1 = require("../core/MPLPEventManager");
/**
 * Hot reload manager implementation
 */
class HotReloadManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.clients = new Set();
        this._isEnabled = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = config;
    }
    // ===== EventEmitter兼容方法 =====
    on(event, listener) { this.eventManager.on(event, listener); return this; }
    emit(event, ...args) { return this.eventManager.emit(event, ...args); }
    off(event, listener) { this.eventManager.off(event, listener); return this; }
    removeAllListeners(event) { this.eventManager.removeAllListeners(event); return this; }
    /**
     * Get enabled status
     */
    get isEnabled() {
        return this._isEnabled;
    }
    /**
     * Get connected clients count
     */
    get connectedClients() {
        return this.clients.size;
    }
    /**
     * Enable hot reload
     */
    enable() {
        this._isEnabled = true;
        this.emit('hotreload:enable');
    }
    /**
     * Disable hot reload
     */
    disable() {
        this._isEnabled = false;
        this.clients.clear();
        this.emit('hotreload:disable');
    }
    /**
     * Reload all clients
     */
    reload(files) {
        if (!this._isEnabled) {
            return;
        }
        const message = {
            type: 'hot-reload',
            data: {
                action: 'reload',
                files: files || [],
                timestamp: Date.now()
            }
        };
        this.broadcast(message);
        this.emit('hotreload:reload', files);
    }
    /**
     * Update specific files
     */
    update(files) {
        if (!this._isEnabled) {
            return;
        }
        const message = {
            type: 'hot-reload',
            data: {
                action: 'update',
                files,
                timestamp: Date.now()
            }
        };
        this.broadcast(message);
        this.emit('hotreload:update', files);
    }
    /**
     * Add client
     */
    addClient(client) {
        this.clients.add(client);
        this.emit('client:connect', client);
    }
    /**
     * Remove client
     */
    removeClient(client) {
        this.clients.delete(client);
        this.emit('client:disconnect', client);
    }
    /**
     * Broadcast message to all clients
     */
    broadcast(message) {
        if (!this._isEnabled) {
            return;
        }
        // In a real implementation, this would send WebSocket messages
        // For now, we'll just emit an event
        this.emit('broadcast', message);
        // Simulate sending to clients
        for (const client of this.clients) {
            try {
                // client.send(JSON.stringify(message));
            }
            catch (error) {
                // Remove disconnected clients
                this.clients.delete(client);
            }
        }
    }
}
exports.HotReloadManager = HotReloadManager;
//# sourceMappingURL=HotReloadManager.js.map