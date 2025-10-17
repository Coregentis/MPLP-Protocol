/**
 * @fileoverview Project template manager for creating new MPLP projects
 */
import { ProjectTemplate, ProjectOptions } from '../core/types';
/**
 * Project template manager
 */
export declare class ProjectTemplateManager {
    private templates;
    constructor();
    /**
     * Initialize built-in templates
     */
    private initializeTemplates;
    /**
     * Load template files from directory
     */
    private loadTemplateFiles;
    /**
     * Get basic template files
     */
    private getBasicTemplateFiles;
    /**
     * Get fallback basic template files (when template directory doesn't exist)
     */
    private getFallbackBasicTemplateFiles;
    /**
     * Get advanced template files (fallback implementation)
     */
    private getAdvancedTemplateFilesFallback;
    /**
     * Get advanced template files
     */
    private getAdvancedTemplateFiles;
    /**
     * Get enterprise template files
     */
    private getEnterpriseTemplateFiles;
    /**
     * Create project from template
     */
    createProject(options: ProjectOptions, targetPath: string): Promise<void>;
    /**
     * Update package.json with template-specific configuration
     */
    private updatePackageJson;
    /**
     * Check if template exists
     */
    hasTemplate(name: string): boolean;
    /**
     * Get available templates
     */
    getAvailableTemplates(): string[];
    /**
     * Get template information
     */
    getTemplate(name: string): ProjectTemplate | undefined;
}
//# sourceMappingURL=ProjectTemplateManager.d.ts.map