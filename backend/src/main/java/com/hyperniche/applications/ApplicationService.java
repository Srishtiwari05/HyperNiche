package com.hyperniche.applications;

import com.hyperniche.applications.dto.ApplicationRequest;
import com.hyperniche.applications.dto.ApplicationResponse;
import com.hyperniche.campaigns.Campaign;
import com.hyperniche.campaigns.CampaignRepository;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            CampaignRepository campaignRepository,
            UserRepository userRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApplicationResponse applyToCampaign(UUID creatorId, ApplicationRequest request) {
        Campaign campaign = campaignRepository.findById(request.campaignId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (!"ACTIVE".equalsIgnoreCase(campaign.getStatus())) {
            throw new IllegalArgumentException("Cannot apply to inactive campaign");
        }

        if (applicationRepository.findByCampaignIdAndCreatorId(campaign.getId(), creatorId).isPresent()) {
            throw new IllegalArgumentException("You have already applied to this campaign");
        }

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        Application application = new Application();
        application.setCampaign(campaign);
        application.setCreator(creator);
        application.setPitch(request.pitch());
        application.setProposedRateInr(request.proposedRateInr());
        application.setStatus(ApplicationStatus.PENDING.name());

        campaign.setApplicationsCount(campaign.getApplicationsCount() + 1);
        campaignRepository.save(campaign);

        Application saved = applicationRepository.save(application);
        return ApplicationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(UUID creatorId) {
        return applicationRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId).stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getCampaignApplications(UUID brandId, UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new AccessDeniedException("You do not own this campaign");
        }

        return applicationRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId).stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getBrandApplications(UUID brandId) {
        return applicationRepository.findByCampaignBrandIdOrderByCreatedAtDesc(brandId).stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(UUID brandId, UUID applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (!application.getCampaign().getBrand().getId().equals(brandId)) {
            throw new AccessDeniedException("You do not own the campaign for this application");
        }

        application.setStatus(status.toUpperCase());
        Application saved = applicationRepository.save(application);
        return ApplicationResponse.fromEntity(saved);
    }
}
