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
export class CollabCoordinationService {
  
  /**
   * Validate coordination strategy compatibility with participants
   */
  validateCoordinationCompatibility(
    strategy: CollabCoordinationStrategy, 
    participants: CollabParticipant[]
  ): { isValid: boolean; violations: string[]; recommendations: string[] } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check minimum participants for strategy type
    const minParticipants = this.getMinimumParticipants(strategy.type);
    if (participants.length < minParticipants) {
      violations.push(`${strategy.type} coordination requires at least ${minParticipants} participants`);
    }

    // Check coordinator requirements
    if (strategy.requiresCoordinator()) {
      if (!strategy.coordinatorId) {
        violations.push('Coordinator ID is required for centralized/hierarchical coordination');
      } else {
        const coordinatorExists = participants.some(p => p.agentId === strategy.coordinatorId);
        if (!coordinatorExists) {
          violations.push('Coordinator must be one of the collaboration participants');
        }
      }
    }

    // Check decision making compatibility
    if (!strategy.supportsDecisionMaking(strategy.decisionMaking)) {
      violations.push(`${strategy.decisionMaking} decision making is not supported for ${strategy.type} coordination`);
    }

    // Generate recommendations
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

  /**
   * Calculate optimal coordination strategy based on collaboration characteristics
   */
  calculateOptimalStrategy(
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh',
    participantCount: number,
    participantCapabilities: string[][]
  ): {
    recommendedType: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    recommendedDecisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
    reasoning: string[];
  } {
    const reasoning: string[] = [];

    // Determine coordination type based on mode and participant count
    let recommendedType: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    let recommendedDecisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';

    if (mode === 'sequential') {
      recommendedType = 'centralized';
      recommendedDecisionMaking = 'coordinator';
      reasoning.push('Sequential mode benefits from centralized coordination for task ordering');
    } else if (mode === 'parallel' && participantCount <= 5) {
      recommendedType = 'distributed';
      recommendedDecisionMaking = 'consensus';
      reasoning.push('Small parallel groups work well with distributed consensus');
    } else if (mode === 'parallel' && participantCount > 5) {
      recommendedType = 'hierarchical';
      recommendedDecisionMaking = 'majority';
      reasoning.push('Large parallel groups benefit from hierarchical coordination');
    } else if (mode === 'pipeline') {
      recommendedType = 'centralized';
      recommendedDecisionMaking = 'coordinator';
      reasoning.push('Pipeline mode requires centralized coordination for flow management');
    } else if (mode === 'mesh') {
      recommendedType = 'peer_to_peer';
      recommendedDecisionMaking = 'consensus';
      reasoning.push('Mesh mode naturally aligns with peer-to-peer coordination');
    } else {
      // Hybrid mode
      if (participantCount <= 3) {
        recommendedType = 'peer_to_peer';
        recommendedDecisionMaking = 'consensus';
        reasoning.push('Small hybrid groups can use peer-to-peer coordination');
      } else {
        recommendedType = 'hierarchical';
        recommendedDecisionMaking = 'weighted';
        reasoning.push('Larger hybrid groups benefit from hierarchical weighted decisions');
      }
    }

    // Adjust based on capability diversity
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

  /**
   * Assess collaboration health and performance
   */
  assessCollaborationHealth(collaboration: CollabEntity): {
    healthScore: number; // 0-100
    issues: string[];
    recommendations: string[];
    metrics: {
      participantUtilization: number;
      coordinationEfficiency: number;
      decisionMakingSpeed: number;
    };
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let healthScore = 100;

    // Check participant status distribution
    const activeParticipants = collaboration.getActiveParticipants();
    const participantUtilization = activeParticipants.length / collaboration.participants.length;

    if (participantUtilization < 0.8) {
      healthScore -= 20;
      issues.push('Low participant utilization');
      recommendations.push('Review inactive participants and consider removing or reactivating them');
    }

    // Check coordination strategy effectiveness
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

    // Estimate decision making speed based on strategy
    let decisionMakingSpeed = 1.0;
    if (strategy.decisionMaking === 'consensus' && participantCount > 7) {
      decisionMakingSpeed = 0.5;
      healthScore -= 10;
      issues.push('Consensus decision making may be slow with large groups');
      recommendations.push('Consider majority or weighted decision making');
    }

    // Check for capability gaps
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

  /**
   * Generate coordination recommendations for collaboration optimization
   */
  generateCoordinationRecommendations(collaboration: CollabEntity): {
    strategyRecommendations: string[];
    participantRecommendations: string[];
    processRecommendations: string[];
  } {
    const strategyRecommendations: string[] = [];
    const participantRecommendations: string[] = [];
    const processRecommendations: string[] = [];

    const health = this.assessCollaborationHealth(collaboration);
    const optimal = this.calculateOptimalStrategy(
      collaboration.mode,
      collaboration.participants.length,
      collaboration.participants.map(p => p.capabilities || [])
    );

    // Strategy recommendations
    if (collaboration.coordinationStrategy.type !== optimal.recommendedType) {
      strategyRecommendations.push(
        `Consider switching from ${collaboration.coordinationStrategy.type} to ${optimal.recommendedType} coordination`
      );
    }

    if (collaboration.coordinationStrategy.decisionMaking !== optimal.recommendedDecisionMaking) {
      strategyRecommendations.push(
        `Consider switching from ${collaboration.coordinationStrategy.decisionMaking} to ${optimal.recommendedDecisionMaking} decision making`
      );
    }

    // Participant recommendations
    const inactiveCount = collaboration.participants.length - collaboration.getActiveParticipants().length;
    if (inactiveCount > 0) {
      participantRecommendations.push(`Reactivate or remove ${inactiveCount} inactive participants`);
    }

    if (collaboration.participants.length < 2) {
      participantRecommendations.push('Add more participants to enable effective collaboration');
    }

    // Process recommendations
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

  /**
   * Get minimum participants required for coordination type
   */
  private getMinimumParticipants(type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer'): number {
    switch (type) {
      case 'centralized':
        return 2; // Coordinator + at least 1 participant
      case 'distributed':
        return 2; // Minimum for distributed consensus
      case 'hierarchical':
        return 3; // Multiple levels require at least 3
      case 'peer_to_peer':
        return 2; // Minimum for peer interaction
      default:
        return 2;
    }
  }
}
