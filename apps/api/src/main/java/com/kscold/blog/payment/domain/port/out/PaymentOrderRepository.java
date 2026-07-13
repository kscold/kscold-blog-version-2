package com.kscold.blog.payment.domain.port.out;

import com.kscold.blog.payment.domain.model.PaymentOrder;
import java.util.Optional;

/** 결제 주문 저장/조회를 위한 아웃바운드 포트 */
public interface PaymentOrderRepository {

    PaymentOrder save(PaymentOrder order);

    Optional<PaymentOrder> findByPaymentId(String paymentId);
}
