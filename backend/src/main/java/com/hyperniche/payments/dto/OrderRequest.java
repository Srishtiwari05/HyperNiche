package com.hyperniche.payments.dto;

import java.math.BigDecimal;

public record OrderRequest(
    String type,
    BigDecimal amountInr
) {}
