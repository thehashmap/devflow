package com.devflow.report.dto;

import com.devflow.report.model.ReportFormat;

public class ReportGenerationRequest {
    private String reportId;
    private ReportFormat format;

    // Constructors
    public ReportGenerationRequest() {}

    public ReportGenerationRequest(String reportId, ReportFormat format) {
        this.reportId = reportId;
        this.format = format;
    }

    // Getters and Setters
    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }

    public ReportFormat getFormat() { return format; }
    public void setFormat(ReportFormat format) { this.format = format; }
}