package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.AccessRequest;
import org.springframework.lang.Nullable;

public interface AccessRequestMailSender {

    boolean isAvailable();

    void sendApproved(
            @Nullable String toEmail, @Nullable String displayName, AccessRequest request);
}
