package com.kscold.blog.analytics.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** 분석용 IP를 복원할 수 없는 고정 길이 식별자로 변환한다. */
final class IpAddressHasher {

    private IpAddressHasher() {}

    static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            // SHA-256은 Java 필수 알고리즘이다. 원본 IP를 저장하는 방식으로 후퇴하지 않는다.
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
