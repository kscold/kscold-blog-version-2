package com.kscold.blog.payment.domain.model;

public record PortOnePaymentDetails(
        String status, long paidAmount, String channelType, String channelKey) {}
