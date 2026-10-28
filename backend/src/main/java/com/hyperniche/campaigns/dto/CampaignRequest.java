package com.hyperniche.campaigns.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CampaignRequest(
    @NotBlank String title,
    @NotBlank String description,
    @NotBlank String category,
    @NotBlank String platform,
    @NotNull @DecimalMin("1.00") BigDecimal budgetInr,
    String requirements,
    LocalDate deadline,
    String imageUrl,
    String contentType
) {}
