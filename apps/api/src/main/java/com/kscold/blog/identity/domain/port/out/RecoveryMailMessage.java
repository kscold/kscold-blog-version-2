package com.kscold.blog.identity.domain.port.out;

public record RecoveryMailMessage(String to, String subject, String plainText, String htmlBody) {}
