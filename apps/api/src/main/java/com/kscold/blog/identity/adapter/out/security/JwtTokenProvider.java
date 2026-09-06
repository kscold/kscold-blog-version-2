package com.kscold.blog.identity.adapter.out.security;

import com.kscold.blog.identity.domain.model.TokenIdentity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import jakarta.annotation.PostConstruct;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import java.util.OptionalLong;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final int MINIMUM_HMAC_KEY_BYTES = 32;
    private static final String CREDENTIAL_VERSION_CLAIM = "credentialVersion";

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

    public String createAccessToken(String userId, String role, long credentialVersion) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "access")
                .claim(CREDENTIAL_VERSION_CLAIM, credentialVersion)
                .issuedAt(now)
                .expiration(validity)
                .signWith(accessSecretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String createRefreshToken(String userId, String role, long credentialVersion) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "refresh")
                .claim(CREDENTIAL_VERSION_CLAIM, credentialVersion)
                .issuedAt(now)
                .expiration(validity)
                .signWith(refreshSecretKey, Jwts.SIG.HS256)
                .compact();
    }

    public Optional<TokenIdentity> parseAccessToken(String token) {
        return parseIdentity(token, accessSecretKey, "access");
    }

    public Optional<TokenIdentity> parseRefreshToken(String token) {
        return parseIdentity(token, refreshSecretKey, "refresh");
    }

    private Optional<TokenIdentity> parseIdentity(
            String token, SecretKey key, String expectedType) {
        try {
            Claims claims = parseClaims(token, key);
            if (!expectedType.equals(claims.get("type"))) {
                return Optional.empty();
            }

            String userId = claims.getSubject();
            if (userId == null || userId.isBlank()) {
                return Optional.empty();
            }

            OptionalLong credentialVersion = parseCredentialVersion(claims);
            if (credentialVersion.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(new TokenIdentity(userId, credentialVersion.getAsLong()));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private OptionalLong parseCredentialVersion(Claims claims) {
        Object value = claims.get(CREDENTIAL_VERSION_CLAIM);
        if (value == null) {
            return OptionalLong.of(0L);
        }

        long credentialVersion;
        if (value instanceof Byte
                || value instanceof Short
                || value instanceof Integer
                || value instanceof Long) {
            credentialVersion = ((Number) value).longValue();
        } else if (value instanceof BigInteger bigInteger) {
            try {
                credentialVersion = bigInteger.longValueExact();
            } catch (ArithmeticException exception) {
                return OptionalLong.empty();
            }
        } else {
            return OptionalLong.empty();
        }

        return credentialVersion >= 0 ? OptionalLong.of(credentialVersion) : OptionalLong.empty();
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey toSecretKey(String value) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(value);
        } catch (IllegalArgumentException ignored) {
            keyBytes = value.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < MINIMUM_HMAC_KEY_BYTES) {
            throw new IllegalStateException("JWT 서명 키는 256비트 이상이어야 합니다.");
        }

        return new SecretKeySpec(keyBytes, Jwts.SIG.HS256.key().build().getAlgorithm());
    }
}
