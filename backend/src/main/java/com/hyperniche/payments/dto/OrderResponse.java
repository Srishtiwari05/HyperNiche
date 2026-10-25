package com.hyperniche.payments.dto;

public record OrderResponse(
    String orderId,
    Long amountPaise,
    String currency,
    String keyId
) {}
