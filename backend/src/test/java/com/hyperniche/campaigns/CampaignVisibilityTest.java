package com.hyperniche.campaigns;

import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@Rollback
class CampaignVisibilityTest {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void activeCampaignsRemainVisibleAcrossBrandAccounts() {
        User brandOne = new User(UUID.randomUUID(), "brand-one@example.com", "BRAND", "Brand One", "", "");
        User brandTwo = new User(UUID.randomUUID(), "brand-two@example.com", "BRAND", "Brand Two", "", "");
        userRepository.save(brandOne);
        userRepository.save(brandTwo);

        Campaign campaignOne = new Campaign();
        campaignOne.setBrand(brandOne);
        campaignOne.setTitle("Spring drops");
        campaignOne.setDescription("A creator campaign for the spring collection");
        campaignOne.setCategory("Fashion");
        campaignOne.setPlatform("Instagram Reels");
        campaignOne.setBudgetInr(new BigDecimal("25000"));
        campaignOne.setDeadline(LocalDate.now().plusDays(14));
        campaignOne.setStatus(CampaignStatus.ACTIVE.name());

        Campaign campaignTwo = new Campaign();
        campaignTwo.setBrand(brandTwo);
        campaignTwo.setTitle("Creator market test");
        campaignTwo.setDescription("A second active campaign for all brands");
        campaignTwo.setCategory("Beauty");
        campaignTwo.setPlatform("Instagram Reels");
        campaignTwo.setBudgetInr(new BigDecimal("35000"));
        campaignTwo.setDeadline(LocalDate.now().plusDays(20));
        campaignTwo.setStatus(CampaignStatus.ACTIVE.name());

        campaignRepository.save(campaignOne);
        campaignRepository.save(campaignTwo);

        var campaigns = campaignRepository.findActiveCampaigns(null, null, PageRequest.of(0, 50));

        assertTrue(campaigns.getTotalElements() >= 2);
        assertTrue(campaigns.stream().anyMatch(c -> c.getTitle().equals("Spring drops")));
        assertTrue(campaigns.stream().anyMatch(c -> c.getTitle().equals("Creator market test")));
    }
}
