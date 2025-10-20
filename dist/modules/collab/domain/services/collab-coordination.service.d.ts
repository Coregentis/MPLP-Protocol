/**
 * Collab Coordination Service - Domain Layer
 * @description Domain service for complex collaboration coordination logic
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { CollabEntity, CollabParticipant, CollabCoordinationStrategy } from '../entities/collab.entity';
/**
 * Collaboration Coordination Service
 * Handles complex coordination logic that doesn't belong to a single entity
 */
export declare class CollabCoordinationService {
    /**
     * Validate coordination strategy compatibility with participants
     */
    validateCoordinationCompatibility(strategy: CollabCoordinationStrategy, participants: CollabParticipant[]): {
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    };
    /**
     * Calculate optimal coordination strategy based on collaboration characteristics
     */
    calculateOptimalStrategy(mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh', participantCount: number, participantCapabilities: string[][]): {
        recommendedType: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
        recommendedDecisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
        reasoning: string[];
    };
    /**
     * Assess collaboration health and performance
     */
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
    /**
     * Generate coordination recommendations for collaboration optimization
     */
    generateCoordinationRecommendations(collaboration: CollabEntity): {
        strategyRecommendations: string[];
        participantRecommendations: string[];
        processRecommendations: string[];
    };
    /**
     * Get minimum participants required for coordination type
     */
    private getMinimumParticipants;
}
//# sourceMappingURL=collab-coordination.service.d.ts.map