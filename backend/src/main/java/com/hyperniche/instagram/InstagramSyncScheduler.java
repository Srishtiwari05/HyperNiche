package com.hyperniche.instagram;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InstagramSyncScheduler {
    private static final Logger log = LoggerFactory.getLogger(InstagramSyncScheduler.class);
    private final InstagramIntegrationService instagram;

    public InstagramSyncScheduler(InstagramIntegrationService instagram) {
        this.instagram = instagram;
    }

    @Scheduled(cron = "${instagram.sync-cron:0 15 3 * * *}", zone = "UTC")
    public void syncConnectedAccounts() {
        try {
            instagram.syncAll();
        } catch (RuntimeException ex) {
            log.error("Scheduled Instagram synchronization could not start", ex);
        }
    }
}
