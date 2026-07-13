package com.kscold.blog.payment.adapter.out.persistence;

import com.kscold.blog.payment.domain.model.PaymentOrder;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoPaymentOrderRepository extends MongoRepository<PaymentOrder, String> {

    Optional<PaymentOrder> findByPaymentId(String paymentId);
}
