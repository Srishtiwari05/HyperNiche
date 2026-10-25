package com.hyperniche.payments;

import com.hyperniche.creators.CreatorProfile;
import com.hyperniche.creators.CreatorRepository;
import com.hyperniche.payments.dto.OrderRequest;
import com.hyperniche.payments.dto.OrderResponse;
import com.hyperniche.payments.dto.VerifyPaymentRequest;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CreatorRepository creatorRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:rzp_secret_placeholder}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            CreatorRepository creatorRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.creatorRepository = creatorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createVerificationOrder(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long amountPaise = 49900L; // 499 INR
        String orderId = "order_verif_" + UUID.randomUUID().toString().substring(0, 12);

        PaymentTransaction tx = new PaymentTransaction();
        tx.setUser(user);
        tx.setOrderId(orderId);
        tx.setAmountPaise(amountPaise);
        tx.setCurrency("INR");
        tx.setType("VERIFICATION");
        tx.setStatus("CREATED");
        paymentRepository.save(tx);

        return new OrderResponse(orderId, amountPaise, "INR", razorpayKeyId);
    }

    @Transactional
    public boolean verifyPayment(UUID userId, VerifyPaymentRequest request) {
        PaymentTransaction tx = paymentRepository.findByOrderId(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.orderId()));

        boolean isValid = false;

        // Check HMAC signature if real keys are configured
        if (request.signature() != null && !razorpayKeySecret.contains("placeholder")) {
            try {
                String payload = request.orderId() + "|" + request.paymentId();
                Mac hmac = Mac.getInstance("HmacSHA256");
                SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
                hmac.init(secretKey);
                byte[] hash = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
                String expectedSignature = HexFormat.of().formatHex(hash);
                isValid = MessageDigest.isEqual(expectedSignature.getBytes(), request.signature().getBytes());
            } catch (Exception ignored) {}
        } else {
            // Test mode / sandbox approval
            isValid = true;
        }

        if (isValid) {
            tx.setPaymentId(request.paymentId());
            tx.setStatus("PAID");
            paymentRepository.save(tx);

            if ("VERIFICATION".equalsIgnoreCase(tx.getType())) {
                CreatorProfile profile = creatorRepository.findById(userId).orElseGet(() -> {
                    CreatorProfile cp = new CreatorProfile(userId);
                    cp.setUser(tx.getUser());
                    return cp;
                });
                profile.setIsVerified(true);
                profile.setVerificationPaid(true);
                creatorRepository.save(profile);
            }
            return true;
        }

        tx.setStatus("FAILED");
        paymentRepository.save(tx);
        return false;
    }
}
