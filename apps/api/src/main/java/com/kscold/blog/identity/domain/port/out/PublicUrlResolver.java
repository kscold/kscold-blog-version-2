package com.kscold.blog.identity.domain.port.out;

public interface PublicUrlResolver {

    String resolvePublicUrl(String path);

    long getPasswordResetExpiryMinutes();
}
