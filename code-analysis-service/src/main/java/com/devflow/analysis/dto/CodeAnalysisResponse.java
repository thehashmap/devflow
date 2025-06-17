package com.devflow.analysis.dto;

import com.devflow.analysis.entity.CodeAnalysis;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysisResponse {
    private Long id;
    private String userId;
    private String fileName;
    private String fileType;
    private CodeAnalysis.AnalysisStatus status;
    private Integer complexityScore;
    private Integer qualityScore;
    private Integer maintainabilityScore;
    private List<String> issues;
    private List<String> suggestions;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String analysisResult;
}
