package tn.pfe.arabicquality.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SmartReportDto {
        private String title;
        private String executiveSummary;
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> recommendations;
        private List<String> fraudRiskAlerts;
        private int fraudRiskScore;
        private String conclusion;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class EvaluationSuggestionDto {
        private Long answerId;
        private String question;
        private String suggestedValueCode;
        private String confidence;
        private String reason;
        private String suggestedNote;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class EvaluationAssistantDto {
        private String overview;
        private List<EvaluationSuggestionDto> suggestions;
        private List<String> riskAlerts;
        private List<String> fraudRiskAlerts;
        private int fraudRiskScore;
        private String recommendedDecision;
        private String decisionNote;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DashboardInsightsDto {
        private String summary;
        private List<String> highlights;
        private List<String> risks;
        private List<String> recommendations;
    }
}
