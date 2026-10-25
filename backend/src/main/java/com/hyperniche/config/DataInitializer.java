package com.hyperniche.config;

import com.hyperniche.campaigns.Campaign;
import com.hyperniche.campaigns.CampaignRepository;
import com.hyperniche.creators.CreatorProfile;
import com.hyperniche.creators.CreatorRepository;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "hyperniche.seed-demo-data", havingValue = "true", matchIfMissing = false)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;
    private final CampaignRepository campaignRepository;

    public DataInitializer(UserRepository userRepository, CreatorRepository creatorRepository, CampaignRepository campaignRepository) {
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
        this.campaignRepository = campaignRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        // Brands
        User brand1 = new User(UUID.randomUUID(), "brand@kansowear.com", "BRAND", "Kanso Wear",
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400",
                "Minimalist Japanese-inspired streetwear brand based in Mumbai.");
        User brand2 = new User(UUID.randomUUID(), "collab@glowlabindia.com", "BRAND", "GlowLab Skincare",
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400",
                "Clean organic skincare formulations crafted for Indian skin types.");
        User brand3 = new User(UUID.randomUUID(), "partnerships@fitfuel.in", "BRAND", "FitFuel Supplements",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
                "Clean performance nutrition designed for high performance athletes.");
        User brand4 = new User(UUID.randomUUID(), "marketing@devpulse.io", "BRAND", "DevPulse SaaS",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400",
                "Next-generation developer toolchain and cloud debugger.");

        brand1 = userRepository.save(brand1);
        brand2 = userRepository.save(brand2);
        brand3 = userRepository.save(brand3);
        brand4 = userRepository.save(brand4);
        userRepository.flush();

        // Campaigns
        Campaign camp1 = new Campaign();
        camp1.setBrand(brand1);
        camp1.setTitle("Streetwear Campaign – SS25 Drop");
        camp1.setDescription("Looking for minimalist aesthetic creators to showcase our SS25 collection drop in authentic 60-second reels.");
        camp1.setCategory("Fashion");
        camp1.setPlatform("Instagram Reels");
        camp1.setBudgetInr(new BigDecimal("35000.00"));
        camp1.setRequirements("45K+ followers, Fashion/Lifestyle niche, Mumbai/Delhi/Bengaluru based preferred.");
        camp1.setDeadline(LocalDate.now().plusMonths(2));
        camp1.setStatus("ACTIVE");
        camp1.setApplicationsCount(6);

        Campaign camp2 = new Campaign();
        camp2.setBrand(brand2);
        camp2.setTitle("Clean Beauty Routine – Winter Edit");
        camp2.setDescription("Seeking beauty creators to create 'Get Ready With Me' winter skincare routines featuring our barrier serum.");
        camp2.setCategory("Beauty");
        camp2.setPlatform("Instagram Reels");
        camp2.setBudgetInr(new BigDecimal("22000.00"));
        camp2.setRequirements("Beauty/Skincare niche, 20K+ followers, authentic UGC-style video.");
        camp2.setDeadline(LocalDate.now().plusMonths(1));
        camp2.setStatus("ACTIVE");
        camp2.setApplicationsCount(12);

        Campaign camp3 = new Campaign();
        camp3.setBrand(brand3);
        camp3.setTitle("Plant Protein Launch – Fitness & Gym Creators");
        camp3.setDescription("Launch campaign for our new plant-based isolate protein. Seeking fitness athletes to review mixability & recovery.");
        camp3.setCategory("Fitness");
        camp3.setPlatform("YouTube Shorts");
        camp3.setBudgetInr(new BigDecimal("28000.00"));
        camp3.setRequirements("Fitness/Health niche, 15K+ followers, demonstration of workout & shaker prep.");
        camp3.setDeadline(LocalDate.now().plusMonths(2));
        camp3.setStatus("ACTIVE");
        camp3.setApplicationsCount(3);

        Campaign camp4 = new Campaign();
        camp4.setBrand(brand4);
        camp4.setTitle("Developer Toolchain Screencast & Code Walkthrough");
        camp4.setDescription("Looking for tech & developer creators to showcase how DevPulse speeds up backend debugging in 60 seconds.");
        camp4.setCategory("Technology");
        camp4.setPlatform("Instagram Reels");
        camp4.setBudgetInr(new BigDecimal("18000.00"));
        camp4.setRequirements("Software developer / tech creator, 10K+ followers, live IDE screencast.");
        camp4.setDeadline(LocalDate.now().plusMonths(3));
        camp4.setStatus("ACTIVE");
        camp4.setApplicationsCount(8);

        campaignRepository.save(camp1);
        campaignRepository.save(camp2);
        campaignRepository.save(camp3);
        campaignRepository.save(camp4);

        // Creators
        createCreator(
                "Aarav Sharma", "aarav@hyperniche.dev",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                "AI tools educator & indie SaaS reviewer. Helping 150K+ developers build smarter.",
                "Technology", "@aaravcodes", 148000, 45000, new BigDecimal("5.40"),
                new BigDecimal("18000.00"), true
        );

        createCreator(
                "Priya Nair", "priya@hyperniche.dev",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
                "Clean beauty, skincare routines & holistic wellness advocate. Kerala based.",
                "Beauty", "@priyabeauty", 120000, 38000, new BigDecimal("6.80"),
                new BigDecimal("22000.00"), true
        );

        createCreator(
                "Kavya Sen", "kavya@hyperniche.dev",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                "Fashion & sustainable lifestyle creator. Mumbai based. DM for collabs.",
                "Fashion", "@kavyasen", 45000, 18000, new BigDecimal("4.20"),
                new BigDecimal("15000.00"), true
        );

        createCreator(
                "Arjun Mehta", "arjun@hyperniche.dev",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
                "Certified personal trainer. Gym motivation, nutrition & lifestyle content.",
                "Fitness", "@arjunlifts", 89000, 32000, new BigDecimal("5.90"),
                new BigDecimal("28000.00"), true
        );

        createCreator(
                "Sneha Reddy", "sneha@hyperniche.dev",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
                "Home chef & food creator. South Indian recipes with a modern twist.",
                "Food", "@snehacooks", 67000, 24000, new BigDecimal("4.80"),
                new BigDecimal("20000.00"), true
        );

        createCreator(
                "Dev Sharma", "dev@hyperniche.dev",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
                "Solo backpacker & travel vlogger. Budget travel across India & SE Asia.",
                "Travel", "@devtravels", 210000, 65000, new BigDecimal("5.10"),
                new BigDecimal("55000.00"), true
        );
    }

    private void createCreator(
            String name, String email, String avatar, String bio, String niche,
            String instagram, int followers, int avgViews, BigDecimal engRate,
            BigDecimal rateReel, boolean verified
    ) {
        User user = new User(UUID.randomUUID(), email, "CREATOR", name, avatar, bio);
        user = userRepository.save(user);
        userRepository.flush();

        CreatorProfile profile = new CreatorProfile();
        profile.setUser(user);
        profile.setUserId(user.getId());
        profile.setNiche(niche);
        profile.setInstagramHandle(instagram);
        profile.setFollowersCount(followers);
        profile.setAvgViews(avgViews);
        profile.setEngagementRate(engRate);
        profile.setRateReelInr(rateReel);
        profile.setIsVerified(verified);
        profile.setVerificationPaid(verified);
        creatorRepository.save(profile);
    }
}
