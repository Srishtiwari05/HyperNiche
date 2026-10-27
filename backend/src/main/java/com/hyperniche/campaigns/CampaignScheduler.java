package com.hyperniche.campaigns;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class CampaignScheduler {

    private static final Logger log = LoggerFactory.getLogger(CampaignScheduler.class);
    private final CampaignRepository campaignRepository;

    public CampaignScheduler(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    /**
     * Runs hourly to automatically transition campaigns whose deadline
     * has passed from ACTIVE to COMPLETED.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expirePassedDeadlineCampaigns() {
        LocalDate today = LocalDate.now();
        List<Campaign> expired = campaignRepository.findByStatusAndDeadlineBefore("ACTIVE", today);
        if (!expired.isEmpty()) {
            for (Campaign c : expired) {
                c.setStatus("COMPLETED");
            }
            campaignRepository.saveAll(expired);
            log.info("Auto-expired {} campaign(s) reaching deadline {}", expired.size(), today);
        }
    }
}
