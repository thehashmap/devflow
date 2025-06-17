package com.devflow.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OllamaRequest {
    private String model;
    private String prompt;
    private boolean stream;
    private OllamaOptions options;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OllamaOptions {
        private Double temperature;
        private Integer top_k;
        private Double top_p;
        private Integer num_predict;
    }
}
