package com.devflow.analysis.controller;

import com.devflow.analysis.dto.CodeAnalysisRequest;
import com.devflow.analysis.dto.CodeAnalysisResponse;
import com.devflow.analysis.service.CodeAnalysisService;
import com.devflow.analysis.service.OllamaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Code Analysis", description = "Code analysis and quality assessment endpoints")
public class CodeAnalysisController {

    private final CodeAnalysisService analysisService;
    private final OllamaService ollamaService;

    @PostMapping("/submit")
    @Operation(summary = "Submit code for analysis", description = "Submit source code for AI-powered quality analysis")
    @ApiResponse(responseCode = "201", description = "Analysis submitted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    public ResponseEntity<CodeAnalysisResponse> submitAnalysis(
            @Valid @RequestBody CodeAnalysisRequest request) {

        log.info("Received analysis request for file: {} by user: {}",
                request.getFileName(), request.getUserId());

        try {
            CodeAnalysisResponse response = analysisService.submitAnalysis(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error submitting analysis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload file for analysis", description = "Upload a source code file for analysis")
    @ApiResponse(responseCode = "201", description = "File uploaded and analysis started")
    @ApiResponse(responseCode = "400", description = "Invalid file or request")
    public ResponseEntity<CodeAnalysisResponse> uploadFileForAnalysis(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId,
            @RequestParam(value = "analysisTypes", required = false) List<String> analysisTypes) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String sourceCode = new String(file.getBytes(), StandardCharsets.UTF_8);
            String fileName = file.getOriginalFilename();
            String fileType = getFileExtension(fileName);

            CodeAnalysisRequest request = new CodeAnalysisRequest();
            request.setFileName(fileName);
            request.setFileType(fileType);
            request.setSourceCode(sourceCode);
            request.setUserId(userId);
            request.setAnalysisTypes(analysisTypes);

            CodeAnalysisResponse response = analysisService.submitAnalysis(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            log.error("Error reading uploaded file: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get analysis by ID", description = "Retrieve a specific code analysis by its ID")
    @ApiResponse(responseCode = "200", description = "Analysis found")
    @ApiResponse(responseCode = "404", description = "Analysis not found")
    public ResponseEntity<CodeAnalysisResponse> getAnalysis(
            @Parameter(description = "Analysis ID") @PathVariable Long id) {

        CodeAnalysisResponse response = analysisService.getAnalysisById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user's analyses", description = "Retrieve all analyses for a specific user")
    @ApiResponse(responseCode = "200", description = "Analyses retrieved successfully")
    public ResponseEntity<Page<CodeAnalysisResponse>> getUserAnalyses(
            @Parameter(description = "User ID") @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CodeAnalysisResponse> analyses = analysisService.getAnalysesByUserId(userId, pageable);

        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/user/{userId}/summary")
    @Operation(summary = "Get user analysis summary", description = "Get summary statistics for user's analyses")
    @ApiResponse(responseCode = "200", description = "Summary retrieved successfully")
    public ResponseEntity<Map<String, Object>> getUserAnalysisSummary(
            @Parameter(description = "User ID") @PathVariable String userId) {

        Double avgQuality = analysisService.getAverageQualityScore(userId);
        Long completedCount = analysisService.getCompletedAnalysesCount(userId);

        Map<String, Object> summary = Map.of(
                "userId", userId,
                "averageQualityScore", avgQuality,
                "completedAnalysesCount", completedCount,
                "totalAnalyses", analysisService.getAnalysesByUserId(userId).size()
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending analyses", description = "Retrieve all pending analyses (admin only)")
    @ApiResponse(responseCode = "200", description = "Pending analyses retrieved")
    public ResponseEntity<List<CodeAnalysisResponse>> getPendingAnalyses() {
        List<CodeAnalysisResponse> pendingAnalyses = analysisService.getPendingAnalyses();
        return ResponseEntity.ok(pendingAnalyses);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete analysis", description = "Delete a specific analysis")
    @ApiResponse(responseCode = "204", description = "Analysis deleted successfully")
    @ApiResponse(responseCode = "404", description = "Analysis not found")
    @ApiResponse(responseCode = "403", description = "Not authorized to delete this analysis")
    public ResponseEntity<Void> deleteAnalysis(
            @Parameter(description = "Analysis ID") @PathVariable Long id,
            @RequestParam String userId) {

        boolean deleted = analysisService.deleteAnalysis(id, userId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/health/ollama")
    @Operation(summary = "Check Ollama service health", description = "Check if Ollama service is available")
    @ApiResponse(responseCode = "200", description = "Ollama service status")
    public ResponseEntity<Map<String, Object>> checkOllamaHealth() {
        Boolean isAvailable = ollamaService.isOllamaAvailable().block();

        Map<String, Object> health = Map.of(
                "ollamaAvailable", isAvailable != null ? isAvailable : false,
                "timestamp", System.currentTimeMillis()
        );

        return ResponseEntity.ok(health);
    }

    @GetMapping("/supported-types")
    @Operation(summary = "Get supported file types", description = "Get list of supported file types for analysis")
    @ApiResponse(responseCode = "200", description = "Supported file types")
    public ResponseEntity<List<String>> getSupportedFileTypes() {
        List<String> supportedTypes = List.of(
                "java", "python", "javascript", "typescript", "cpp", "c", "cs", "go",
                "rust", "php", "ruby", "swift", "kotlin", "scala", "r", "sql"
        );
        return ResponseEntity.ok(supportedTypes);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "txt";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
}