package com.kscold.blog.identity.application.port.out;

public record RecoveryMailMessage(
        String to,
        String subject,
        String plainText,
        String htmlBody
) {
}
