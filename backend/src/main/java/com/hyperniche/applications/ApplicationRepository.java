package com.hyperniche.applications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByCreatorIdOrderByCreatedAtDesc(UUID creatorId);
    List<Application> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
    List<Application> findByCampaignBrandIdOrderByCreatedAtDesc(UUID brandId);
    Optional<Application> findByCampaignIdAndCreatorId(UUID campaignId, UUID creatorId);
}
