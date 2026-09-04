package com.kscold.blog.shared.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** 개인정보성 원문을 저장하지 않도록 고정 길이 단방향 식별자로 변환한다. */
public final class OneWayIdentifierHasher {

    private OneWayIdentifierHasher() {}

    public static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            // SHA-256은 Java 필수 알고리즘이다. 원문을 저장하는 방식으로 후퇴하지 않는다.
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
