package com.hyperniche.creators;

import com.hyperniche.users.User;
import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "creator_profiles")
public class CreatorProfile implements Persistable<UUID> {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        this.isNew = false;
    }

    @Column(name = "niche")
    private String niche;

    @Column(name = "instagram_handle")
    private String instagramHandle;

    @Column(name = "youtube_handle")
    private String youtubeHandle;

    @Column(name = "tiktok_handle")
    private String tiktokHandle;

    @Column(name = "twitter_handle")
    private String twitterHandle;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "followers_count")
    private Integer followersCount = 0;

    @Column(name = "avg_views")
    private Integer avgViews = 0;

    @Column(name = "engagement_rate", precision = 5, scale = 2)
    private BigDecimal engagementRate = BigDecimal.ZERO;

    @Column(name = "rate_reel_inr", precision = 10, scale = 2)
    private BigDecimal rateReelInr = BigDecimal.ZERO;

    @Column(name = "rate_post_inr", precision = 10, scale = 2)
    private BigDecimal ratePostInr = BigDecimal.ZERO;

    @Column(name = "rate_story_inr", precision = 10, scale = 2)
    private BigDecimal rateStoryInr = BigDecimal.ZERO;

    @Column(name = "rate_video_inr", precision = 10, scale = 2)
    private BigDecimal rateVideoInr = BigDecimal.ZERO;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_paid")
    private Boolean verificationPaid = false;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public CreatorProfile() {}

    public CreatorProfile(UUID userId) {
        this.userId = userId;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getNiche() { return niche; }
    public void setNiche(String niche) { this.niche = niche; }
    public String getInstagramHandle() { return instagramHandle; }
    public void setInstagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; }
    public String getYoutubeHandle() { return youtubeHandle; }
    public void setYoutubeHandle(String youtubeHandle) { this.youtubeHandle = youtubeHandle; }
    public String getTiktokHandle() { return tiktokHandle; }
    public void setTiktokHandle(String tiktokHandle) { this.tiktokHandle = tiktokHandle; }
    public String getTwitterHandle() { return twitterHandle; }
    public void setTwitterHandle(String twitterHandle) { this.twitterHandle = twitterHandle; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public Integer getFollowersCount() { return followersCount; }
    public void setFollowersCount(Integer followersCount) { this.followersCount = followersCount; }
    public Integer getAvgViews() { return avgViews; }
    public void setAvgViews(Integer avgViews) { this.avgViews = avgViews; }
    public BigDecimal getEngagementRate() { return engagementRate; }
    public void setEngagementRate(BigDecimal engagementRate) { this.engagementRate = engagementRate; }
    public BigDecimal getRateReelInr() { return rateReelInr; }
    public void setRateReelInr(BigDecimal rateReelInr) { this.rateReelInr = rateReelInr; }
    public BigDecimal getRatePostInr() { return ratePostInr; }
    public void setRatePostInr(BigDecimal ratePostInr) { this.ratePostInr = ratePostInr; }
    public BigDecimal getRateStoryInr() { return rateStoryInr; }
    public void setRateStoryInr(BigDecimal rateStoryInr) { this.rateStoryInr = rateStoryInr; }
    public BigDecimal getRateVideoInr() { return rateVideoInr; }
    public void setRateVideoInr(BigDecimal rateVideoInr) { this.rateVideoInr = rateVideoInr; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public Boolean getVerificationPaid() { return verificationPaid; }
    public void setVerificationPaid(Boolean verificationPaid) { this.verificationPaid = verificationPaid; }
    public Instant getUpdatedAt() { return updatedAt; }
}
