package com.devflow.report.controller;

import com.devflow.report.dto.AnalysisResultDto;
import com.devflow.report.dto.ReportGenerationRequest;
import com.devflow.report.dto.ReportSummaryDto;
import com.devflow.report.model.AnalysisReport;
import com.devflow.report.model.ReportFormat;
import com.devflow.report.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
//@CrossOrigin(origins = "*")
public class ReportController {
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    @PostMapping("/create")
    public ResponseEntity<AnalysisReport> createReport(
            @RequestParam String userId,
            @RequestParam String projectName,
            @RequestParam String fileName,
            @RequestParam String language) {

        logger.info("Creating report for user: {}, project: {}", userId, projectName);

        try {
            AnalysisReport report = reportService.createReport(userId, projectName, fileName, language);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            logger.error("Failed to create report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<AnalysisReport> getReport(@PathVariable String reportId) {
        logger.info("Retrieving report: {}", reportId);

        Optional<AnalysisReport> report = reportService.findById(reportId);
        return report.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AnalysisReport>> getUserReports(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Retrieving reports for user: {}, page: {}, size: {}", userId, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<AnalysisReport> reports = reportService.getUserReports(userId, pageable);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/project/{userId}/{projectName}")
    public ResponseEntity<List<AnalysisReport>> getProjectReports(
            @PathVariable String userId,
            @PathVariable String projectName) {

        logger.info("Retrieving reports for user: {}, project: {}", userId, projectName);

        List<AnalysisReport> reports = reportService.getProjectReports(userId, projectName);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{reportId}/results")
    public ResponseEntity<AnalysisReport> updateReportResults(
            @PathVariable String reportId,
            @RequestBody AnalysisResultDto analysisResult) {

        logger.info("Updating report {} with analysis results", reportId);

        try {
            AnalysisReport updatedReport = reportService.updateReportWithResults(reportId, analysisResult);
            return ResponseEntity.ok(updatedReport);
        } catch (RuntimeException e) {
            logger.error("Failed to update report results", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error updating report results", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{reportId}/generate")
    public ResponseEntity<String> generateReport(
            @PathVariable String reportId,
            @RequestParam(defaultValue = "PDF") ReportFormat format) {

        logger.info("Generating {} report for report ID: {}", format, reportId);

        try {
            String reportUrl = reportService.generateReport(reportId, format);
            return ResponseEntity.ok(reportUrl);
        } catch (RuntimeException e) {
            logger.error("Failed to generate report", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error generating report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadReport(@PathVariable String fileName) {
        logger.info("Downloading report file: {}", fileName);

        try {
            String reportsPath = System.getProperty("app.reports.storage.path", "/tmp/reports");
            File file = Paths.get(reportsPath, fileName).toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Failed to download report file: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<ReportSummaryDto> getUserReportSummary(@PathVariable String userId) {
        logger.info("Generating report summary for user: {}", userId);

        try {
            ReportSummaryDto summary = reportService.getUserReportSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to generate report summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{reportId}/failed")
    public ResponseEntity<Void> markReportFailed(
            @PathVariable String reportId,
            @RequestParam String errorMessage) {

        logger.info("Marking report {} as failed", reportId);

        reportService.markReportFailed(reportId, errorMessage);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(@PathVariable String reportId) {
        logger.info("Deleting report: {}", reportId);

        try {
            reportService.deleteReport(reportId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to delete report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AnalysisReport>> getPendingReports() {
        logger.info("Retrieving pending reports");

        List<AnalysisReport> pendingReports = reportService.getPendingReports();
        return ResponseEntity.ok(pendingReports);
    }

    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "json" -> "application/json";
            case "html" -> "text/html";
            default -> "application/octet-stream";
        };
    }
}