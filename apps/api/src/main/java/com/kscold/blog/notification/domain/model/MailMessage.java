package com.kscold.blog.notification.domain.model;

/** SMTP 같은 외부 메일 채널로 전달할 완성된 메시지. */
public record MailMessage(String to, String subject, String plainText, String htmlBody) {}
