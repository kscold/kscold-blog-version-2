package com.kscold.blog.identity.domain.port.out;

public interface RecoveryMailSender {

    boolean isAvailable();

    void send(RecoveryMailMessage message);
}
