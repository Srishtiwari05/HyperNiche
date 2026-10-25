package com.hyperniche.payments;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import com.hyperniche.payments.dto.OrderResponse;
import com.hyperniche.payments.dto.VerifyPaymentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Creator verification fees and payment processing")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/verification/order")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Create an order for creator verification fee (₹499)")
    public ResponseEntity<ApiResponse<OrderResponse>> createVerificationOrder(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        OrderResponse response = paymentService.createVerificationOrder(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verification/verify")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Confirm payment signature for verification fee")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VerifyPaymentRequest request
    ) {
        boolean verified = paymentService.verifyPayment(principal.getId(), request);
        if (verified) {
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully. Account is now verified.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment verification failed"));
        }
    }
}
