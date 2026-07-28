package com.kscold.blog.payment.domain.port.out;

import com.kscold.blog.payment.domain.model.PortOnePaymentDetails;

public interface PortOnePaymentProvider {

    PortOnePaymentDetails getPayment(String paymentId);
}
