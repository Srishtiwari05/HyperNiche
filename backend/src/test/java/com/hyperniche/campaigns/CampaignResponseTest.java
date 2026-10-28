package com.hyperniche.campaigns;

import com.hyperniche.campaigns.dto.CampaignResponse;
import com.hyperniche.users.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CampaignResponseTest {

    @Test
    void mapsImageUrlAndContentTypeFromEntity() {
        User brand = new User(
                UUID.randomUUID(),
                "brand@example.com",
                "BRAND",
                "Kanso Wear",
                "https://cdn.example/avatar.png",
                "Streetwear"
        );
        Campaign campaign = new Campaign();
        campaign.setBrand(brand);
        campaign.setTitle("SS25 Drop");
        campaign.setDescription("Reels for the summer drop");
        campaign.setCategory("Fashion");
        campaign.setPlatform("Instagram Reels");
        campaign.setBudgetInr(new BigDecimal("35000"));
        campaign.setDeadline(LocalDate.of(2027, 4, 30));
        campaign.setStatus("ACTIVE");
        campaign.setImageUrl("https://cdn.example/campaign.jpg");
        campaign.setContentType("1x 60s Reel");

        CampaignResponse response = CampaignResponse.fromEntity(campaign);

        assertEquals("https://cdn.example/campaign.jpg", response.imageUrl());
        assertEquals("1x 60s Reel", response.contentType());
        assertEquals("Kanso Wear", response.brandName());
        assertEquals("https://cdn.example/avatar.png", response.brandAvatar());
    }
}
