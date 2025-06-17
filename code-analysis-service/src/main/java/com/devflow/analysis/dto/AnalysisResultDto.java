package com.devflow.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultDto {
    private Integer complexityScore;
    private Integer qualityScore;
    private Integer maintainabilityScore;
    private List<String> issues;
    private List<String> suggestions;
    private String summary;
}
