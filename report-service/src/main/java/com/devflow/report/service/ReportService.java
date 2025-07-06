package com.devflow.report.service;

import com.devflow.report.dto.AnalysisResultDto;
import com.devflow.report.dto.ReportGenerationRequest;
import com.devflow.report.dto.ReportSummaryDto;
import com.devflow.report.model.AnalysisReport;
import com.devflow.report.model.ReportFormat;
import com.devflow.report.model.ReportStatus;
import com.devflow.report.repository.AnalysisReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private AnalysisReportRepository reportRepository;

    @Autowired
    private ReportGenerationService reportGenerationService;

    @Autowired
    private AnalyticsService analyticsService;

    public AnalysisReport createReport(String userId, String projectName, String fileName, String language) {
        logger.info("Creating new analysis report for user: {}, project: {}", userId, projectName);

        AnalysisReport report = new AnalysisReport(userId, projectName, fileName, language);
        return reportRepository.save(report);
    }

    public Optional<AnalysisReport> findById(String reportId) {
        return reportRepository.findById(reportId);
    }

    public Page<AnalysisReport> getUserReports(String userId, Pageable pageable) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<AnalysisReport> getProjectReports(String userId, String projectName) {
        return reportRepository.findByUserIdAndProjectNameOrderByCreatedAtDesc(userId, projectName);
    }

    public AnalysisReport updateReportWithResults(String reportId, AnalysisResultDto analysisResult) {
        logger.info("Updating report {} with analysis results", reportId);

        Optional<AnalysisReport> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isEmpty()) {
            throw new RuntimeException("Report not found: " + reportId);
        }

        AnalysisReport report = optionalReport.get();
        report.setStatus(ReportStatus.COMPLETED);
        report.setQualityMetrics(analysisResult.getQualityMetrics());
        report.setIssues(analysisResult.getIssues());
        report.setSuggestions(analysisResult.getSuggestions());
        report.setRawAnalysisData(analysisResult.getRawData());
        report.setCompletedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    public String generateReport(String reportId, ReportFormat format) {
        logger.info("Generating {} report for report ID: {}", format, reportId);

        Optional<AnalysisReport> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isEmpty()) {
            throw new RuntimeException("Report not found: " + reportId);
        }

        AnalysisReport report = optionalReport.get();

        try {
            String reportUrl = reportGenerationService.generateReport(report, format);
            report.setReportUrl(reportUrl);
            report.setFormat(format);
            reportRepository.save(report);

            return reportUrl;
        } catch (Exception e) {
            logger.error("Failed to generate report for ID: {}", reportId, e);
            throw new RuntimeException("Failed to generate report", e);
        }
    }

    public ReportSummaryDto getUserReportSummary(String userId) {
        logger.info("Generating report summary for user: {}", userId);

        long totalReports = reportRepository.countByUserIdAndStatus(userId, ReportStatus.COMPLETED);

        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        List<AnalysisReport> recentReports = reportRepository.findCompletedReportsSince(userId, lastWeek);

        Map<String, Long> languageBreakdown = recentReports.stream()
                .collect(Collectors.groupingBy(
                        AnalysisReport::getLanguage,
                        Collectors.counting()
                ));

        double averageQualityScore = recentReports.stream()
                .filter(r -> r.getQualityMetrics() != null)
                .mapToDouble(r -> r.getQualityMetrics().getMaintainabilityIndex())
                .average()
                .orElse(0.0);

        return new ReportSummaryDto(
                totalReports,
                recentReports.size(),
                languageBreakdown,
                averageQualityScore
        );
    }

    public void markReportFailed(String reportId, String errorMessage) {
        logger.error("Marking report {} as failed: {}", reportId, errorMessage);

        Optional<AnalysisReport> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isPresent()) {
            AnalysisReport report = optionalReport.get();
            report.setStatus(ReportStatus.FAILED);
            reportRepository.save(report);
        }
    }

    public List<AnalysisReport> getPendingReports() {
        return reportRepository.findByStatus(ReportStatus.PENDING);
    }

    public void deleteReport(String reportId) {
        logger.info("Deleting report: {}", reportId);
        reportRepository.deleteById(reportId);
    }

    public void cleanupOldReports(int daysOld) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysOld);
        logger.info("Cleaning up reports older than {}", cutoff);
        reportRepository.deleteByCreatedAtBefore(cutoff);
    }
}