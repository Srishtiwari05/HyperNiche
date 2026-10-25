package com.hyperniche.creators.dto;

import com.hyperniche.creators.CreatorProfile;
import java.math.BigDecimal;
import java.util.UUID;

public record CreatorProfileDto(
    UUID userId,
    String displayName,
    String avatarUrl,
    String bio,
    String niche,
    String instagramHandle,
    String youtubeHandle,
    String tiktokHandle,
    String twitterHandle,
    String websiteUrl,
    Integer followersCount,
    Integer avgViews,
    BigDecimal engagementRate,
    BigDecimal rateReelInr,
    BigDecimal ratePostInr,
    BigDecimal rateStoryInr,
    BigDecimal rateVideoInr,
    Boolean isVerified,
    Boolean verificationPaid
) {
    public static CreatorProfileDto fromEntity(CreatorProfile profile) {
        String name = profile.getUser() != null ? profile.getUser().getDisplayName() : "";
        String avatar = profile.getUser() != null ? profile.getUser().getAvatarUrl() : "";
        String bio = profile.getUser() != null ? profile.getUser().getBio() : "";

        return new CreatorProfileDto(
            profile.getUserId(),
            name,
            avatar,
            bio,
            profile.getNiche(),
            profile.getInstagramHandle(),
            profile.getYoutubeHandle(),
            profile.getTiktokHandle(),
            profile.getTwitterHandle(),
            profile.getWebsiteUrl(),
            profile.getFollowersCount(),
            profile.getAvgViews(),
            profile.getEngagementRate(),
            profile.getRateReelInr(),
            profile.getRatePostInr(),
            profile.getRateStoryInr(),
            profile.getRateVideoInr(),
            profile.getIsVerified(),
            profile.getVerificationPaid()
        );
    }
}
