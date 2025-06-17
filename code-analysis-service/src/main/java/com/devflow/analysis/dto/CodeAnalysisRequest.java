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
public class CodeAnalysisRequest {
    private String fileName;
    private String fileType;
    private String sourceCode;
    private String userId;
    private List<String> analysisTypes; // ["complexity", "quality", "security", "performance"]
}

