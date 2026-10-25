package com.hyperniche.creators;

import com.hyperniche.creators.dto.CreatorProfileDto;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final UserRepository userRepository;

    public CreatorService(CreatorRepository creatorRepository, UserRepository userRepository) {
        this.creatorRepository = creatorRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<CreatorProfileDto> listCreators(String niche, Pageable pageable) {
        return creatorRepository.findByNiche(niche, pageable).map(CreatorProfileDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public CreatorProfileDto getCreatorProfile(UUID userId) {
        CreatorProfile profile = creatorRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Creator profile not found for id: " + userId));
        return CreatorProfileDto.fromEntity(profile);
    }

    @Transactional
    public CreatorProfileDto updateProfile(UUID userId, CreatorProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        CreatorProfile profile = creatorRepository.findById(userId).orElseGet(() -> {
            CreatorProfile cp = new CreatorProfile(userId);
            cp.setUser(user);
            return cp;
        });

        profile.setNiche(dto.niche());
        profile.setInstagramHandle(dto.instagramHandle());
        profile.setYoutubeHandle(dto.youtubeHandle());
        profile.setTiktokHandle(dto.tiktokHandle());
        profile.setTwitterHandle(dto.twitterHandle());
        profile.setWebsiteUrl(dto.websiteUrl());
        if (dto.followersCount() != null) profile.setFollowersCount(dto.followersCount());
        if (dto.avgViews() != null) profile.setAvgViews(dto.avgViews());
        if (dto.engagementRate() != null) profile.setEngagementRate(dto.engagementRate());
        if (dto.rateReelInr() != null) profile.setRateReelInr(dto.rateReelInr());
        if (dto.ratePostInr() != null) profile.setRatePostInr(dto.ratePostInr());
        if (dto.rateStoryInr() != null) profile.setRateStoryInr(dto.rateStoryInr());
        if (dto.rateVideoInr() != null) profile.setRateVideoInr(dto.rateVideoInr());

        CreatorProfile saved = creatorRepository.save(profile);
        return CreatorProfileDto.fromEntity(saved);
    }
}
