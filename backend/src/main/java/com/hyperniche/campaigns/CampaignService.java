package com.hyperniche.campaigns;

import com.hyperniche.campaigns.dto.CampaignRequest;
import com.hyperniche.campaigns.dto.CampaignResponse;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public CampaignService(CampaignRepository campaignRepository, UserRepository userRepository) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<CampaignResponse> listActiveCampaigns(String category, String platform, Pageable pageable) {
        return campaignRepository.findActiveCampaigns(category, platform, pageable)
                .map(CampaignResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CampaignResponse getCampaignById(UUID id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));
        return CampaignResponse.fromEntity(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getMyCampaigns(UUID brandId) {
        return campaignRepository.findByBrandIdOrderByCreatedAtDesc(brandId).stream()
                .map(CampaignResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampaignResponse createCampaign(UUID brandId, CampaignRequest request) {
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand user not found with id: " + brandId));

        Campaign campaign = new Campaign();
        campaign.setBrand(brand);
        campaign.setTitle(request.title());
        campaign.setDescription(request.description());
        campaign.setCategory(request.category());
        campaign.setPlatform(request.platform());
        campaign.setBudgetInr(request.budgetInr());
        campaign.setRequirements(request.requirements());
        campaign.setDeadline(request.deadline());
        campaign.setStatus(CampaignStatus.ACTIVE.name());

        Campaign saved = campaignRepository.save(campaign);
        return CampaignResponse.fromEntity(saved);
    }

    @Transactional
    public CampaignResponse updateCampaign(UUID brandId, UUID campaignId, CampaignRequest request) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + campaignId));

        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new AccessDeniedException("You do not own this campaign");
        }

        campaign.setTitle(request.title());
        campaign.setDescription(request.description());
        campaign.setCategory(request.category());
        campaign.setPlatform(request.platform());
        campaign.setBudgetInr(request.budgetInr());
        campaign.setRequirements(request.requirements());
        campaign.setDeadline(request.deadline());

        Campaign saved = campaignRepository.save(campaign);
        return CampaignResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteCampaign(UUID brandId, UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + campaignId));

        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new AccessDeniedException("You do not own this campaign");
        }

        campaignRepository.delete(campaign);
    }
}
