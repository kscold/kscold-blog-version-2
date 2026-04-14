package com.kscold.blog.identity.application.port.out;

public interface RecoveryMailSender {

    boolean isAvailable();

    void send(RecoveryMailMessage message);
}
