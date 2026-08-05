package com.kscold.blog.stackshare.application.dto;

public record StackShareSettlementCommand(
        String toolName, String billingPeriod, long totalAmount) {}
