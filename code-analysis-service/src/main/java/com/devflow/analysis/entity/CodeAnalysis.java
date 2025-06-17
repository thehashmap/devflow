package com.devflow.analysis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "code_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    @Enumerated(EnumType.STRING)
    private AnalysisStatus status;

    @Column(columnDefinition = "TEXT")
    private String analysisResult;

    @Column(nullable = false)
    private Integer complexityScore;

    @Column(nullable = false)
    private Integer qualityScore;

    @Column(nullable = false)
    private Integer maintainabilityScore;

    @ElementCollection
    @CollectionTable(name = "analysis_issues", joinColumns = @JoinColumn(name = "analysis_id"))
    private List<String> issues;

    @ElementCollection
    @CollectionTable(name = "analysis_suggestions", joinColumns = @JoinColumn(name = "analysis_id"))
    private List<String> suggestions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = AnalysisStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == AnalysisStatus.COMPLETED || status == AnalysisStatus.FAILED) {
            completedAt = LocalDateTime.now();
        }
    }

    public enum AnalysisStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }
}