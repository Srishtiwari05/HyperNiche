package com.hyperniche.applications;

import com.hyperniche.campaigns.Campaign;
import com.hyperniche.users.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"campaign_id", "creator_id"})
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(name = "pitch", columnDefinition = "TEXT", nullable = false)
    private String pitch;

    @Column(name = "proposed_rate_inr", precision = 12, scale = 2, nullable = false)
    private BigDecimal proposedRateInr;

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Application() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Campaign getCampaign() { return campaign; }
    public void setCampaign(Campaign campaign) { this.campaign = campaign; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public String getPitch() { return pitch; }
    public void setPitch(String pitch) { this.pitch = pitch; }
    public BigDecimal getProposedRateInr() { return proposedRateInr; }
    public void setProposedRateInr(BigDecimal proposedRateInr) { this.proposedRateInr = proposedRateInr; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
