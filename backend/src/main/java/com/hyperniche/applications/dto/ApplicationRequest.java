package com.hyperniche.applications.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ApplicationRequest(
    @NotNull UUID campaignId,
    @NotBlank String pitch,
    @NotNull @DecimalMin("1.00") BigDecimal proposedRateInr
) {}
