package com.kscold.blog.payment.domain.model;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payment_orders")
public class PaymentOrder {

    @Id private String id;

    @Indexed(unique = true)
    private String paymentId;

    @Indexed private String userId;

    @Indexed private String paymentAccessToken;

    private String programKey;
    private String orderName;
    private int totalAmount;
    private String currency;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private PaymentOrderStatus status;
    private String portOneStatus;
    private String failureMessage;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant paidAt;

    public void markPaid(String portOneStatus) {
        this.status = PaymentOrderStatus.PAID;
        this.portOneStatus = portOneStatus;
        this.failureMessage = null;
        this.paidAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void markFailed(String portOneStatus, String failureMessage) {
        this.status = PaymentOrderStatus.FAILED;
        this.portOneStatus = portOneStatus;
        this.failureMessage = failureMessage;
        this.updatedAt = Instant.now();
    }
}
