/**
 * @fileoverview Package manager detection and operations
 */
import { PackageManager } from '../core/types';
/**
 * Package manager detector
 */
export declare class PackageManagerDetector {
    /**
     * Detect package manager from project directory
     */
    detect(projectPath: string): Promise<PackageManager>;
    /**
     * Get available package managers
     */
    private getAvailablePackageManagers;
    /**
     * Check if package manager is available
     */
    private isPackageManagerAvailable;
    /**
     * Get package manager version
     */
    getVersion(manager: 'npm' | 'yarn' | 'pnpm'): Promise<string | null>;
    /**
     * Get recommended package manager for project
     */
    getRecommended(projectPath: string): Promise<{
        manager: PackageManager;
        reason: string;
    }>;
    /**
     * Create package manager instance
     */
    create(name: 'npm' | 'yarn' | 'pnpm'): PackageManager;
}
//# sourceMappingURL=PackageManagerDetector.d.ts.map