import { CollabEntity, CollabParticipant, CollabCoordinationStrategy } from '../entities/collab.entity';
export declare class CollabCoordinationService {
    validateCoordinationCompatibility(strategy: CollabCoordinationStrategy, participants: CollabParticipant[]): {
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    };
    calculateOptimalStrategy(mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh', participantCount: number, participantCapabilities: string[][]): {
        recommendedType: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
        recommendedDecisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
        reasoning: string[];
    };
    assessCollaborationHealth(collaboration: CollabEntity): {
        healthScore: number;
        issues: string[];
        recommendations: string[];
        metrics: {
            participantUtilization: number;
            coordinationEfficiency: number;
            decisionMakingSpeed: number;
        };
    };
    generateCoordinationRecommendations(collaboration: CollabEntity): {
        strategyRecommendations: string[];
        participantRecommendations: string[];
        processRecommendations: string[];
    };
    private getMinimumParticipants;
}
//# sourceMappingURL=collab-coordination.service.d.ts.map