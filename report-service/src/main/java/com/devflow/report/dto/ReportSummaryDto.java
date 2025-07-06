package com.devflow.report.dto;

import java.util.Map;

public class ReportSummaryDto {
    private long totalReports;
    private long recentReports;
    private Map<String, Long> languageBreakdown;
    private double averageQualityScore;

    // Constructors
    public ReportSummaryDto() {}

    public ReportSummaryDto(long totalReports, long recentReports,
                            Map<String, Long> languageBreakdown, double averageQualityScore) {
        this.totalReports = totalReports;
        this.recentReports = recentReports;
        this.languageBreakdown = languageBreakdown;
        this.averageQualityScore = averageQualityScore;
    }

    // Getters and Setters
    public long getTotalReports() { return totalReports; }
    public void setTotalReports(long totalReports) { this.totalReports = totalReports; }

    public long getRecentReports() { return recentReports; }
    public void setRecentReports(long recentReports) { this.recentReports = recentReports; }

    public Map<String, Long> getLanguageBreakdown() { return languageBreakdown; }
    public void setLanguageBreakdown(Map<String, Long> languageBreakdown) { this.languageBreakdown = languageBreakdown; }

    public double getAverageQualityScore() { return averageQualityScore; }
    public void setAverageQualityScore(double averageQualityScore) { this.averageQualityScore = averageQualityScore; }
}