"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmAnalyticsService = void 0;
class ConfirmAnalyticsService {
    confirmRepository;
    analyticsEngine;
    constructor(confirmRepository, analyticsEngine) {
        this.confirmRepository = confirmRepository;
        this.analyticsEngine = analyticsEngine;
    }
    async analyzeConfirmRequest(requestId) {
        const confirmRequest = await this.confirmRepository.findById(requestId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${requestId} not found`);
        }
        const approvalHistory = this.extractApprovalHistory(confirmRequest);
        return {
            requestId,
            timestamp: new Date().toISOString(),
            workflow: {
                totalSteps: approvalHistory.length,
                completedSteps: approvalHistory.filter(h => h.result).length,
                averageApprovalTime: this.calculateAverageApprovalTime(approvalHistory),
                bottlenecks: this.identifyBottlenecks(approvalHistory)
            },
            performance: {
                processingTime: this.calculateProcessingTime(confirmRequest, approvalHistory),
                efficiency: this.calculateEfficiency(confirmRequest, approvalHistory),
                approvalRate: this.calculateApprovalRate(approvalHistory)
            },
            insights: {
                recommendations: this.generateRecommendations(confirmRequest, approvalHistory),
                riskFactors: this.identifyRiskFactors(confirmRequest, approvalHistory)
            }
        };
    }
    async analyzeApprovalTrends(timeRange) {
        const requests = await this.confirmRepository.findByTimeRange(timeRange);
        return {
            timeRange,
            totalRequests: requests.length,
            approvalRate: this.calculateOverallApprovalRate(requests),
            averageProcessingTime: this.calculateAverageProcessingTime(requests),
            trends: {
                requestVolume: requests.length,
                approvalSpeed: this.calculateAverageProcessingTime(requests),
                rejectionRate: 1 - this.calculateOverallApprovalRate(requests)
            }
        };
    }
    async generateApprovalReport(reportType, params) {
        const requests = await this.confirmRepository.findByTimeRange(params.timeRange);
        const summary = {
            totalRequests: requests.length,
            approvedRequests: requests.filter(r => r.status === 'approved').length,
            rejectedRequests: requests.filter(r => r.status === 'rejected').length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            averageProcessingTime: this.calculateAverageProcessingTime(requests),
            approvalRate: this.calculateOverallApprovalRate(requests)
        };
        return {
            reportType,
            generatedAt: new Date().toISOString(),
            timeRange: params.timeRange,
            summary,
            insights: {
                keyFindings: this.generateKeyFindings(summary),
                recommendations: this.generateReportRecommendations(summary),
                trends: this.generateTrendAnalysis(requests)
            }
        };
    }
    extractApprovalHistory(confirmRequest) {
        const history = [];
        const workflow = confirmRequest.approvalWorkflow;
        for (const step of workflow.steps) {
            if (step.decision) {
                history.push({
                    stepId: step.stepId,
                    approverId: step.approver.userId,
                    action: step.decision.outcome,
                    timestamp: step.decision.timestamp,
                    result: step.decision.outcome === 'approve',
                    comments: step.decision.comments,
                    processingTime: this.calculateStepProcessingTime(step.decision.timestamp, confirmRequest.timestamp)
                });
            }
        }
        return history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    calculateStepProcessingTime(decisionTime, requestTime) {
        return decisionTime.getTime() - requestTime.getTime();
    }
    calculateAverageApprovalTime(history) {
        if (history.length === 0)
            return 0;
        const totalTime = history.reduce((sum, entry) => sum + entry.processingTime, 0);
        return totalTime / history.length;
    }
    identifyBottlenecks(history) {
        const bottlenecks = [];
        if (history.length === 0)
            return bottlenecks;
        const avgProcessingTime = this.calculateAverageApprovalTime(history);
        history.forEach((entry, index) => {
            if (entry.processingTime > avgProcessingTime * 2) {
                bottlenecks.push(`Step ${index + 1}: Excessive processing time`);
            }
        });
        const rejectionRate = 1 - this.calculateApprovalRate(history);
        if (rejectionRate > 0.3) {
            bottlenecks.push(`High rejection rate: ${Math.round(rejectionRate * 100)}%`);
        }
        return bottlenecks;
    }
    calculateProcessingTime(request, history) {
        if (history.length === 0)
            return 0;
        const lastEntry = history[history.length - 1];
        return lastEntry.timestamp.getTime() - request.timestamp.getTime();
    }
    calculateEfficiency(request, history) {
        if (history.length === 0)
            return 0;
        const actualTime = this.calculateProcessingTime(request, history);
        const expectedTime = history.length * 24 * 60 * 60 * 1000;
        return Math.min(1, expectedTime / Math.max(actualTime, 1));
    }
    calculateApprovalRate(history) {
        if (history.length === 0)
            return 0;
        const approvedCount = history.filter(h => h.result).length;
        return approvedCount / history.length;
    }
    generateRecommendations(request, history) {
        const recommendations = [];
        if (history.length > 5) {
            recommendations.push('Consider simplifying the approval workflow');
        }
        if (this.calculateProcessingTime(request, history) > 7 * 24 * 60 * 60 * 1000) {
            recommendations.push('Review approval timeouts and escalation policies');
        }
        const rejectionRate = 1 - this.calculateApprovalRate(history);
        if (rejectionRate > 0.3) {
            recommendations.push('High rejection rate indicates need for better pre-approval validation');
        }
        return recommendations;
    }
    identifyRiskFactors(request, history) {
        const risks = [];
        if (request.priority === 'high' && history.length === 0) {
            risks.push('High priority request with no approvals');
        }
        if (request.riskAssessment.overallRiskLevel === 'critical') {
            risks.push('Critical risk level requires immediate attention');
        }
        const processingTime = this.calculateProcessingTime(request, history);
        if (processingTime > 14 * 24 * 60 * 60 * 1000) {
            risks.push('Extended processing time may indicate process issues');
        }
        return risks;
    }
    calculateOverallApprovalRate(requests) {
        if (requests.length === 0)
            return 0;
        const approvedCount = requests.filter(r => r.status === 'approved').length;
        return approvedCount / requests.length;
    }
    calculateAverageProcessingTime(requests) {
        if (requests.length === 0)
            return 0;
        const totalTime = requests.reduce((sum, request) => {
            const processingTime = new Date().getTime() - request.timestamp.getTime();
            return sum + processingTime;
        }, 0);
        return totalTime / requests.length;
    }
    generateKeyFindings(summary) {
        const findings = [];
        findings.push(`Total requests processed: ${summary.totalRequests}`);
        findings.push(`Overall approval rate: ${Math.round(summary.approvalRate * 100)}%`);
        findings.push(`Average processing time: ${Math.round(summary.averageProcessingTime / (1000 * 60 * 60))} hours`);
        if (summary.pendingRequests > summary.totalRequests * 0.3) {
            findings.push(`High number of pending requests: ${summary.pendingRequests}`);
        }
        return findings;
    }
    generateReportRecommendations(summary) {
        const recommendations = [];
        if (summary.approvalRate < 0.7) {
            recommendations.push('Low approval rate indicates need for process improvement');
        }
        if (summary.averageProcessingTime > 7 * 24 * 60 * 60 * 1000) {
            recommendations.push('Consider optimizing approval workflows to reduce processing time');
        }
        if (summary.pendingRequests > summary.totalRequests * 0.2) {
            recommendations.push('High number of pending requests may indicate bottlenecks');
        }
        return recommendations;
    }
    generateTrendAnalysis(requests) {
        const trends = [];
        if (requests.length > 0) {
            trends.push(`Request volume: ${requests.length} requests in the specified period`);
            const approvedCount = requests.filter(r => r.status === 'approved').length;
            const rejectedCount = requests.filter(r => r.status === 'rejected').length;
            trends.push(`Approval distribution: ${approvedCount} approved, ${rejectedCount} rejected`);
        }
        return trends;
    }
}
exports.ConfirmAnalyticsService = ConfirmAnalyticsService;
