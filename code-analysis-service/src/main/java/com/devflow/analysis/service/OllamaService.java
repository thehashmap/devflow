package com.devflow.analysis.service;

import com.devflow.analysis.dto.AnalysisResultDto;
import com.devflow.analysis.dto.OllamaRequest;
import com.devflow.analysis.dto.OllamaResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class OllamaService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:codellama:7b}")
    private String defaultModel;

    public OllamaService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Mono<AnalysisResultDto> analyzeCode(String sourceCode, String fileType, String fileName) {
        String prompt = buildAnalysisPrompt(sourceCode, fileType, fileName);

        OllamaRequest request = new OllamaRequest();
        request.setModel(defaultModel);
        request.setPrompt(prompt);
        request.setStream(false);

        OllamaRequest.OllamaOptions options = new OllamaRequest.OllamaOptions();
        options.setTemperature(0.1);
        options.setTop_k(10);
        options.setTop_p(0.9);
        options.setNum_predict(2000);
        request.setOptions(options);

        return webClient.post()
                .uri(ollamaBaseUrl + "/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .map(this::parseAnalysisResult)
                .doOnError(error -> log.error("Error calling Ollama API: {}", error.getMessage()))
                .onErrorReturn(createErrorResult());
    }

    private String buildAnalysisPrompt(String sourceCode, String fileType, String fileName) {
        return String.format("""
            Analyze the following %s code from file '%s' and provide a comprehensive code quality assessment.
            
            Please provide your analysis in the following structured format:
            
            COMPLEXITY_SCORE: [score from 1-100, where 100 is least complex]
            QUALITY_SCORE: [score from 1-100, where 100 is highest quality]
            MAINTAINABILITY_SCORE: [score from 1-100, where 100 is most maintainable]
            
            ISSUES:
            - [List specific issues found in the code]
            - [Each issue on a new line with dash prefix]
            
            SUGGESTIONS:
            - [List specific improvement suggestions]
            - [Each suggestion on a new line with dash prefix]
            
            SUMMARY:
            [Provide a brief summary of the overall code quality and main recommendations]
            
            Code to analyze:
            ```%s
            %s
            ```
            
            Focus on:
            1. Code complexity and readability
            2. Best practices adherence
            3. Potential bugs and security issues
            4. Performance considerations
            5. Maintainability aspects
            """, fileType, fileName, fileType, sourceCode);
    }

    private AnalysisResultDto parseAnalysisResult(OllamaResponse response) {
        try {
            String analysisText = response.getResponse();

            AnalysisResultDto result = new AnalysisResultDto();

            // Extract scores using regex
            result.setComplexityScore(extractScore(analysisText, "COMPLEXITY_SCORE"));
            result.setQualityScore(extractScore(analysisText, "QUALITY_SCORE"));
            result.setMaintainabilityScore(extractScore(analysisText, "MAINTAINABILITY_SCORE"));

            // Extract issues
            result.setIssues(extractListItems(analysisText, "ISSUES:", "SUGGESTIONS:"));

            // Extract suggestions
            result.setSuggestions(extractListItems(analysisText, "SUGGESTIONS:", "SUMMARY:"));

            // Extract summary
            result.setSummary(extractSummary(analysisText));

            return result;
        } catch (Exception e) {
            log.error("Error parsing Ollama response: {}", e.getMessage());
            return createErrorResult();
        }
    }

    private Integer extractScore(String text, String scoreType) {
        Pattern pattern = Pattern.compile(scoreType + ":\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                int score = Integer.parseInt(matcher.group(1));
                return Math.max(1, Math.min(100, score)); // Ensure score is between 1-100
            } catch (NumberFormatException e) {
                log.warn("Invalid score format for {}: {}", scoreType, matcher.group(1));
            }
        }
        return 50; // Default score if not found
    }

    private List<String> extractListItems(String text, String startMarker, String endMarker) {
        try {
            int startIndex = text.indexOf(startMarker);
            if (startIndex == -1) return List.of("No items found");

            int endIndex = text.indexOf(endMarker, startIndex);
            if (endIndex == -1) endIndex = text.length();

            String section = text.substring(startIndex + startMarker.length(), endIndex);

            return Arrays.stream(section.split("\n"))
                    .map(String::trim)
                    .filter(line -> line.startsWith("-"))
                    .map(line -> line.substring(1).trim())
                    .filter(line -> !line.isEmpty())
                    .toList();
        } catch (Exception e) {
            log.error("Error extracting list items: {}", e.getMessage());
            return List.of("Error parsing items");
        }
    }

    private String extractSummary(String text) {
        try {
            int summaryIndex = text.indexOf("SUMMARY:");
            if (summaryIndex == -1) return "No summary available";

            String summary = text.substring(summaryIndex + "SUMMARY:".length()).trim();
            return summary.isEmpty() ? "No summary available" : summary;
        } catch (Exception e) {
            log.error("Error extracting summary: {}", e.getMessage());
            return "Error parsing summary";
        }
    }

    private AnalysisResultDto createErrorResult() {
        AnalysisResultDto result = new AnalysisResultDto();
        result.setComplexityScore(50);
        result.setQualityScore(50);
        result.setMaintainabilityScore(50);
        result.setIssues(List.of("Analysis service temporarily unavailable"));
        result.setSuggestions(List.of("Please try again later"));
        result.setSummary("Unable to complete analysis due to service error");
        return result;
    }

    public Mono<Boolean> isOllamaAvailable() {
        return webClient.get()
                .uri(ollamaBaseUrl + "/api/tags")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }
}