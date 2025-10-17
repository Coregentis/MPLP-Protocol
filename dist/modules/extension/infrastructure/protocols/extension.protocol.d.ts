import { IMLPPProtocol, ProtocolMetadata, HealthStatus, MLPPRequest, MLPPResponse } from '../../../../core/protocols/mplp-protocol-base';
import { ExtensionProtocolConfig, ExtensionProtocolDependencies } from '../factories/extension-protocol.factory';
export declare class ExtensionProtocol implements IMLPPProtocol {
    private readonly config;
    private readonly dependencies;
    private readonly adapter;
    private isInitialized;
    constructor(config: ExtensionProtocolConfig, dependencies: ExtensionProtocolDependencies);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    handleRequest(request: MLPPRequest): Promise<MLPPResponse>;
    private initializeL3Managers;
    private initializeCrossCuttingConcerns;
    private initializeExtensionManager;
    private deactivateAllExtensions;
    private shutdownL3Managers;
    getMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
}
//# sourceMappingURL=extension.protocol.d.ts.map