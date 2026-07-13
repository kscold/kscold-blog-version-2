package com.kscold.blog.payment.adapter.out.persistence;

import com.kscold.blog.payment.domain.model.PaymentOrder;
import com.kscold.blog.payment.domain.port.out.PaymentOrderRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/** PaymentOrderRepository 포트를 Spring Data MongoDB 로 구현하는 어댑터 */
@Repository
@RequiredArgsConstructor
public class PaymentOrderRepositoryAdapter implements PaymentOrderRepository {

    private final MongoPaymentOrderRepository mongoPaymentOrderRepository;

    @Override
    public PaymentOrder save(PaymentOrder order) {
        return mongoPaymentOrderRepository.save(order);
    }

    @Override
    public Optional<PaymentOrder> findByPaymentId(String paymentId) {
        return mongoPaymentOrderRepository.findByPaymentId(paymentId);
    }
}
