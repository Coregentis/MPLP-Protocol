"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabCoordinationService = void 0;
class CollabCoordinationService {
    validateCoordinationCompatibility(strategy, participants) {
        const violations = [];
        const recommendations = [];
        const minParticipants = this.getMinimumParticipants(strategy.type);
        if (participants.length < minParticipants) {
            violations.push(`${strategy.type} coordination requires at least ${minParticipants} participants`);
        }
        if (strategy.requiresCoordinator()) {
            if (!strategy.coordinatorId) {
                violations.push('Coordinator ID is required for centralized/hierarchical coordination');
            }
            else {
                const coordinatorExists = participants.some(p => p.agentId === strategy.coordinatorId);
                if (!coordinatorExists) {
                    violations.push('Coordinator must be one of the collaboration participants');
                }
            }
        }
        if (!strategy.supportsDecisionMaking(strategy.decisionMaking)) {
            violations.push(`${strategy.decisionMaking} decision making is not supported for ${strategy.type} coordination`);
        }
        if (strategy.type === 'distributed' && participants.length > 10) {
            recommendations.push('Consider hierarchical coordination for better scalability with large participant groups');
        }
        if (strategy.type === 'peer_to_peer' && participants.length > 5) {
            recommendations.push('Peer-to-peer coordination may become inefficient with more than 5 participants');
        }
        return {
            isValid: violations.length === 0,
            violations,
            recommendations
        };
    }
    calculateOptimalStrategy(mode, participantCount, participantCapabilities) {
        const reasoning = [];
        let recommendedType;
        let recommendedDecisionMaking;
        if (mode === 'sequential') {
            recommendedType = 'centralized';
            recommendedDecisionMaking = 'coordinator';
            reasoning.push('Sequential mode benefits from centralized coordination for task ordering');
        }
        else if (mode === 'parallel' && participantCount <= 5) {
            recommendedType = 'distributed';
            recommendedDecisionMaking = 'consensus';
            reasoning.push('Small parallel groups work well with distributed consensus');
        }
        else if (mode === 'parallel' && participantCount > 5) {
            recommendedType = 'hierarchical';
            recommendedDecisionMaking = 'majority';
            reasoning.push('Large parallel groups benefit from hierarchical coordination');
        }
        else if (mode === 'pipeline') {
            recommendedType = 'centralized';
            recommendedDecisionMaking = 'coordinator';
            reasoning.push('Pipeline mode requires centralized coordination for flow management');
        }
        else if (mode === 'mesh') {
            recommendedType = 'peer_to_peer';
            recommendedDecisionMaking = 'consensus';
            reasoning.push('Mesh mode naturally aligns with peer-to-peer coordination');
        }
        else {
            if (participantCount <= 3) {
                recommendedType = 'peer_to_peer';
                recommendedDecisionMaking = 'consensus';
                reasoning.push('Small hybrid groups can use peer-to-peer coordination');
            }
            else {
                recommendedType = 'hierarchical';
                recommendedDecisionMaking = 'weighted';
                reasoning.push('Larger hybrid groups benefit from hierarchical weighted decisions');
            }
        }
        const uniqueCapabilities = new Set(participantCapabilities.flat()).size;
        const avgCapabilitiesPerParticipant = participantCapabilities.reduce((sum, caps) => sum + caps.length, 0) / participantCount;
        if (uniqueCapabilities > participantCount * 2 && avgCapabilitiesPerParticipant > 3) {
            if (recommendedDecisionMaking === 'consensus') {
                recommendedDecisionMaking = 'weighted';
                reasoning.push('High capability diversity suggests weighted decision making');
            }
        }
        return {
            recommendedType,
            recommendedDecisionMaking,
            reasoning
        };
    }
    assessCollaborationHealth(collaboration) {
        const issues = [];
        const recommendations = [];
        let healthScore = 100;
        const activeParticipants = collaboration.getActiveParticipants();
        const participantUtilization = activeParticipants.length / collaboration.participants.length;
        if (participantUtilization < 0.8) {
            healthScore -= 20;
            issues.push('Low participant utilization');
            recommendations.push('Review inactive participants and consider removing or reactivating them');
        }
        const strategy = collaboration.coordinationStrategy;
        const participantCount = collaboration.participants.length;
        let coordinationEfficiency = 1.0;
        if (strategy.type === 'peer_to_peer' && participantCount > 5) {
            coordinationEfficiency = 0.6;
            healthScore -= 15;
            issues.push('Peer-to-peer coordination may be inefficient for this group size');
            recommendations.push('Consider switching to hierarchical coordination');
        }
        if (strategy.type === 'centralized' && !strategy.coordinatorId) {
            coordinationEfficiency = 0.3;
            healthScore -= 30;
            issues.push('Centralized coordination missing coordinator');
            recommendations.push('Assign a coordinator or switch to distributed coordination');
        }
        let decisionMakingSpeed = 1.0;
        if (strategy.decisionMaking === 'consensus' && participantCount > 7) {
            decisionMakingSpeed = 0.5;
            healthScore -= 10;
            issues.push('Consensus decision making may be slow with large groups');
            recommendations.push('Consider majority or weighted decision making');
        }
        const allCapabilities = collaboration.participants.flatMap(p => p.capabilities || []);
        const uniqueCapabilities = new Set(allCapabilities);
        if (uniqueCapabilities.size < 3) {
            healthScore -= 10;
            issues.push('Limited capability diversity');
            recommendations.push('Consider adding participants with complementary capabilities');
        }
        return {
            healthScore: Math.max(0, healthScore),
            issues,
            recommendations,
            metrics: {
                participantUtilization,
                coordinationEfficiency,
                decisionMakingSpeed
            }
        };
    }
    generateCoordinationRecommendations(collaboration) {
        const strategyRecommendations = [];
        const participantRecommendations = [];
        const processRecommendations = [];
        const health = this.assessCollaborationHealth(collaboration);
        const optimal = this.calculateOptimalStrategy(collaboration.mode, collaboration.participants.length, collaboration.participants.map(p => p.capabilities || []));
        if (collaboration.coordinationStrategy.type !== optimal.recommendedType) {
            strategyRecommendations.push(`Consider switching from ${collaboration.coordinationStrategy.type} to ${optimal.recommendedType} coordination`);
        }
        if (collaboration.coordinationStrategy.decisionMaking !== optimal.recommendedDecisionMaking) {
            strategyRecommendations.push(`Consider switching from ${collaboration.coordinationStrategy.decisionMaking} to ${optimal.recommendedDecisionMaking} decision making`);
        }
        const inactiveCount = collaboration.participants.length - collaboration.getActiveParticipants().length;
        if (inactiveCount > 0) {
            participantRecommendations.push(`Reactivate or remove ${inactiveCount} inactive participants`);
        }
        if (collaboration.participants.length < 2) {
            participantRecommendations.push('Add more participants to enable effective collaboration');
        }
        if (health.healthScore < 70) {
            processRecommendations.push('Review and optimize collaboration processes');
        }
        if (health.metrics.decisionMakingSpeed < 0.7) {
            processRecommendations.push('Implement faster decision-making mechanisms');
        }
        return {
            strategyRecommendations,
            participantRecommendations,
            processRecommendations
        };
    }
    getMinimumParticipants(type) {
        switch (type) {
            case 'centralized':
                return 2;
            case 'distributed':
                return 2;
            case 'hierarchical':
                return 3;
            case 'peer_to_peer':
                return 2;
            default:
                return 2;
        }
    }
}
exports.CollabCoordinationService = CollabCoordinationService;
