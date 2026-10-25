package com.hyperniche.payments.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyPaymentRequest(
    @NotBlank String orderId,
    @NotBlank String paymentId,
    String signature
) {}
