package com.hyperniche.campaigns;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    @Query(value = "SELECT c FROM Campaign c JOIN FETCH c.brand b WHERE c.status = 'ACTIVE' " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:platform IS NULL OR LOWER(c.platform) = LOWER(:platform))",
           countQuery = "SELECT count(c) FROM Campaign c WHERE c.status = 'ACTIVE' " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:platform IS NULL OR LOWER(c.platform) = LOWER(:platform))")
    Page<Campaign> findActiveCampaigns(
            @Param("category") String category,
            @Param("platform") String platform,
            Pageable pageable
    );

    List<Campaign> findByBrandIdOrderByCreatedAtDesc(UUID brandId);

    List<Campaign> findByStatusAndDeadlineBefore(String status, LocalDate date);
}
