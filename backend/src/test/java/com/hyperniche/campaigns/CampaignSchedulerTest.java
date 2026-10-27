package com.hyperniche.campaigns;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignSchedulerTest {

    @Mock
    private CampaignRepository campaignRepository;

    @InjectMocks
    private CampaignScheduler campaignScheduler;

    @Test
    void testExpiresPastDeadlineCampaigns() {
        Campaign campaign = new Campaign();
        campaign.setStatus("ACTIVE");
        campaign.setDeadline(LocalDate.now().minusDays(1));

        when(campaignRepository.findByStatusAndDeadlineBefore(eq("ACTIVE"), any(LocalDate.class)))
                .thenReturn(List.of(campaign));

        campaignScheduler.expirePassedDeadlineCampaigns();

        assertEquals("COMPLETED", campaign.getStatus());
        verify(campaignRepository, times(1)).saveAll(any());
    }

    @Test
    void testDoesNothingWhenNoExpiredCampaigns() {
        when(campaignRepository.findByStatusAndDeadlineBefore(eq("ACTIVE"), any(LocalDate.class)))
                .thenReturn(List.of());

        campaignScheduler.expirePassedDeadlineCampaigns();

        verify(campaignRepository, never()).saveAll(any());
    }
}
