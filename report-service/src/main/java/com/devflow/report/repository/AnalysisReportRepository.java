package com.devflow.report.repository;

import com.devflow.report.model.AnalysisReport;
import com.devflow.report.model.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisReportRepository extends MongoRepository<AnalysisReport, String> {

    // Find reports by user
    Page<AnalysisReport> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    // Find reports by project
    List<AnalysisReport> findByUserIdAndProjectNameOrderByCreatedAtDesc(String userId, String projectName);

    // Find reports by status
    List<AnalysisReport> findByStatus(ReportStatus status);

    // Find recent reports
    List<AnalysisReport> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);

    // Find reports by language
    List<AnalysisReport> findByUserIdAndLanguage(String userId, String language);

    // Custom aggregation queries
    @Query("{ 'userId': ?0, 'status': 'COMPLETED', 'createdAt': { $gte: ?1 } }")
    List<AnalysisReport> findCompletedReportsSince(String userId, LocalDateTime since);

    // Count reports by user and status
    long countByUserIdAndStatus(String userId, ReportStatus status);

    // Find latest report for a project
    Optional<AnalysisReport> findTopByUserIdAndProjectNameOrderByCreatedAtDesc(String userId, String projectName);

    // Delete old reports
    void deleteByCreatedAtBefore(LocalDateTime before);
}