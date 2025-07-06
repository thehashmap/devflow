package com.devflow.report.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "analysis_reports")
public class AnalysisReport {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String projectName;

    private String fileName;
    private String language;
    private ReportStatus status;

    // Analysis Results
    private CodeQualityMetrics qualityMetrics;
    private List<CodeIssue> issues;
    private List<String> suggestions;
    private Map<String, Object> rawAnalysisData;

    // Report Generation
    private String reportUrl;
    private ReportFormat format;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    // Constructors
    public AnalysisReport() {}

    public AnalysisReport(String userId, String projectName, String fileName, String language) {
        this.userId = userId;
        this.projectName = projectName;
        this.fileName = fileName;
        this.language = language;
        this.status = ReportStatus.PENDING;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public CodeQualityMetrics getQualityMetrics() { return qualityMetrics; }
    public void setQualityMetrics(CodeQualityMetrics qualityMetrics) { this.qualityMetrics = qualityMetrics; }

    public List<CodeIssue> getIssues() { return issues; }
    public void setIssues(List<CodeIssue> issues) { this.issues = issues; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public Map<String, Object> getRawAnalysisData() { return rawAnalysisData; }
    public void setRawAnalysisData(Map<String, Object> rawAnalysisData) { this.rawAnalysisData = rawAnalysisData; }

    public String getReportUrl() { return reportUrl; }
    public void setReportUrl(String reportUrl) { this.reportUrl = reportUrl; }

    public ReportFormat getFormat() { return format; }
    public void setFormat(ReportFormat format) { this.format = format; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}


