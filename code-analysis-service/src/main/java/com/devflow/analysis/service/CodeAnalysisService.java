package com.devflow.analysis.service;

import com.devflow.analysis.dto.AnalysisResultDto;
import com.devflow.analysis.dto.CodeAnalysisRequest;
import com.devflow.analysis.dto.CodeAnalysisResponse;
import com.devflow.analysis.entity.CodeAnalysis;
import com.devflow.analysis.repository.CodeAnalysisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeAnalysisService {

    private final CodeAnalysisRepository analysisRepository;
    private final OllamaService ollamaService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public CodeAnalysisResponse submitAnalysis(CodeAnalysisRequest request) {
        // Create and save initial analysis record
        CodeAnalysis analysis = new CodeAnalysis();
        analysis.setUserId(request.getUserId());
        analysis.setFileName(request.getFileName());
        analysis.setFileType(request.getFileType());
        analysis.setSourceCode(request.getSourceCode());
        analysis.setStatus(CodeAnalysis.AnalysisStatus.PENDING);

        // Set default scores
        analysis.setComplexityScore(0);
        analysis.setQualityScore(0);
        analysis.setMaintainabilityScore(0);

        CodeAnalysis savedAnalysis = analysisRepository.save(analysis);

        // Start async analysis
        processAnalysisAsync(savedAnalysis.getId());

        return mapToResponse(savedAnalysis);
    }

    @Async
    public CompletableFuture<Void> processAnalysisAsync(Long analysisId) {
        try {
            log.info("Starting async analysis for ID: {}", analysisId);

            Optional<CodeAnalysis> optionalAnalysis = analysisRepository.findById(analysisId);
            if (optionalAnalysis.isEmpty()) {
                log.error("Analysis not found with ID: {}", analysisId);
                return CompletableFuture.completedFuture(null);
            }

            CodeAnalysis analysis = optionalAnalysis.get();

            // Update status to IN_PROGRESS
            analysis.setStatus(CodeAnalysis.AnalysisStatus.IN_PROGRESS);
            analysisRepository.save(analysis);

            // Send status update notification
            sendStatusUpdate(analysis);

            // Perform analysis using Ollama
            AnalysisResultDto result = ollamaService.analyzeCode(
                    analysis.getSourceCode(),
                    analysis.getFileType(),
                    analysis.getFileName()
            ).block(); // Block for async method

            if (result != null) {
                // Update analysis with results
                analysis.setComplexityScore(result.getComplexityScore());
                analysis.setQualityScore(result.getQualityScore());
                analysis.setMaintainabilityScore(result.getMaintainabilityScore());
                analysis.setIssues(result.getIssues());
                analysis.setSuggestions(result.getSuggestions());
                analysis.setAnalysisResult(result.getSummary());
                analysis.setStatus(CodeAnalysis.AnalysisStatus.COMPLETED);

                log.info("Analysis completed successfully for ID: {}", analysisId);
            } else {
                analysis.setStatus(CodeAnalysis.AnalysisStatus.FAILED);
                analysis.setAnalysisResult("Analysis failed due to service error");
                log.error("Analysis failed for ID: {}", analysisId);
            }

            analysisRepository.save(analysis);

            // Send completion notification
            sendStatusUpdate(analysis);

            // Send to report service for report generation
            sendToReportService(analysis);

        } catch (Exception e) {
            log.error("Error processing analysis for ID: {}", analysisId, e);

            // Update status to failed
            Optional<CodeAnalysis> optionalAnalysis = analysisRepository.findById(analysisId);
            if (optionalAnalysis.isPresent()) {
                CodeAnalysis analysis = optionalAnalysis.get();
                analysis.setStatus(CodeAnalysis.AnalysisStatus.FAILED);
                analysis.setAnalysisResult("Analysis failed: " + e.getMessage());
                analysisRepository.save(analysis);
                sendStatusUpdate(analysis);
            }
        }

        return CompletableFuture.completedFuture(null);
    }

    public CodeAnalysisResponse getAnalysisById(Long id) {
        return analysisRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<CodeAnalysisResponse> getAnalysesByUserId(String userId) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<CodeAnalysisResponse> getAnalysesByUserId(String userId, Pageable pageable) {
        return analysisRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    public List<CodeAnalysisResponse> getPendingAnalyses() {
        return analysisRepository.findByStatus(CodeAnalysis.AnalysisStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public boolean deleteAnalysis(Long id, String userId) {
        Optional<CodeAnalysis> optionalAnalysis = analysisRepository.findById(id);
        if (optionalAnalysis.isPresent()) {
            CodeAnalysis analysis = optionalAnalysis.get();
            if (analysis.getUserId().equals(userId)) {
                analysisRepository.delete(analysis);
                return true;
            }
        }
        return false;
    }

    public Double getAverageQualityScore(String userId) {
        return analysisRepository.findAverageQualityScoreByUserId(userId).orElse(0.0);
    }

    public Long getCompletedAnalysesCount(String userId) {
        return analysisRepository.countCompletedAnalysesByUserId(userId);
    }

    private void sendStatusUpdate(CodeAnalysis analysis) {
        try {
            // Send to notification service
            rabbitTemplate.convertAndSend("analysis.status.exchange",
                    "analysis.status." + analysis.getStatus().name().toLowerCase(),
                    mapToResponse(analysis));

            log.debug("Status update sent for analysis ID: {}, Status: {}",
                    analysis.getId(), analysis.getStatus());
        } catch (Exception e) {
            log.error("Failed to send status update for analysis ID: {}", analysis.getId(), e);
        }
    }

    private void sendToReportService(CodeAnalysis analysis) {
        try {
            if (analysis.getStatus() == CodeAnalysis.AnalysisStatus.COMPLETED) {
                rabbitTemplate.convertAndSend("report.generation.exchange",
                        "report.generate",
                        mapToResponse(analysis));

                log.debug("Analysis sent to report service for ID: {}", analysis.getId());
            }
        } catch (Exception e) {
            log.error("Failed to send analysis to report service for ID: {}", analysis.getId(), e);
        }
    }

    private CodeAnalysisResponse mapToResponse(CodeAnalysis analysis) {
        CodeAnalysisResponse response = new CodeAnalysisResponse();
        response.setId(analysis.getId());
        response.setUserId(analysis.getUserId());
        response.setFileName(analysis.getFileName());
        response.setFileType(analysis.getFileType());
        response.setStatus(analysis.getStatus());
        response.setComplexityScore(analysis.getComplexityScore());
        response.setQualityScore(analysis.getQualityScore());
        response.setMaintainabilityScore(analysis.getMaintainabilityScore());
        response.setIssues(analysis.getIssues());
        response.setSuggestions(analysis.getSuggestions());
        response.setCreatedAt(analysis.getCreatedAt());
        response.setCompletedAt(analysis.getCompletedAt());
        response.setAnalysisResult(analysis.getAnalysisResult());
        return response;
    }
}