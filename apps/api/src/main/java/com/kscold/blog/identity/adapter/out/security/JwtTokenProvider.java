package com.kscold.blog.identity.adapter.out.security;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${jwt.access-token-expiration}")
    private long validityInMilliseconds;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenValidity;

    private SecretKey accessSecretKey;
    private SecretKey refreshSecretKey;

    @PostConstruct
    protected void init() {
        accessSecretKey = toSecretKey(secret);
        refreshSecretKey = toSecretKey(refreshSecret);
    }

    public String createAccessToken(String userId, String role) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(validity)
                .signWith(accessSecretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String createRefreshToken(String userId, String role) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(validity)
                .signWith(refreshSecretKey, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token, accessSecretKey);
            Object type = claims.get("type");
            // 기존 토큰(type claim 없음)도 액세스로 허용, 리프레시만 거부
            return !"refresh".equals(type);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token, refreshSecretKey);
            return "refresh".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String getUserIdFromAccessToken(String token) {
        return parseClaims(token, accessSecretKey).getSubject();
    }

    public String getUserIdFromRefreshToken(String token) {
        return parseClaims(token, refreshSecretKey).getSubject();
    }

    public String getRoleFromAccessToken(String token) {
        return (String) parseClaims(token, accessSecretKey).get("role");
    }

    public Authentication getAuthentication(String token) {
        try {
            Claims claims = parseClaims(token, accessSecretKey);
            if (!"access".equals(claims.get("type"))) {
                throw new BusinessException(ErrorCode.INVALID_TOKEN);
            }
            String userId = claims.getSubject();
            return new UsernamePasswordAuthenticationToken(userId, "", Collections.emptyList());
        } catch (JwtException | IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey toSecretKey(String value) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(value);
        } catch (IllegalArgumentException ignored) {
            keyBytes = value.getBytes(StandardCharsets.UTF_8);
        }

        return new SecretKeySpec(
                keyBytes,
                Jwts.SIG.HS256.key().build().getAlgorithm()
        );
    }
}
