package com.hyperniche.campaigns;

import com.hyperniche.users.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private User brand;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "budget_inr", precision = 12, scale = 2, nullable = false)
    private BigDecimal budgetInr;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @Column(name = "applications_count")
    private Integer applicationsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Campaign() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getBrand() { return brand; }
    public void setBrand(User brand) { this.brand = brand; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public BigDecimal getBudgetInr() { return budgetInr; }
    public void setBudgetInr(BigDecimal budgetInr) { this.budgetInr = budgetInr; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getApplicationsCount() { return applicationsCount; }
    public void setApplicationsCount(Integer applicationsCount) { this.applicationsCount = applicationsCount; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
