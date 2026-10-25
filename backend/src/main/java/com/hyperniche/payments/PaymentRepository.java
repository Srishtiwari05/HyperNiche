package com.hyperniche.payments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentTransaction, UUID> {
    Optional<PaymentTransaction> findByOrderId(String orderId);
}
