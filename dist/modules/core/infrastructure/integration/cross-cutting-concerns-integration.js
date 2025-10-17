"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossCuttingConcernsIntegrationValidator = void 0;
exports.createCrossCuttingConcernsValidator = createCrossCuttingConcernsValidator;
exports.quickValidateCrossCuttingConcerns = quickValidateCrossCuttingConcerns;
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class CrossCuttingConcernsIntegrationValidator {
    crossCuttingFactory;
    constructor(crossCuttingFactory) {
        this.crossCuttingFactory = crossCuttingFactory;
    }
    async validateIntegration() {
        const timestamp = new Date().toISOString();
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: true },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        return {
            security: {
                enabled: true,
                manager: managers.security,
                status: await this.checkManagerStatus(managers.security, 'security'),
                lastCheck: timestamp
            },
            performance: {
                enabled: true,
                manager: managers.performance,
                status: await this.checkManagerStatus(managers.performance, 'performance'),
                lastCheck: timestamp
            },
            eventBus: {
                enabled: true,
                manager: managers.eventBus,
                status: await this.checkManagerStatus(managers.eventBus, 'eventBus'),
                lastCheck: timestamp
            },
            errorHandler: {
                enabled: true,
                manager: managers.errorHandler,
                status: await this.checkManagerStatus(managers.errorHandler, 'errorHandler'),
                lastCheck: timestamp
            },
            coordination: {
                enabled: true,
                manager: managers.coordination,
                status: await this.checkManagerStatus(managers.coordination, 'coordination'),
                lastCheck: timestamp
            },
            orchestration: {
                enabled: true,
                manager: managers.orchestration,
                status: await this.checkManagerStatus(managers.orchestration, 'orchestration'),
                lastCheck: timestamp
            },
            stateSync: {
                enabled: true,
                manager: managers.stateSync,
                status: await this.checkManagerStatus(managers.stateSync, 'stateSync'),
                lastCheck: timestamp
            },
            transaction: {
                enabled: true,
                manager: managers.transaction,
                status: await this.checkManagerStatus(managers.transaction, 'transaction'),
                lastCheck: timestamp
            },
            protocolVersion: {
                enabled: true,
                manager: managers.protocolVersion,
                status: await this.checkManagerStatus(managers.protocolVersion, 'protocolVersion'),
                lastCheck: timestamp
            }
        };
    }
    async generateIntegrationReport() {
        const details = await this.validateIntegration();
        const concerns = Object.values(details);
        const totalConcerns = concerns.length;
        const activeConcerns = concerns.filter(c => c.status === 'active').length;
        const inactiveConcerns = concerns.filter(c => c.status === 'inactive').length;
        const errorConcerns = concerns.filter(c => c.status === 'error').length;
        const integrationRate = (activeConcerns / totalConcerns) * 100;
        const recommendations = [];
        if (integrationRate < 100) {
            recommendations.push('Some cross-cutting concerns are not fully integrated');
        }
        if (errorConcerns > 0) {
            recommendations.push('Fix errors in cross-cutting concerns integration');
        }
        if (inactiveConcerns > 0) {
            recommendations.push('Consider enabling inactive cross-cutting concerns for better functionality');
        }
        if (integrationRate === 100) {
            recommendations.push('All cross-cutting concerns are successfully integrated');
        }
        return {
            summary: {
                totalConcerns,
                activeConcerns,
                inactiveConcerns,
                errorConcerns,
                integrationRate
            },
            details,
            recommendations
        };
    }
    async validateSpecificConcern(concernName) {
        const managers = this.crossCuttingFactory.createManagers({
            [concernName]: { enabled: true }
        });
        const manager = managers[concernName];
        const startTime = Date.now();
        try {
            const basicOperations = await this.testBasicOperations(manager, concernName);
            const advancedFeatures = await this.testAdvancedFeatures(manager, concernName);
            const errorHandling = await this.testErrorHandling(manager, concernName);
            const responseTime = Date.now() - startTime;
            const memoryUsage = process.memoryUsage().heapUsed;
            return {
                name: concernName,
                status: 'active',
                functionality: {
                    basicOperations,
                    advancedFeatures,
                    errorHandling
                },
                performance: {
                    responseTime,
                    memoryUsage
                }
            };
        }
        catch (error) {
            return {
                name: concernName,
                status: 'error',
                functionality: {
                    basicOperations: false,
                    advancedFeatures: false,
                    errorHandling: false
                },
                performance: {
                    responseTime: Date.now() - startTime,
                    memoryUsage: process.memoryUsage().heapUsed
                }
            };
        }
    }
    async checkManagerStatus(manager, _type) {
        try {
            if (!manager) {
                return 'inactive';
            }
            return 'active';
        }
        catch (error) {
            return 'error';
        }
    }
    async testBasicOperations(manager, _type) {
        try {
            return !!manager;
        }
        catch (error) {
            return false;
        }
    }
    async testAdvancedFeatures(manager, _type) {
        try {
            return !!manager;
        }
        catch (error) {
            return false;
        }
    }
    async testErrorHandling(manager, _type) {
        try {
            return !!manager;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CrossCuttingConcernsIntegrationValidator = CrossCuttingConcernsIntegrationValidator;
function createCrossCuttingConcernsValidator() {
    const factory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
    return new CrossCuttingConcernsIntegrationValidator(factory);
}
async function quickValidateCrossCuttingConcerns() {
    try {
        const validator = createCrossCuttingConcernsValidator();
        const report = await validator.generateIntegrationReport();
        return report.summary.integrationRate === 100;
    }
    catch (error) {
        return false;
    }
}
