package com.kscold.blog.payment;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentOrderRepository extends MongoRepository<PaymentOrder, String> {

    Optional<PaymentOrder> findByPaymentId(String paymentId);
}
