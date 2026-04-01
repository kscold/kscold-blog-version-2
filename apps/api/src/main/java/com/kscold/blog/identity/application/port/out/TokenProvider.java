package com.kscold.blog.identity.application.port.out;

public interface TokenProvider {
    String createAccessToken(String userId, String role);
    String createRefreshToken(String userId, String role);
    boolean validateAccessToken(String token);
    boolean validateRefreshToken(String token);
    String getUserIdFromAccessToken(String token);
    String getUserIdFromRefreshToken(String token);
    String getRoleFromAccessToken(String token);
}
