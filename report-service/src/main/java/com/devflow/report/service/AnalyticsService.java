package com.devflow.report.service;

import com.devflow.report.model.AnalysisReport;
import com.devflow.report.repository.AnalysisReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private AnalysisReportRepository reportRepository;

    public Map<String, Object> generateUserAnalytics(String userId) {
        Map<String, Object> analytics = new HashMap<>();

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusDays(30);

        List<AnalysisReport> weeklyReports = reportRepository.findCompletedReportsSince(userId, oneWeekAgo);
        List<AnalysisReport> monthlyReports = reportRepository.findCompletedReportsSince(userId, oneMonthAgo);

        analytics.put("weeklyReportCount", weeklyReports.size());
        analytics.put("monthlyReportCount", monthlyReports.size());

        // Calculate average quality scores
        double weeklyAvgQuality = weeklyReports.stream()
                .filter(r -> r.getQualityMetrics() != null)
                .mapToDouble(r -> r.getQualityMetrics().getMaintainabilityIndex())
                .average()
                .orElse(0.0);

        double monthlyAvgQuality = monthlyReports.stream()
                .filter(r -> r.getQualityMetrics() != null)
                .mapToDouble(r -> r.getQualityMetrics().getMaintainabilityIndex())
                .average()
                .orElse(0.0);

        analytics.put("weeklyAvgQuality", weeklyAvgQuality);
        analytics.put("monthlyAvgQuality", monthlyAvgQuality);

        // Language distribution
        Map<String, Long> languageDistribution = monthlyReports.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        AnalysisReport::getLanguage,
                        java.util.stream.Collectors.counting()
                ));

        analytics.put("languageDistribution", languageDistribution);

        return analytics;
    }
}