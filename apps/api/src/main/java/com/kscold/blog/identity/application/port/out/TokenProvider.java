package com.kscold.blog.identity.application.port.out;

public interface TokenProvider {
    String createAccessToken(String userId, String role);
    String createRefreshToken(String userId, String role);
    boolean validateToken(String token);
    boolean isRefreshToken(String token);
    String getUserId(String token);
    String getRole(String token);
}
