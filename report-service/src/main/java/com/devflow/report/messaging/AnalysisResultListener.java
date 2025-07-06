package com.devflow.report.messaging;

import com.devflow.report.dto.AnalysisResultDto;
import com.devflow.report.service.ReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AnalysisResultListener {
    private static final Logger logger = LoggerFactory.getLogger(AnalysisResultListener.class);

    @Autowired
    private ReportService reportService;

    @Autowired
    private ObjectMapper objectMapper;

    @RabbitListener(queues = "analysis.results")
    public void handleAnalysisResult(String message) {
        logger.info("Received analysis result message: {}", message);

        try {
            AnalysisResultDto result = objectMapper.readValue(message, AnalysisResultDto.class);
            reportService.updateReportWithResults(result.getReportId(), result);

            logger.info("Successfully processed analysis result for report: {}", result.getReportId());

        } catch (Exception e) {
            logger.error("Failed to process analysis result message: {}", message, e);
            // In a production system, you might want to send this to a dead letter queue
            // or implement retry logic
        }
    }

    @RabbitListener(queues = "analysis.errors")
    public void handleAnalysisError(String message) {
        logger.info("Received analysis error message: {}", message);

        try {
            // Expected format: {"reportId": "...", "error": "..."}
            var errorData = objectMapper.readTree(message);
            String reportId = errorData.get("reportId").asText();
            String error = errorData.get("error").asText();

            reportService.markReportFailed(reportId, error);

            logger.info("Successfully processed analysis error for report: {}", reportId);

        } catch (Exception e) {
            logger.error("Failed to process analysis error message: {}", message, e);
        }
    }
}