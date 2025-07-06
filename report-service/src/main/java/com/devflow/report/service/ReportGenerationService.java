package com.devflow.report.service;

import com.devflow.report.model.AnalysisReport;
import com.devflow.report.model.CodeIssue;
import com.devflow.report.model.ReportFormat;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class ReportGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(ReportGenerationService.class);

    @Value("${app.reports.storage.path:/tmp/reports}")
    private String reportsStoragePath;

    @Value("${app.reports.base-url:http://localhost:8083/api/reports}")
    private String reportsBaseUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateReport(AnalysisReport report, ReportFormat format) throws IOException {
        ensureStorageDirectoryExists();

        String fileName = generateFileName(report, format);
        String filePath = Paths.get(reportsStoragePath, fileName).toString();

        switch (format) {
            case PDF -> generatePdfReport(report, filePath);
            case JSON -> generateJsonReport(report, filePath);
            case HTML -> generateHtmlReport(report, filePath);
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        }

        return reportsBaseUrl + "/download/" + fileName;
    }

    private void generatePdfReport(AnalysisReport report, String filePath) throws IOException {
        logger.info("Generating PDF report: {}", filePath);

        try (PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc)) {

            // Title
            document.add(new Paragraph("Code Quality Analysis Report")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Project Info
            document.add(new Paragraph("Project: " + report.getProjectName()).setFontSize(14));
            document.add(new Paragraph("File: " + report.getFileName()).setFontSize(12));
            document.add(new Paragraph("Language: " + report.getLanguage()).setFontSize(12));
            document.add(new Paragraph("Generated: " +
                    report.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .setFontSize(12));

            document.add(new Paragraph("\n"));

            // Quality Metrics
            if (report.getQualityMetrics() != null) {
                document.add(new Paragraph("Quality Metrics").setFontSize(16).setBold());

                Table metricsTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
                metricsTable.addHeaderCell(new Cell().add(new Paragraph("Metric").setBold()));
                metricsTable.addHeaderCell(new Cell().add(new Paragraph("Value").setBold()));

                var metrics = report.getQualityMetrics();
                metricsTable.addCell("Lines of Code");
                metricsTable.addCell(String.valueOf(metrics.getLinesOfCode()));
                metricsTable.addCell("Cyclomatic Complexity");
                metricsTable.addCell(String.valueOf(metrics.getCyclomaticComplexity()));
                metricsTable.addCell("Maintainability Index");
                metricsTable.addCell(String.format("%.2f", metrics.getMaintainabilityIndex()));
                metricsTable.addCell("Code Smells");
                metricsTable.addCell(String.valueOf(metrics.getCodeSmells()));
                metricsTable.addCell("Overall Grade");
                metricsTable.addCell(metrics.getOverallGrade());

                document.add(metricsTable);
                document.add(new Paragraph("\n"));
            }

            // Issues
            if (report.getIssues() != null && !report.getIssues().isEmpty()) {
                document.add(new Paragraph("Issues Found").setFontSize(16).setBold());

                Table issuesTable = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Severity").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Type").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Line").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));

                for (CodeIssue issue : report.getIssues()) {
                    issuesTable.addCell(issue.getSeverity().toString());
                    issuesTable.addCell(issue.getType());
                    issuesTable.addCell(String.valueOf(issue.getLineNumber()));
                    issuesTable.addCell(issue.getDescription());
                }

                document.add(issuesTable);
                document.add(new Paragraph("\n"));
            }

            // Suggestions
            if (report.getSuggestions() != null && !report.getSuggestions().isEmpty()) {
                document.add(new Paragraph("Suggestions").setFontSize(16).setBold());

                for (int i = 0; i < report.getSuggestions().size(); i++) {
                    document.add(new Paragraph((i + 1) + ". " + report.getSuggestions().get(i)));
                }
            }
        }

        logger.info("PDF report generated successfully: {}", filePath);
    }

    private void generateJsonReport(AnalysisReport report, String filePath) throws IOException {
        logger.info("Generating JSON report: {}", filePath);

        objectMapper.writerWithDefaultPrettyPrinter()
                .writeValue(Paths.get(filePath).toFile(), report);

        logger.info("JSON report generated successfully: {}", filePath);
    }

    private void generateHtmlReport(AnalysisReport report, String filePath) throws IOException {
        logger.info("Generating HTML report: {}", filePath);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>");
        html.append("<title>Code Quality Report</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 40px; }");
        html.append("h1 { color: #333; text-align: center; }");
        html.append("h2 { color: #666; border-bottom: 2px solid #ddd; }");
        html.append("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append("th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }");
        html.append("th { background-color: #f2f2f2; }");
        html.append(".severity-high { color: #d32f2f; font-weight: bold; }");
        html.append(".severity-medium { color: #f57c00; font-weight: bold; }");
        html.append(".severity-low { color: #388e3c; }");
        html.append("</style></head><body>");

        html.append("<h1>Code Quality Analysis Report</h1>");
        html.append("<p><strong>Project:</strong> ").append(report.getProjectName()).append("</p>");
        html.append("<p><strong>File:</strong> ").append(report.getFileName()).append("</p>");
        html.append("<p><strong>Language:</strong> ").append(report.getLanguage()).append("</p>");
        html.append("<p><strong>Generated:</strong> ").append(
                        report.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .append("</p>");

        // Quality Metrics
        if (report.getQualityMetrics() != null) {
            html.append("<h2>Quality Metrics</h2>");
            html.append("<table>");
            html.append("<tr><th>Metric</th><th>Value</th></tr>");

            var metrics = report.getQualityMetrics();
            html.append("<tr><td>Lines of Code</td><td>").append(metrics.getLinesOfCode()).append("</td></tr>");
            html.append("<tr><td>Cyclomatic Complexity</td><td>").append(metrics.getCyclomaticComplexity()).append("</td></tr>");
            html.append("<tr><td>Maintainability Index</td><td>").append(String.format("%.2f", metrics.getMaintainabilityIndex())).append("</td></tr>");
            html.append("<tr><td>Code Smells</td><td>").append(metrics.getCodeSmells()).append("</td></tr>");
            html.append("<tr><td>Overall Grade</td><td>").append(metrics.getOverallGrade()).append("</td></tr>");
            html.append("</table>");
        }

        // Issues
        if (report.getIssues() != null && !report.getIssues().isEmpty()) {
            html.append("<h2>Issues Found</h2>");
            html.append("<table>");
            html.append("<tr><th>Severity</th><th>Type</th><th>Line</th><th>Description</th></tr>");

            for (CodeIssue issue : report.getIssues()) {
                String severityClass = "severity-" + issue.getSeverity().toString().toLowerCase();
                html.append("<tr>");
                html.append("<td class=\"").append(severityClass).append("\">").append(issue.getSeverity()).append("</td>");
                html.append("<td>").append(issue.getType()).append("</td>");
                html.append("<td>").append(issue.getLineNumber()).append("</td>");
                html.append("<td>").append(issue.getDescription()).append("</td>");
                html.append("</tr>");
            }
            html.append("</table>");
        }

        // Suggestions
        if (report.getSuggestions() != null && !report.getSuggestions().isEmpty()) {
            html.append("<h2>Suggestions</h2>");
            html.append("<ol>");
            for (String suggestion : report.getSuggestions()) {
                html.append("<li>").append(suggestion).append("</li>");
            }
            html.append("</ol>");
        }

        html.append("</body></html>");

        Files.write(Paths.get(filePath), html.toString().getBytes());
        logger.info("HTML report generated successfully: {}", filePath);
    }

    private String generateFileName(AnalysisReport report, ReportFormat format) {
        String timestamp = report.getCompletedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String extension = format.toString().toLowerCase();
        return String.format("report_%s_%s_%s.%s",
                report.getUserId(),
                report.getProjectName().replaceAll("[^a-zA-Z0-9]", "_"),
                timestamp,
                extension);
    }

    private void ensureStorageDirectoryExists() throws IOException {
        Path directory = Paths.get(reportsStoragePath);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
            logger.info("Created reports storage directory: {}", reportsStoragePath);
        }
    }
}