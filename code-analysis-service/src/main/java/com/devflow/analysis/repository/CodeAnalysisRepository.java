package com.devflow.analysis.repository;

import com.devflow.analysis.entity.CodeAnalysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {

    List<CodeAnalysis> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<CodeAnalysis> findByUserId(String userId, Pageable pageable);

    List<CodeAnalysis> findByStatus(CodeAnalysis.AnalysisStatus status);

    List<CodeAnalysis> findByFileType(String fileType);

    @Query("SELECT ca FROM CodeAnalysis ca WHERE ca.userId = :userId AND ca.status = :status")
    List<CodeAnalysis> findByUserIdAndStatus(@Param("userId") String userId,
                                             @Param("status") CodeAnalysis.AnalysisStatus status);

    @Query("SELECT ca FROM CodeAnalysis ca WHERE ca.createdAt BETWEEN :startDate AND :endDate")
    List<CodeAnalysis> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(ca.qualityScore) FROM CodeAnalysis ca WHERE ca.userId = :userId AND ca.status = 'COMPLETED'")
    Optional<Double> findAverageQualityScoreByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(ca) FROM CodeAnalysis ca WHERE ca.userId = :userId AND ca.status = 'COMPLETED'")
    Long countCompletedAnalysesByUserId(@Param("userId") String userId);

    @Query("SELECT ca.fileType, COUNT(ca) FROM CodeAnalysis ca WHERE ca.userId = :userId GROUP BY ca.fileType")
    List<Object[]> findFileTypeDistributionByUserId(@Param("userId") String userId);
}