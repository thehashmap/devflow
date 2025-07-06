package com.devflow.report.dto;

import com.devflow.report.model.CodeIssue;
import com.devflow.report.model.CodeQualityMetrics;
import com.devflow.report.model.ReportFormat;

import java.util.List;
import java.util.Map;

public class AnalysisResultDto {
    private String reportId;
    private CodeQualityMetrics qualityMetrics;
    private List<CodeIssue> issues;
    private List<String> suggestions;
    private Map<String, Object> rawData;

    // Constructors
    public AnalysisResultDto() {}

    public AnalysisResultDto(String reportId, CodeQualityMetrics qualityMetrics,
                             List<CodeIssue> issues, List<String> suggestions,
                             Map<String, Object> rawData) {
        this.reportId = reportId;
        this.qualityMetrics = qualityMetrics;
        this.issues = issues;
        this.suggestions = suggestions;
        this.rawData = rawData;
    }

    // Getters and Setters
    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }

    public CodeQualityMetrics getQualityMetrics() { return qualityMetrics; }
    public void setQualityMetrics(CodeQualityMetrics qualityMetrics) { this.qualityMetrics = qualityMetrics; }

    public List<CodeIssue> getIssues() { return issues; }
    public void setIssues(List<CodeIssue> issues) { this.issues = issues; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public Map<String, Object> getRawData() { return rawData; }
    public void setRawData(Map<String, Object> rawData) { this.rawData = rawData; }
}
