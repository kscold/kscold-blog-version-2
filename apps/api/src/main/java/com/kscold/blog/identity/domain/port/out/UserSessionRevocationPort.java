package com.kscold.blog.identity.domain.port.out;

public interface UserSessionRevocationPort {
    void revokeUserSessions(String userId);
}
